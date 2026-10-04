import { useState } from "react"
import {
  Link2,
  UploadCloud,
  FileText,
  CheckCircle2,
  Activity,
  Search,
  SlidersHorizontal,
  Globe2,
  MessageCircle,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react"
import { Button, Card, StatusBadge, Tabs } from "../components/ui"
import { documents } from "../mocks/documents"
import { useApp } from "../context/AppContext"

export default function KnowledgePage() {
  const {
    notify,
    uploadedSources,
    fileRef,
    handleFiles,
    setModal,
  } = useApp()

  const [kbTab, setKbTab] = useState("All sources")
  const [kbQuery, setKbQuery] = useState("")

  const allSources = [
    ...uploadedSources.map((source) => ({
      title: source.title,
      type: source.type,
      category: "General",
      status: "Synced",
      updated: "Just now",
      icon:
        source.type === "Website"
          ? Globe2
          : source.type === "FAQ"
            ? MessageCircle
            : FileText,
    })),
    ...documents,
  ]

  const filteredSources = allSources.filter(
    (d) =>
      (kbTab === "All sources" ||
        (kbTab === "FAQs" ? d.type === "FAQ" : `${d.type}s` === kbTab)) &&
      d.title.toLowerCase().includes(kbQuery.toLowerCase()),
  )

  return (
    <main className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">CONTENT LIBRARY</div>
          <h1>Knowledge Base</h1>
          <p>Give your AI the context to answer with confidence.</p>
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

      <div className="knowledge-stats">
        <Card>
          <span className="stat-icon lavender-bg">
            <FileText size={19} />
          </span>
          <div>
            <strong>{24 + uploadedSources.length}</strong>
            <span>Total sources</span>
          </div>
        </Card>
        <Card>
          <span className="stat-icon green-bg">
            <CheckCircle2 size={19} />
          </span>
          <div>
            <strong>{23 + uploadedSources.length}</strong>
            <span>Synced & ready</span>
          </div>
        </Card>
        <Card>
          <span className="stat-icon blue-bg">
            <Activity size={19} />
          </span>
          <div>
            <strong>92.1%</strong>
            <span>Knowledge coverage</span>
          </div>
        </Card>
      </div>

      <Card className="table-card">
        <div className="table-toolbar">
          <Tabs
            tabs={["All sources", "Documents", "Websites", "FAQs"]}
            activeTab={kbTab}
            onChange={(tab) => setKbTab(tab)}
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
              onClick={() => notify("Filters are up to date")}
              title="Filter"
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>TYPE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>LAST UPDATED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((d) => {
                const Icon = d.icon
                return (
                  <tr key={d.title}>
                    <td>
                      <div className="table-name">
                        <span className="source-icon">
                          <Icon size={17} />
                        </span>
                        <strong>{d.title}</strong>
                      </div>
                    </td>
                    <td>{d.type}</td>
                    <td>{d.category}</td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>{d.updated}</td>
                    <td>
                      <button
                        className="icon-button"
                        onClick={() => notify(`${d.title} options opened`)}
                        aria-label="More options"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

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
            <small>
              Write an answer your AI can reuse across conversations.
            </small>
          </span>
          <ArrowRight size={17} />
        </button>
      </div>
    </main>
  )
}
