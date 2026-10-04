import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom"
import {
  LoaderCircle,
  Bot,
  UploadCloud,
  Link2,
  MessageCircle,
  X,
  BookOpen,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Plus,
} from "lucide-react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import CommandPalette from "./CommandPalette"
import { Button, Toast, Avatar, Badge, StatusBadge } from "../components/ui"
import { useApp } from "../context/AppContext"
import { agents } from "../mocks/agents"
import { tickets } from "../mocks/tickets"
import { conversations } from "../mocks/conversations"

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const {
    collapsed,
    mobileOpen,
    setMobileOpen,
    fileRef,
    handleFiles,
    uploadProgress,
    toast,
    setToast,
    notify,
    modal,
    setModal,
    draftName,
    setDraftName,
    createdAgents,
    setCreatedAgents,
    setUploadedSources,
    selectedTicket,
    setSelectedTicket,
    selectedCustomer,
    setSelectedCustomer,
    setSelectedConversation,
  } = useApp()

  // Sync route params with selected ticket or customer if on /tickets/:id or /customers/:id
  const ticketIdParam = location.pathname.startsWith("/tickets/")
    ? location.pathname.replace("/tickets/", "")
    : null

  const customerIdParam = location.pathname.startsWith("/customers/")
    ? location.pathname.replace("/customers/", "")
    : null

  const activeTicket =
    selectedTicket ||
    (ticketIdParam
      ? tickets.find(
          (t) =>
            t.id.toLowerCase() === ticketIdParam.toLowerCase() ||
            t.id.replace("#", "").toLowerCase() === ticketIdParam.toLowerCase(),
        ) || null
      : null)

  const activeCustomer =
    selectedCustomer ||
    (customerIdParam
      ? conversations.find(
          (c) =>
            String(c.id) === customerIdParam ||
            c.name.toLowerCase() === decodeURIComponent(customerIdParam).toLowerCase(),
        ) || null
      : null)

  const isNewAgentRoute = location.pathname === "/agents/new"
  const activeModal = isNewAgentRoute ? "agent" : modal

  const handleCloseModal = () => {
    if (isNewAgentRoute) {
      navigate("/agents")
    } else {
      setModal(null)
    }
    setDraftName("")
  }

  const handleCloseDrawer = () => {
    if (location.pathname.startsWith("/tickets/")) {
      navigate("/tickets")
    } else if (location.pathname.startsWith("/customers/")) {
      navigate("/customers")
    }
    setSelectedTicket(null)
    setSelectedCustomer(null)
  }

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <input
        ref={fileRef}
        type="file"
        hidden
        multiple
        accept=".pdf,.docx,.txt"
        onChange={(e) => {
          handleFiles(Array.from(e.target.files || []))
          e.target.value = ""
        }}
      />

      {uploadProgress !== null && (
        <div className="upload-progress" role="status">
          <LoaderCircle size={16} className="spin" />
          <span>
            Adding content to your knowledge base...{" "}
            <strong>{uploadProgress}%</strong>
          </span>
          <div className="upload-track">
            <i style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar />

      <div className="main-area">
        <Topbar />
        <Outlet />
      </div>

      <CommandPalette />

      {/* Global Modals */}
      {activeModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <div>
                <span className="modal-icon">
                  {activeModal === "agent" ? (
                    <Bot size={21} />
                  ) : activeModal === "upload" ? (
                    <UploadCloud size={21} />
                  ) : activeModal === "url" ? (
                    <Link2 size={21} />
                  ) : (
                    <MessageCircle size={21} />
                  )}
                </span>
                <h2>
                  {activeModal === "agent"
                    ? agents.some((a) => a.name === draftName)
                      ? `Configure ${draftName}`
                      : "Create an AI agent"
                    : activeModal === "upload"
                      ? "Upload content"
                      : activeModal === "url"
                        ? "Add a website"
                        : "Add a FAQ"}
                </h2>
                <p>
                  {activeModal === "agent"
                    ? "Give your agent a personality and a purpose."
                    : activeModal === "upload"
                      ? "Turn your documents into answers your AI can use."
                      : activeModal === "url"
                        ? "We'll sync the page and keep its content up to date."
                        : "Create a reliable answer for a common question."}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            {activeModal === "agent" ? (
              <div className="modal-fields">
                <label>
                  Agent name
                  <input
                    placeholder="e.g. Alex"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                </label>
                <label>
                  Tone of voice
                  <select defaultValue="Friendly and professional">
                    <option>Friendly and professional</option>
                    <option>Warm and conversational</option>
                    <option>Concise and direct</option>
                  </select>
                </label>
                <label>
                  Instructions
                  <textarea
                    placeholder="Tell your agent how to help customers..."
                    rows={3}
                  />
                </label>
                <div className="modal-field-grid">
                  <label>
                    Model
                    <select defaultValue="GPT-4o">
                      <option>GPT-4o</option>
                      <option>Claude 3.5</option>
                    </select>
                  </label>
                  <label>
                    Fallback
                    <select defaultValue="Escalate to human">
                      <option>Escalate to human</option>
                      <option>Create a ticket</option>
                    </select>
                  </label>
                </div>
                <div className="modal-hint">
                  <BookOpen size={16} /> Your agent will use your connected
                  knowledge sources.
                </div>
                <div className="preview-box">
                  <span>
                    <Sparkles size={14} /> LIVE PREVIEW
                  </span>
                  <p>
                    Hi there! I'm {draftName || "your AI agent"}. How can I help
                    you today?
                  </p>
                </div>
              </div>
            ) : activeModal === "upload" ? (
              <div className="modal-fields">
                <div
                  className="modal-drop"
                  onClick={() => fileRef.current?.click()}
                >
                  <UploadCloud size={28} />
                  <strong>Click to choose files, or drag and drop</strong>
                  <span>PDF, DOCX, TXT · Maximum 20MB per file</span>
                </div>
                <div className="modal-hint">
                  <ShieldCheck size={16} /> Your files are private and only used
                  to answer your customers.
                </div>
              </div>
            ) : activeModal === "url" ? (
              <div className="modal-fields">
                <label>
                  Website URL
                  <input
                    id="new-url"
                    placeholder="https://help.yourcompany.com"
                    type="url"
                  />
                </label>
                <label>
                  Category
                  <input placeholder="e.g. Help Center" />
                </label>
                <div className="modal-hint">
                  <RefreshCw size={16} /> We'll automatically check for updates
                  to this page.
                </div>
              </div>
            ) : (
              <div className="modal-fields">
                <label>
                  Question
                  <input
                    id="new-question"
                    placeholder="e.g. How do I reset my password?"
                  />
                </label>
                <label>
                  Answer
                  <textarea
                    placeholder="Write a clear, helpful answer..."
                    rows={5}
                  />
                </label>
              </div>
            )}

            <div className="modal-footer">
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button
                variant="primary"
                icon={activeModal === "upload" ? UploadCloud : Plus}
                onClick={() => {
                  if (activeModal === "agent") {
                    if (!draftName.trim()) {
                      notify("Please enter an agent name")
                      return
                    }
                    if (
                      !agents.some((a) => a.name === draftName) &&
                      !createdAgents.includes(draftName)
                    ) {
                      setCreatedAgents((v) => [...v, draftName])
                    }
                    notify("Agent saved successfully")
                    navigate("/agents")
                  } else if (activeModal === "url") {
                    const value = (
                      document.getElementById("new-url") as HTMLInputElement
                    )?.value
                    if (!value) {
                      notify("Please enter a website URL")
                      return
                    }
                    setUploadedSources((v) => [
                      { title: value, type: "Website" },
                      ...v,
                    ])
                    notify("Website added to knowledge base")
                    navigate("/knowledge")
                  } else if (activeModal === "faq") {
                    const value = (
                      document.getElementById("new-question") as HTMLInputElement
                    )?.value
                    if (!value) {
                      notify("Please enter a question")
                      return
                    }
                    setUploadedSources((v) => [
                      { title: value, type: "FAQ" },
                      ...v,
                    ])
                    notify("FAQ added to knowledge base")
                    navigate("/knowledge")
                  } else {
                    fileRef.current?.click()
                    notify("Choose a file to upload")
                  }
                  handleCloseModal()
                }}
              >
                {activeModal === "agent"
                  ? "Save agent"
                  : activeModal === "upload"
                    ? "Choose files"
                    : activeModal === "url"
                      ? "Add website"
                      : "Add FAQ"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Drawer for Ticket or Customer */}
      {(activeTicket || activeCustomer) && (
        <div className="drawer-backdrop" onClick={handleCloseDrawer}>
          <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-top">
              <span>
                {activeTicket ? "TICKET DETAILS" : "CUSTOMER PROFILE"}
              </span>
              <button
                className="icon-button"
                onClick={handleCloseDrawer}
                aria-label="Close drawer"
              >
                <X size={19} />
              </button>
            </div>

            {activeTicket ? (
              <>
                <div className="drawer-heading">
                  <span className="ticket-id">{activeTicket.id}</span>
                  <h2>{activeTicket.subject}</h2>
                  <div className="drawer-badges">
                    <StatusBadge status={activeTicket.status} />
                    <Badge
                      tone={activeTicket.priority === "High" ? "orange" : "blue"}
                    >
                      {activeTicket.priority} priority
                    </Badge>
                  </div>
                </div>
                <div className="drawer-section">
                  <h3>AI summary</h3>
                  <div className="ai-summary">
                    <Sparkles size={18} />
                    <p>
                      {activeTicket.customer} reached out about{" "}
                      {activeTicket.subject.toLowerCase()}. The AI attempted
                      to help using available knowledge but the issue requires a
                      team member to investigate further.
                    </p>
                  </div>
                </div>
                <div className="drawer-section">
                  <h3>Details</h3>
                  <div className="detail-line">
                    <span>Customer</span>
                    <strong>{activeTicket.customer}</strong>
                  </div>
                  <div className="detail-line">
                    <span>Assignee</span>
                    <strong>{activeTicket.assignee}</strong>
                  </div>
                  <div className="detail-line">
                    <span>Updated</span>
                    <strong>{activeTicket.updated}</strong>
                  </div>
                </div>
                <div className="drawer-section">
                  <h3>Timeline</h3>
                  <div className="timeline-item">
                    <span className="timeline-dot" />
                    <div>
                      <strong>Ticket created</strong>
                      <p>Conversation escalated to the support team</p>
                      <small>Today · 10:38 AM</small>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-dot" />
                    <div>
                      <strong>AI summary generated</strong>
                      <p>Context gathered from the conversation</p>
                      <small>Today · 10:38 AM</small>
                    </div>
                  </div>
                </div>
                <div className="drawer-actions">
                  <Button
                    variant="primary"
                    onClick={() => {
                      notify("Ticket marked as resolved")
                      handleCloseDrawer()
                    }}
                  >
                    Mark resolved
                  </Button>
                  <Button
                    onClick={() => {
                      handleCloseDrawer()
                      navigate("/inbox")
                    }}
                  >
                    Open conversation
                  </Button>
                </div>
              </>
            ) : (
              activeCustomer && (
                <>
                  <div className="drawer-customer">
                    <Avatar
                      initials={activeCustomer.initials}
                      color={activeCustomer.color}
                      size="lg"
                    />
                    <h2>{activeCustomer.name}</h2>
                    <p>{activeCustomer.email}</p>
                    <Badge tone="green" dot>
                      Active customer
                    </Badge>
                  </div>
                  <div className="drawer-section">
                    <h3>AI customer summary</h3>
                    <div className="ai-summary">
                      <Sparkles size={18} />
                      <p>
                        {activeCustomer.name} is a customer at{" "}
                        {activeCustomer.company}. They typically reach out
                        about product features and account questions. Their most
                        recent conversation was about{" "}
                        {activeCustomer.subject.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                  <div className="drawer-section">
                    <h3>Details</h3>
                    <div className="detail-line">
                      <span>Company</span>
                      <strong>{activeCustomer.company}</strong>
                    </div>
                    <div className="detail-line">
                      <span>Conversations</span>
                      <strong>12</strong>
                    </div>
                    <div className="detail-line">
                      <span>Tickets</span>
                      <strong>1</strong>
                    </div>
                    <div className="detail-line">
                      <span>Customer since</span>
                      <strong>Oct 2024</strong>
                    </div>
                  </div>
                  <div className="drawer-section">
                    <h3>Recent activity</h3>
                    <div className="timeline-item">
                      <span className="timeline-dot" />
                      <div>
                        <strong>{activeCustomer.subject}</strong>
                        <p>Conversation · {activeCustomer.status}</p>
                        <small>{activeCustomer.time} ago</small>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <span className="timeline-dot" />
                      <div>
                        <strong>Customer profile created</strong>
                        <p>Joined the Acme workspace</p>
                        <small>October 2024</small>
                      </div>
                    </div>
                  </div>
                  <div className="drawer-actions">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedConversation(activeCustomer.id)
                        handleCloseDrawer()
                        navigate("/inbox")
                      }}
                    >
                      View conversation
                    </Button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  )
}
