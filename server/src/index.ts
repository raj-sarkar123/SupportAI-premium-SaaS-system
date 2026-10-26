import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { config } from "./config.js"
import { errorHandler } from "./middleware/errorHandler.js"
import authRoutes from "./routes/auth.js"
import knowledgeRoutes from "./routes/knowledge.js"

const app = express()

// ── Middleware ──────────────────────────────────────────
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

// ── Routes ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/api/auth", authRoutes)
app.use("/api/knowledge", knowledgeRoutes)

// ── Error handling ─────────────────────────────────────
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n  🚀  SupportAI Server running on http://localhost:${config.port}`)
  console.log(`  📦  Environment: ${config.nodeEnv}`)
  console.log(`  🔗  Client origin: ${config.clientOrigin}\n`)
})

export default app
