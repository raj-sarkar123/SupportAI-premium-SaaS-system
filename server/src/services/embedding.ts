import crypto from "crypto"

export const EMBEDDING_DIMENSION = 1536

/**
 * Generates a normalized 1536-dimensional embedding vector for a given text.
 * If an OpenAI/external embedding key is configured, it will use the API;
 * otherwise, it uses a deterministic semantic n-gram feature hashing algorithm
 * with L2 normalization to enable pgvector cosine distance operations out of the box.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text.slice(0, 8000),
        }),
      })

      if (response.ok) {
        const data = (await response.json()) as {
          data: { embedding: number[] }[]
        }
        if (data.data?.[0]?.embedding) {
          return data.data[0].embedding
        }
      }
    } catch {
      // Fall through to deterministic local embedding generator
    }
  }

  return generateLocalEmbedding(text)
}

/**
 * Deterministic semantic vector generator (1536 dimensions, unit L2-normalized).
 * Uses word n-grams and hashing trick with TF weighting.
 */
export function generateLocalEmbedding(text: string): number[] {
  const vector = new Float64Array(EMBEDDING_DIMENSION)
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, " ")
  const words = normalized.split(/\s+/).filter((w) => w.length > 1)

  if (words.length === 0) {
    // Return unit vector along first dimension if empty
    vector[0] = 1.0
    return Array.from(vector)
  }

  // 1. Single words (unigrams)
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const hash = hashString(word)
    const idx = Math.abs(hash) % EMBEDDING_DIMENSION
    const sign = hash % 2 === 0 ? 1 : -1
    vector[idx] += sign * (1.0 + Math.log(1 + 1 / (i + 1)))
  }

  // 2. Bigrams (word pairs for localized semantics)
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]}_${words[i + 1]}`
    const hash = hashString(bigram)
    const idx = Math.abs(hash) % EMBEDDING_DIMENSION
    const sign = hash % 2 === 0 ? 1 : -1
    vector[idx] += sign * 1.5
  }

  // 3. Trigrams
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]}_${words[i + 1]}_${words[i + 2]}`
    const hash = hashString(trigram)
    const idx = Math.abs(hash) % EMBEDDING_DIMENSION
    const sign = hash % 2 === 0 ? 1 : -1
    vector[idx] += sign * 2.0
  }

  // 4. L2 Normalize to unit vector
  let sumSq = 0
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    sumSq += vector[i] * vector[i]
  }

  const norm = Math.sqrt(sumSq) || 1.0
  const result = new Array<number>(EMBEDDING_DIMENSION)
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    result[i] = Number((vector[i] / norm).toFixed(6))
  }

  return result
}

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash
}

/**
 * Calculates cosine similarity between two vectors (between -1.0 and 1.0).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dotProduct / denom
}
