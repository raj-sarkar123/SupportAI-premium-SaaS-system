import * as cheerio from "cheerio"
import mammoth from "mammoth"

/**
 * Extracts plain text from an uploaded document buffer based on file extension and mime type.
 */
export async function extractTextFromDocument(file: {
  buffer: Buffer
  originalname: string
  mimetype: string
}): Promise<string> {
  const ext = file.originalname.split(".").pop()?.toLowerCase() || ""

  if (ext === "pdf" || file.mimetype.includes("pdf")) {
    const pdfModule = await import("pdf-parse")
    const pdfParse = (pdfModule as any).default || pdfModule
    const data = await pdfParse(file.buffer)
    return data.text.trim()
  }

  if (
    ext === "docx" ||
    file.mimetype.includes("wordprocessingml") ||
    file.mimetype.includes("msword")
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer })
    return result.value.trim()
  }

  // Fallback to text / utf-8
  return file.buffer.toString("utf-8").trim()
}

/**
 * Fetches a webpage and extracts clean, readable text using cheerio.
 */
export async function extractTextFromUrl(
  url: string,
): Promise<{ title: string; text: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "SupportAI-Crawler/1.0 (+https://supportai.internal/knowledge)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove non-content elements
    $("script, style, nav, footer, header, noscript, svg, iframe, form").remove()

    const rawTitle = $("title").text().trim() || $("h1").first().text().trim() || url
    const title = rawTitle.replace(/\s+/g, " ").slice(0, 150)

    // Extract body text and normalize whitespace
    const text = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()

    if (!text) {
      throw new Error("No readable text found on the target webpage.")
    }

    return { title, text }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Splits text into readable semantic chunks with overlap.
 * Aiming for ~600-800 characters per chunk with ~120 characters overlap.
 */
export function chunkText(
  text: string,
  maxChunkSize = 750,
  overlap = 120,
): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim()
  if (clean.length <= maxChunkSize) {
    return clean ? [clean] : []
  }

  const chunks: string[] = []
  // Split on paragraph or sentence boundaries
  const paragraphs = clean.split(/\n\s*\n/)

  let currentChunk = ""

  for (const para of paragraphs) {
    const trimmedPara = para.trim()
    if (!trimmedPara) continue

    if ((currentChunk + "\n\n" + trimmedPara).length <= maxChunkSize) {
      currentChunk = currentChunk
        ? `${currentChunk}\n\n${trimmedPara}`
        : trimmedPara
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        // Start next chunk with overlap from the tail of currentChunk
        const tailWords = currentChunk.slice(-overlap).split(" ").slice(1).join(" ")
        currentChunk = tailWords ? `${tailWords} ${trimmedPara}` : trimmedPara
      } else {
        // Single paragraph longer than maxChunkSize, split by sentences
        const sentences = trimmedPara.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [trimmedPara]
        for (const sentence of sentences) {
          if ((currentChunk + " " + sentence).length <= maxChunkSize) {
            currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence
          } else {
            if (currentChunk) chunks.push(currentChunk.trim())
            currentChunk = sentence
          }
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter((c) => c.length > 20)
}
