import { useState, useEffect, useCallback, useRef } from "react"
import {
  Link2,
  UploadCloud,
  FileText,
  CheckCircle2,
  Activity,
  Search,
  Globe2,
  MessageCircle,
  MoreHorizontal,
  ArrowRight,
  RefreshCw,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  X,
  ExternalLink,
} from "lucide-react"
import { Button, Card, StatusBadge, Tabs, TablePagination, Badge } from "../components/ui"
import { useApp } from "../context/AppContext"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export interface KnowledgeSource {
  id: string
  workspaceId: string
  type: "document" | "website" | "faq"
  status: "processing" | "ready" | "failed"
  title: string
  url?: string | null
  content?: string | null
  category?: string | null
  fileSize?: number | null
  mimeType?: string | null
  errorMessage?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    chunks: number
  }
}

export interface KnowledgeStats {
  totalSources: number
  readySources: number
  processingSources: number
  failedSources: number
  totalChunks: number
}

export interface SearchChunkResult {
  id: string
  text: string
  chunkIndex: number
  sourceId: string
  sourceTitle: string
  sourceType: string
  similarity: number
}

export default function KnowledgePage() {
  const {
    notify,
    fileRef,
    handleFiles,
    setModal,
    uploadProgress,
    knowledgeRefreshKey,
    triggerKnowledgeRefresh,
  } = useApp()

  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [stats, setStats] = useState<KnowledgeStats>({
    totalSources: 0,
    readySources: 0,
    processingSources: 0,
    failedSources: 0,
    totalChunks: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtering & Pagination
  const [kbTab, setKbTab] = useState("All sources")
  const [kbQuery, setKbQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Actions menu dropdown state
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [viewingSource, setViewingSource] = useState<KnowledgeSource | null>(null)

  // Chunk Search Tester State (Acceptance: search query returns the right chunks)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchingChunks, setSearchingChunks] = useState(false)
  const [chunkResults, setChunkResults] = useState<SearchChunkResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(kbQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [kbQuery])

  // Map Tab names to backend filter types
  const getBackendType = (tab: string) => {
    if (tab === "Documents") return "document"
    if (tab === "Websites") return "website"
    if (tab === "FAQs") return "faq"
    return "all"
  }

  // Fetch sources list from real API
  const fetchSources = useCallback(
    async (isPolling = false) => {
      if (!isPolling) setLoading(true)
      setError(null)

      try {
        const typeParam = getBackendType(kbTab)
        const params = new URLSearchParams({
          page: String(page),
          limit: "15",
          type: typeParam,
        })
        if (debouncedQuery.trim()) {
          params.set("search", debouncedQuery.trim())
        }

        const res = await fetch(`${API_URL}/api/knowledge/sources?${params.toString()}`, {
          credentials: "include",
        })

        if (!res.ok) {
          throw new Error(`Failed to load knowledge sources: ${res.statusText}`)
        }

        const data = await res.json()
        setSources(data.sources || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
        if (data.stats) {
          setStats(data.stats)
        }
      } catch (err: unknown) {
        if (!isPolling) {
          setError(err instanceof Error ? err.message : "Failed to load knowledge base sources")
        }
      } finally {
        if (!isPolling) setLoading(false)
      }
    },
    [kbTab, debouncedQuery, page],
  )

  // Initial and reactive fetch
  useEffect(() => {
    fetchSources(false)
  }, [fetchSources, knowledgeRefreshKey])

  // Status Polling: poll every 2.5s if any source is currently "processing"
  const hasProcessing = sources.some((s) => s.status === "processing")
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (hasProcessing) {
      pollingRef.current = setInterval(() => {
        fetchSources(true)
      }, 2500)
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [hasProcessing, fetchSources])

  // Re-process Source
  const handleReprocess = async (sourceId: string) => {
    setOpenActionId(null)
    try {
      const res = await fetch(`${API_URL}/api/knowledge/sources/${sourceId}/reprocess`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Reprocess request failed")
      notify("Source queued for re-processing")
      // Optimistically set to processing
      setSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, status: "processing" as const } : s)),
      )
      triggerKnowledgeRefresh()
    } catch {
      notify("Failed to trigger re-processing")
    }
  }

  // Delete Source
  const handleDelete = async (sourceId: string, title: string) => {
    setOpenActionId(null)
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const res = await fetch(`${API_URL}/api/knowledge/sources/${sourceId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Delete failed")
      notify(`"${title}" deleted from knowledge base`)
      setSources((prev) => prev.filter((s) => s.id !== sourceId))
      triggerKnowledgeRefresh()
    } catch {
      notify("Failed to delete source")
    }
  }

  // Search Chunks via Real Semantic/Vector API
  const handleSearchChunks = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return

    setSearchingChunks(true)
    setHasSearched(true)
    try {
      const res = await fetch(
        `${API_URL}/api/knowledge/search?q=${encodeURIComponent(q)}`,
        { credentials: "include" },
      )
      if (!res.ok) throw new Error("Search query failed")
      const data = await res.json()
      setChunkResults(data.chunks || [])
    } catch {
      notify("Failed to execute search query")
      setChunkResults([])
    } finally {
      setSearchingChunks(false)
    }
  }

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffSecs < 60) return "Just now"
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} min ago`
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`
      if (diffSecs < 172800) return "Yesterday"
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return "Recently"
    }
  }

  // Icon helper
  const getSourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "website":
        return Globe2
      case "faq":
        return MessageCircle
      default:
        return FileText
    }
  }

  return (
    <main className="content">
      {/* Page Header */}
      <div className="page-intro">
        <div>
          <div className="eyebrow">CONTENT LIBRARY</div>
          <h1>Knowledge Base</h1>
          <p>Give your AI the context to answer customer questions with speed and precision.</p>
        </div>
        <div className="intro-actions">
          <Button icon={Link2} onClick={() => setModal("url")}>
            Add URL
          </Button>
          <Button
            variant="primary"
            icon={UploadCloud}
            onClick={() => setModal("upload")}
          >
            Upload content
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="knowledge-stats">
        <Card>
          <span className="stat-icon lavender-bg">
            <FileText size={19} />
          </span>
          <div>
            <strong>{stats.totalSources}</strong>
            <span>Total sources</span>
          </div>
        </Card>
        <Card>
          <span className="stat-icon green-bg">
            <CheckCircle2 size={19} />
          </span>
          <div>
            <strong>{stats.readySources}</strong>
            <span>Synced & ready</span>
          </div>
        </Card>
        <Card>
          <span className="stat-icon blue-bg">
            <Layers size={19} />
          </span>
          <div>
            <strong>{stats.totalChunks}</strong>
            <span>Embedded chunks</span>
          </div>
        </Card>
      </div>

      {/* Semantic Vector Search Tester Panel */}
      <Card style={{ padding: "20px 24px", marginBottom: "22px", background: "#fcfcff", border: "1px solid #e5e4fa" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color="#6459d8" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#222634" }}>Test Semantic Search Query</h2>
            </div>
            <p style={{ fontSize: 11, color: "#8a929f", marginTop: 4 }}>
              Verify how your uploaded documents and FAQs are chunked and retrieved via vector embeddings.
            </p>
          </div>
          {chunkResults.length > 0 && (
            <Badge tone="blue">{chunkResults.length} matching chunks</Badge>
          )}
        </div>

        <form onSubmit={handleSearchChunks} style={{ display: "flex", gap: 10 }}>
          <div className="input-search" style={{ flex: 1, height: 38, background: "#fff" }}>
            <Search size={16} />
            <input
              style={{ width: "100%" }}
              placeholder="Enter customer question, e.g. 'What is the refund policy?' or 'How do I reset my password?'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" icon={Search} disabled={searchingChunks || !searchQuery.trim()}>
            {searchingChunks ? "Searching..." : "Search Chunks"}
          </Button>
          {hasSearched && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchQuery("")
                setChunkResults([])
                setHasSearched(false)
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Chunk Results List */}
        {hasSearched && (
          <div style={{ marginTop: 18, borderTop: "1px solid #edf0f4", paddingTop: 16 }}>
            {searchingChunks ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#8c94a4", fontSize: 12 }}>
                Searching pgvector embeddings for relevant chunks...
              </div>
            ) : chunkResults.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#8c94a4", fontSize: 12 }}>
                No matching chunks found for query "{searchQuery}". Upload more content or try different keywords.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {chunkResults.map((chunk, idx) => (
                  <div
                    key={chunk.id || idx}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 8,
                      background: "#fff",
                      border: "1px solid #e7e9f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#2d3240" }}>
                          {chunk.sourceTitle}
                        </span>
                        <span style={{ textTransform: "capitalize" }}>
                          <Badge tone="neutral">{chunk.sourceType}</Badge>
                        </span>
                        <span style={{ fontSize: 10, color: "#9ca2ad" }}>Chunk #{chunk.chunkIndex + 1}</span>
                      </div>
                      <Badge tone={chunk.similarity > 0.7 ? "green" : "blue"}>
                        {Math.round(chunk.similarity * 100)}% match
                      </Badge>
                    </div>
                    <p style={{ fontSize: 12, color: "#484f5d", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Main Table Card */}
      <Card className="table-card">
        <div className="table-toolbar">
          <Tabs
            tabs={["All sources", "Documents", "Websites", "FAQs"]}
            activeTab={kbTab}
            onChange={(tab) => {
              setKbTab(tab)
              setPage(1)
            }}
          />
          <div className="toolbar-right">
            <div className="input-search">
              <Search size={16} />
              <input
                placeholder="Search sources..."
                value={kbQuery}
                onChange={(e) => setKbQuery(e.target.value)}
              />
            </div>
            <button
              className="icon-button bordered"
              onClick={() => fetchSources(false)}
              title="Refresh Sources"
              aria-label="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            style={{
              margin: 20,
              padding: 16,
              borderRadius: 8,
              background: "#fef2f3",
              border: "1px solid #fbd5d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#bd3a42" }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: 12 }}>{error}</span>
            </div>
            <Button onClick={() => fetchSources(false)}>
              Retry
            </Button>
          </div>
        )}

        {/* Table / List */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>TYPE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>CHUNKS</th>
                <th>LAST UPDATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "#8a929f", fontSize: 12 }}>Loading knowledge sources...</div>
                  </td>
                </tr>
              ) : sources.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "50px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div className="empty-icon">
                        <UploadCloud size={20} />
                      </div>
                      <strong style={{ fontSize: 13, color: "#313644" }}>No knowledge sources found</strong>
                      <p style={{ fontSize: 11, color: "#8c94a2", maxWidth: 320, margin: 0 }}>
                        {kbQuery
                          ? `No sources matched "${kbQuery}". Try a different search.`
                          : "Upload documents, link your website, or add FAQs to train your AI agents."}
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <Button variant="primary" icon={UploadCloud} onClick={() => setModal("upload")}>
                          Upload File
                        </Button>
                        <Button icon={Link2} onClick={() => setModal("url")}>
                          Add URL
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sources.map((s) => {
                  const Icon = getSourceIcon(s.type)
                  const isMenuOpen = openActionId === s.id

                  return (
                    <tr key={s.id} style={{ position: "relative" }}>
                      <td>
                        <div className="table-name">
                          <span className="source-icon">
                            <Icon size={17} />
                          </span>
                          <div>
                            <strong style={{ display: "block" }}>{s.title}</strong>
                            {s.url && (
                              <small style={{ color: "#8c93a0", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                                {s.url.slice(0, 45)}
                                {s.url.length > 45 ? "..." : ""}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{s.type}</td>
                      <td>{s.category || "General"}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <StatusBadge status={s.status} />
                          {s.status === "failed" && s.errorMessage && (
                            <span title={s.errorMessage} style={{ cursor: "help", color: "#d9534f" }}>
                              <AlertCircle size={14} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{s._count?.chunks || 0}</td>
                      <td>{formatDate(s.updatedAt)}</td>
                      <td style={{ position: "relative" }}>
                        <button
                          className="icon-button"
                          onClick={() => setOpenActionId(isMenuOpen ? null : s.id)}
                          aria-label={`Options for ${s.title}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Dropdown Action Menu */}
                        {isMenuOpen && (
                          <div
                            style={{
                              position: "absolute",
                              right: 20,
                              top: 40,
                              background: "#fff",
                              border: "1px solid #e1e4eb",
                              borderRadius: 8,
                              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                              zIndex: 40,
                              minWidth: 150,
                              display: "flex",
                              flexDirection: "column",
                              padding: "4px 0",
                            }}
                          >
                            <button
                              onClick={() => {
                                setOpenActionId(null)
                                setViewingSource(s)
                              }}
                              style={{
                                padding: "8px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "none",
                                border: "none",
                                textAlign: "left",
                                fontSize: 11.5,
                                color: "#3a4150",
                                cursor: "pointer",
                              }}
                            >
                              <FileText size={14} /> View Content
                            </button>

                            <button
                              onClick={() => handleReprocess(s.id)}
                              style={{
                                padding: "8px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "none",
                                border: "none",
                                textAlign: "left",
                                fontSize: 11.5,
                                color: "#3a4150",
                                cursor: "pointer",
                              }}
                            >
                              <RefreshCw size={14} /> Re-process
                            </button>

                            <div style={{ height: 1, background: "#eff0f3", margin: "4px 0" }} />

                            <button
                              onClick={() => handleDelete(s.id, s.title)}
                              style={{
                                padding: "8px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "none",
                                border: "none",
                                textAlign: "left",
                                fontSize: 11.5,
                                color: "#d9434e",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <TablePagination
            showingText={`Showing page ${page} of ${totalPages} (${total} sources)`}
            currentPage={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onPageSelect={(p) => setPage(p)}
          />
        )}
      </Card>

      {/* Bottom Upload Dropzone & FAQ Quick Action */}
      <div className="knowledge-bottom">
        <div
          className="dropzone"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(Array.from(e.dataTransfer.files))
          }}
        >
          <span className="dropzone-icon">
            <UploadCloud size={22} />
          </span>
          <strong>Drop files here to upload</strong>
          <p>or click to browse · PDF, DOCX, TXT up to 20MB</p>
        </div>

        <button className="faq-tile" onClick={() => setModal("faq")}>
          <span className="quick-icon purple">
            <MessageCircle size={19} />
          </span>
          <span>
            <strong>Add a frequently asked question</strong>
            <small>Write Q&A pairs your AI can immediately use across conversations.</small>
          </span>
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Source Details Modal */}
      {viewingSource && (
        <div className="modal-backdrop" onClick={() => setViewingSource(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-title">
              <div>
                <h2>{viewingSource.title}</h2>
                <p>
                  Type: <span style={{ textTransform: "capitalize" }}>{viewingSource.type}</span> · Status:{" "}
                  <StatusBadge status={viewingSource.status} />
                </p>
              </div>
              <button className="icon-button" onClick={() => setViewingSource(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", maxHeight: "60vh", overflowY: "auto" }}>
              {viewingSource.errorMessage && (
                <div style={{ padding: 12, borderRadius: 6, background: "#fef2f3", color: "#bd3a42", fontSize: 12, marginBottom: 16 }}>
                  <strong>Error:</strong> {viewingSource.errorMessage}
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 12, color: "#2d3240" }}>Extracted Text Snippet</strong>
              </div>
              <div
                style={{
                  background: "#fafbfc",
                  border: "1px solid #edf0f4",
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 12,
                  color: "#474e5c",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {viewingSource.content || "No text content stored yet. Processing may still be in progress."}
              </div>
            </div>

            <div className="modal-footer">
              <Button onClick={() => setViewingSource(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleReprocess(viewingSource.id)
                  setViewingSource(null)
                }}
              >
                Re-process Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
