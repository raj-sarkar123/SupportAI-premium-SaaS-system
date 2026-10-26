import prisma from "../lib/prisma.js"
import {
  extractTextFromDocument,
  extractTextFromUrl,
  chunkText,
} from "./textExtraction.js"
import { generateEmbedding } from "./embedding.js"

export interface ProcessFileOptions {
  buffer: Buffer
  originalname: string
  mimetype: string
}

/**
 * Processes a knowledge source asynchronously in the background.
 * Extracts text, splits it into chunks, generates vector embeddings,
 * stores the chunks, and updates the source status to "ready" or "failed".
 */
export function queueSourceProcessing(
  sourceId: string,
  workspaceId: string,
  fileOptions?: ProcessFileOptions,
): void {
  // Fire-and-forget in the background
  setImmediate(async () => {
    try {
      await processSource(sourceId, workspaceId, fileOptions)
    } catch (err: unknown) {
      console.error(`[KnowledgeProcessor] Unhandled error processing source ${sourceId}:`, err)
    }
  })
}

export async function processSource(
  sourceId: string,
  workspaceId: string,
  fileOptions?: ProcessFileOptions,
): Promise<void> {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
  })

  if (!source) {
    console.warn(`[KnowledgeProcessor] Source ${sourceId} not found, skipping processing.`)
    return
  }

  // Set status to processing
  await prisma.source.update({
    where: { id: sourceId },
    data: {
      status: "processing",
      errorMessage: null,
    },
  })

  try {
    let extractedText = ""
    let extractedTitle = source.title

    if (source.type === "document") {
      if (fileOptions) {
        extractedText = await extractTextFromDocument(fileOptions)
      } else if (source.content) {
        extractedText = source.content
      } else {
        throw new Error("No document buffer or stored text available for processing.")
      }
    } else if (source.type === "website") {
      if (!source.url) {
        throw new Error("Missing website URL for website source.")
      }
      const webResult = await extractTextFromUrl(source.url)
      extractedText = webResult.text
      if (!source.title || source.title === source.url) {
        extractedTitle = webResult.title
      }
    } else if (source.type === "faq") {
      if (!source.content) {
        throw new Error("FAQ content is empty.")
      }
      extractedText = source.content
    }

    if (!extractedText || !extractedText.trim()) {
      throw new Error("Extracted content is empty. Please verify the document or URL.")
    }

    // Split into chunks
    const chunks = chunkText(extractedText)
    if (chunks.length === 0) {
      chunks.push(extractedText.slice(0, 1000))
    }

    // Delete existing chunks before re-inserting
    await prisma.chunk.deleteMany({
      where: { sourceId },
    })

    // Generate embeddings and store each chunk
    for (let index = 0; index < chunks.length; index++) {
      const text = chunks[index]
      const embedding = await generateEmbedding(text)
      const chunkId = `chk_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`

      const vectorString = `[${embedding.join(",")}]`

      try {
        // Attempt insert with pgvector ::vector cast
        await prisma.$executeRawUnsafe(
          `INSERT INTO chunks ("id", "source_id", "workspace_id", "text", "chunk_index", "embedding", "created_at")
           VALUES ($1, $2, $3, $4, $5, $6::vector, NOW())`,
          chunkId,
          sourceId,
          workspaceId,
          text,
          index,
          vectorString,
        )
      } catch {
        // Fallback if pgvector extension is not enabled in database
        await prisma.chunk.create({
          data: {
            id: chunkId,
            sourceId,
            workspaceId,
            text,
            chunkIndex: index,
          },
        })
      }
    }

    // Mark as ready
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        status: "ready",
        title: extractedTitle,
        content: extractedText.slice(0, 50000), // Persist text snippet/full text
        errorMessage: null,
      },
    })

    console.log(
      `[KnowledgeProcessor] Successfully processed source "${source.title}" (${source.id}) into ${chunks.length} chunks.`,
    )
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to process knowledge source"
    console.error(`[KnowledgeProcessor] Error processing source ${sourceId}:`, errorMsg)

    await prisma.source.update({
      where: { id: sourceId },
      data: {
        status: "failed",
        errorMessage: errorMsg,
      },
    })
  }
}
