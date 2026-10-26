import { Router } from "express"
import multer from "multer"
import prisma from "../lib/prisma.js"
import { requireWorkspace } from "../middleware/auth.js"
import { queueSourceProcessing } from "../services/knowledgeProcessor.js"
import { generateEmbedding, cosineSimilarity } from "../services/embedding.js"
import type { SourceType } from "@prisma/client"

const router = Router()

// Configure multer for file uploads in memory (max 20MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase() || ""
    const allowed = ["pdf", "docx", "txt"]
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed (max 20MB)."))
    }
  },
})

// Protect all knowledge base routes with requireWorkspace
router.use(requireWorkspace)

// ── 1. POST /api/knowledge/upload (PDF, DOCX, TXT, max 20MB) ──
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ message: "File exceeds maximum size of 20MB." })
          return
        }
        res.status(400).json({ message: err.message })
        return
      } else if (err) {
        res.status(400).json({ message: err.message })
        return
      }
      next()
    })
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded. Please select a PDF, DOCX, or TXT file." })
        return
      }

      const workspaceId = req.workspaceId!
      const originalname = req.file.originalname
      const category = (req.body.category as string) || "Document"

      const source = await prisma.source.create({
        data: {
          workspaceId,
          type: "document",
          status: "processing",
          title: originalname,
          category,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
      })

      // Kick off background processing
      queueSourceProcessing(source.id, workspaceId, {
        buffer: req.file.buffer,
        originalname,
        mimetype: req.file.mimetype,
      })

      res.status(201).json({
        message: "File uploaded and scheduled for processing",
        source,
      })
    } catch (error) {
      next(error)
    }
  },
)

// ── 2. POST /api/knowledge/add-url ──
router.post("/add-url", async (req, res, next) => {
  try {
    const { url, title, category } = req.body

    if (!url || typeof url !== "string") {
      res.status(400).json({ message: "A valid website URL is required." })
      return
    }

    try {
      new URL(url)
    } catch {
      res.status(400).json({ message: "Invalid URL format. Please include http:// or https://" })
      return
    }

    const workspaceId = req.workspaceId!
    const cleanTitle = title?.trim() || url

    const source = await prisma.source.create({
      data: {
        workspaceId,
        type: "website",
        status: "processing",
        title: cleanTitle,
        url,
        category: category?.trim() || "Website",
      },
    })

    // Kick off background web page extraction and chunking
    queueSourceProcessing(source.id, workspaceId)

    res.status(201).json({
      message: "Website added and scheduled for extraction",
      source,
    })
  } catch (error) {
    next(error)
  }
})

// ── 3. POST /api/knowledge/faq ──
router.post("/faq", async (req, res, next) => {
  try {
    const { question, answer, category } = req.body

    if (!question || !question.trim()) {
      res.status(400).json({ message: "Question is required." })
      return
    }

    if (!answer || !answer.trim()) {
      res.status(400).json({ message: "Answer is required." })
      return
    }

    const workspaceId = req.workspaceId!
    const formattedContent = `Question: ${question.trim()}\nAnswer: ${answer.trim()}`

    const source = await prisma.source.create({
      data: {
        workspaceId,
        type: "faq",
        status: "processing",
        title: question.trim(),
        content: formattedContent,
        category: category?.trim() || "FAQ",
      },
    })

    // Kick off background chunking and embedding
    queueSourceProcessing(source.id, workspaceId)

    res.status(201).json({
      message: "FAQ created and scheduled for embedding",
      source,
    })
  } catch (error) {
    next(error)
  }
})

// ── 4. PUT /api/knowledge/faq/:id ──
router.put("/faq/:id", async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { question, answer, category } = req.body
    const workspaceId = req.workspaceId!

    const existing = await prisma.source.findFirst({
      where: { id, workspaceId, type: "faq" },
    })

    if (!existing) {
      res.status(404).json({ message: "FAQ not found." })
      return
    }

    const updatedTitle = question?.trim() || existing.title
    const updatedContent =
      question && answer
        ? `Question: ${question.trim()}\nAnswer: ${answer.trim()}`
        : existing.content

    const source = await prisma.source.update({
      where: { id },
      data: {
        title: updatedTitle,
        content: updatedContent,
        category: category?.trim() || existing.category,
        status: "processing",
        errorMessage: null,
      },
    })

    // Re-process chunks in background
    queueSourceProcessing(source.id, workspaceId)

    res.json({
      message: "FAQ updated and scheduled for re-processing",
      source,
    })
  } catch (error) {
    next(error)
  }
})

// ── 5. DELETE /api/knowledge/faq/:id and /api/knowledge/sources/:id ──
router.delete("/faq/:id", deleteSourceHandler)
router.delete("/sources/:id", deleteSourceHandler)

async function deleteSourceHandler(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const workspaceId = req.workspaceId!

    const existing = await prisma.source.findFirst({
      where: { id, workspaceId },
    })

    if (!existing) {
      res.status(404).json({ message: "Source not found." })
      return
    }

    await prisma.source.delete({
      where: { id },
    })

    res.json({ success: true, message: "Source deleted successfully." })
  } catch (error) {
    next(error)
  }
}

// ── 6. POST /api/knowledge/sources/:id/reprocess ──
router.post("/sources/:id/reprocess", async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const workspaceId = req.workspaceId!

    const source = await prisma.source.findFirst({
      where: { id, workspaceId },
    })

    if (!source) {
      res.status(404).json({ message: "Source not found." })
      return
    }

    await prisma.source.update({
      where: { id },
      data: {
        status: "processing",
        errorMessage: null,
      },
    })

    queueSourceProcessing(source.id, workspaceId)

    res.json({ success: true, message: "Source queued for re-processing", source })
  } catch (error) {
    next(error)
  }
})

// ── 7. GET /api/knowledge/sources (list, search, filter, pagination) ──
router.get("/sources", async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId!
    const search = typeof req.query.search === "string" ? req.query.search.trim() : ""
    const typeQuery = typeof req.query.type === "string" ? req.query.type.toLowerCase().trim() : "all"
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20))
    const skip = (page - 1) * limit

    const where: import("@prisma/client").Prisma.SourceWhereInput = {
      workspaceId,
    }

    if (typeQuery && typeQuery !== "all") {
      const typeMap: Record<string, SourceType> = {
        document: "document",
        documents: "document",
        website: "website",
        websites: "website",
        faq: "faq",
        faqs: "faq",
      }
      if (typeMap[typeQuery]) {
        where.type = typeMap[typeQuery]
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { url: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    const [sources, total, totalReady, totalProcessing, totalFailed, totalChunks] =
      await Promise.all([
        prisma.source.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
          include: {
            _count: {
              select: { chunks: true },
            },
          },
        }),
        prisma.source.count({ where }),
        prisma.source.count({ where: { workspaceId, status: "ready" } }),
        prisma.source.count({ where: { workspaceId, status: "processing" } }),
        prisma.source.count({ where: { workspaceId, status: "failed" } }),
        prisma.chunk.count({ where: { workspaceId } }),
      ])

    const totalPages = Math.ceil(total / limit) || 1

    res.json({
      sources,
      total,
      page,
      limit,
      totalPages,
      stats: {
        totalSources: totalReady + totalProcessing + totalFailed,
        readySources: totalReady,
        processingSources: totalProcessing,
        failedSources: totalFailed,
        totalChunks,
      },
    })
  } catch (error) {
    next(error)
  }
})

// ── 8. GET /api/knowledge/search (Search query returning chunks) ──
router.get("/search", async (req, res, next) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : ""
    const workspaceId = req.workspaceId!

    if (!query) {
      res.status(400).json({ message: "Search query 'q' parameter is required." })
      return
    }

    const queryEmbedding = await generateEmbedding(query)
    const vectorString = `[${queryEmbedding.join(",")}]`

    let chunks: Array<{
      id: string
      text: string
      chunkIndex: number
      sourceId: string
      sourceTitle: string
      sourceType: string
      similarity: number
    }> = []

    // 1. Try vector similarity search with pgvector (<=> cosine distance)
    try {
      const rawResults = await prisma.$queryRawUnsafe<
        Array<{
          id: string
          text: string
          chunk_index: number
          source_id: string
          title: string
          type: string
          similarity: number
        }>
      >(
        `SELECT c.id, c.text, c.chunk_index, c.source_id, s.title, s.type,
                (1 - (c.embedding <=> $1::vector)) as similarity
         FROM chunks c
         JOIN sources s ON s.id = c.source_id
         WHERE c.workspace_id = $2 AND c.embedding IS NOT NULL
         ORDER BY c.embedding <=> $1::vector ASC
         LIMIT 8`,
        vectorString,
        workspaceId,
      )

      chunks = rawResults.map((r) => ({
        id: r.id,
        text: r.text,
        chunkIndex: r.chunk_index,
        sourceId: r.source_id,
        sourceTitle: r.title,
        sourceType: r.type,
        similarity: Number(r.similarity.toFixed(4)),
      }))
    } catch {
      // 2. Fallback to keyword and in-memory cosine matching
      const searchTerms = query.split(/\s+/).filter((w) => w.length > 2)
      const orConditions: Array<{ text: { contains: string; mode?: "insensitive" | "default" } }> = [
        { text: { contains: query, mode: "insensitive" } },
      ]
      for (const word of searchTerms) {
        orConditions.push({ text: { contains: word, mode: "insensitive" } })
      }

      const dbChunks = (await (prisma.chunk as any).findMany({
        where: {
          workspaceId,
          OR: orConditions,
        },
        take: 12,
        include: {
          source: {
            select: { id: true, title: true, type: true },
          },
        },
      })) as Array<{
        id: string
        text: string
        chunkIndex: number
        sourceId: string
        source: { id: string; title: string; type: string }
      }>

      chunks = dbChunks.map((c) => {
        // Approximate similarity score based on term overlap
        const words = query.toLowerCase().split(/\s+/)
        const matches = words.filter((w) => c.text.toLowerCase().includes(w)).length
        const similarity = Number((0.5 + 0.5 * (matches / Math.max(1, words.length))).toFixed(3))

        return {
          id: c.id,
          text: c.text,
          chunkIndex: c.chunkIndex,
          sourceId: c.source?.id || c.sourceId,
          sourceTitle: c.source?.title || "Document",
          sourceType: c.source?.type || "document",
          similarity,
        }
      })
    }

    res.json({
      query,
      count: chunks.length,
      chunks,
    })
  } catch (error) {
    next(error)
  }
})

export default router
