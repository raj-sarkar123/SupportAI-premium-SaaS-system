import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Inbox,
  UserRound,
  Users,
  Sparkles,
  ArrowUpRight,
  CheckCheck,
  MessageCircle,
  Mail,
  RefreshCw,
  Search,
  MoreHorizontal,
  MessageSquare,
  BookOpen,
  ExternalLink,
  Paperclip,
  Send,
  ArrowRight,
} from "lucide-react"
import {
  Button,
  Avatar,
  Badge,
  StatusBadge,
  EmptyState,
} from "../components/ui"
import { conversations } from "../mocks/conversations"
import { useApp } from "../context/AppContext"

export default function InboxPage() {
  const navigate = useNavigate()
  const {
    notify,
    selectedConversation,
    setSelectedConversation,
    sentMessages,
    setSentMessages,
    setSelectedCustomer,
    currentConversation,
  } = useApp()

  const [inboxFilter, setInboxFilter] = useState("All conversations")
  const [inboxQuery, setInboxQuery] = useState("")
  const [reply, setReply] = useState("")
  const [internalNote, setInternalNote] = useState(false)

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) => {
        const match =
          inboxFilter === "All conversations" ||
          (inboxFilter === "Mine"
            ? c.assignee === "Sarah Miller"
            : inboxFilter === "Unassigned"
              ? c.assignee === "Unassigned"
              : inboxFilter === "AI Handled"
                ? c.status === "AI handled"
                : inboxFilter === "Closed"
                  ? c.status === "Resolved"
                  : c.status === inboxFilter)
        return (
          match &&
          `${c.name} ${c.subject} ${c.company}`
            .toLowerCase()
            .includes(inboxQuery.toLowerCase())
        )
      }),
    [inboxFilter, inboxQuery],
  )

  const sendReply = () => {
    if (!reply.trim()) return
    setSentMessages((prev) => ({
      ...prev,
      [selectedConversation]: [
        ...(prev[selectedConversation] || []),
        reply.trim(),
      ],
    }))
    setReply("")
    notify(internalNote ? "Internal note added" : "Reply sent successfully")
  }

  return (
    <main className="content content-inbox">
      <div className="page-intro compact-intro">
        <div>
          <div className="eyebrow">CUSTOMER SUPPORT</div>
          <h1>
            Inbox <span className="title-count">8</span>
          </h1>
          <p>Every conversation, all in one place.</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() =>
            notify("New conversation started. Select a customer to continue.")
          }
        >
          New conversation
        </Button>
      </div>

      <div className="inbox-layout">
        <div className="inbox-filters">
          <div className="panel-label">VIEWS</div>
          {[
            { name: "All conversations", icon: Inbox, count: 24 },
            { name: "Mine", icon: UserRound, count: 5 },
            { name: "Unassigned", icon: Users, count: 3 },
            { name: "AI Handled", icon: Sparkles, count: 12 },
            { name: "Escalated", icon: ArrowUpRight, count: 2 },
            { name: "Closed", icon: CheckCheck, count: 18 },
          ].map((f) => {
            const Icon = f.icon
            return (
              <button
                key={f.name}
                className={`filter-item ${
                  inboxFilter === f.name ? "active" : ""
                }`}
                onClick={() => setInboxFilter(f.name)}
              >
                <Icon size={16} />
                <span>{f.name}</span>
                <small>{f.count}</small>
              </button>
            )
          })}
          <div className="filter-divider" />
          <div className="panel-label">CHANNELS</div>
          <button
            className="filter-item"
            onClick={() => notify("Showing conversations from all channels")}
          >
            <MessageCircle size={16} /> Live chat
          </button>
          <button
            className="filter-item"
            onClick={() => notify("Showing conversations from all channels")}
          >
            <Mail size={16} /> Email
          </button>
        </div>

        <div className="conversation-list">
          <div className="list-heading">
            <strong>{inboxFilter}</strong>
            <button
              className="icon-button"
              onClick={() => notify("Conversations are up to date")}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
          <div className="list-search">
            <Search size={15} />
            <input
              value={inboxQuery}
              onChange={(e) => setInboxQuery(e.target.value)}
              placeholder="Search conversations"
            />
          </div>
          <div className="conversation-scroll">
            {filteredConversations.length ? (
              filteredConversations.map((c) => (
                <button
                  key={c.id}
                  className={`conversation-item ${
                    selectedConversation === c.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedConversation(c.id)}
                >
                  <Avatar initials={c.initials} color={c.color} />
                  <span className="conversation-item-body">
                    <span className="conversation-item-top">
                      <strong>{c.name}</strong>
                      <small>{c.time}</small>
                    </span>
                    <strong className="conversation-subject">
                      {c.subject}
                    </strong>
                    <span className="conversation-preview">{c.preview}</span>
                    <span className="conversation-item-footer">
                      <StatusBadge status={c.status} />
                      <small>{c.channel}</small>
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <EmptyState
                title="No conversations"
                description="Try another search or filter."
              />
            )}
          </div>
        </div>

        <div className="thread-panel">
          <div className="thread-header">
            <div>
              <div className="thread-person">
                <Avatar
                  initials={currentConversation.initials}
                  color={currentConversation.color}
                />
                <div>
                  <strong>{currentConversation.name}</strong>
                  <span>{currentConversation.email}</span>
                </div>
              </div>
            </div>
            <div className="thread-header-actions">
              <StatusBadge status={currentConversation.status} />
              <button
                className="icon-button"
                title="More options"
                onClick={() => notify("Conversation options are up to date")}
              >
                <MoreHorizontal size={19} />
              </button>
            </div>
          </div>
          <div className="thread-messages">
            <div className="thread-date">
              <span>
                Today,{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="thread-subject">
              <MessageSquare size={15} /> {currentConversation.subject}
            </div>
            {currentConversation.messages.map((m, i) => (
              <div
                key={i}
                className={`message ${
                  m.from === "customer"
                    ? "message-customer"
                    : "message-support"
                }`}
              >
                <div className="message-avatar">
                  {m.from === "customer" ? (
                    <Avatar
                      initials={currentConversation.initials}
                      color={currentConversation.color}
                      size="sm"
                    />
                  ) : (
                    <span className="ai-avatar">
                      <Sparkles size={14} />
                    </span>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-byline">
                    <strong>
                      {m.from === "customer"
                        ? currentConversation.name
                        : "Alex · AI Agent"}
                    </strong>
                    <span>{m.time}</span>
                  </div>
                  <div className="message-bubble">{m.text}</div>
                  {m.from === "ai" && (
                    <div className="message-source">
                      <BookOpen size={13} /> Based on{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          navigate("/knowledge")
                        }}
                      >
                        Billing and subscription FAQs
                      </a>
                      <ExternalLink size={12} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(sentMessages[selectedConversation] || []).map((text, i) => (
              <div className="message message-support" key={`sent-${i}`}>
                <div className="message-avatar">
                  <Avatar initials="SC" color="dark" size="sm" />
                </div>
                <div className="message-content">
                  <div className="message-byline">
                    <strong>
                      Sarah Chen {internalNote ? "· Internal note" : ""}
                    </strong>
                    <span>Just now</span>
                  </div>
                  <div className="message-bubble">{text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="composer-wrap">
            <div className="suggestion">
              <span className="suggestion-icon">
                <Sparkles size={16} />
              </span>
              <div>
                <strong>Suggested reply</strong>
                <p>
                  {currentConversation.id === 2
                    ? "I understand you're still seeing the error. Let me take a closer look at your workspace settings and get back to you shortly."
                    : "Is there anything else I can help you with today?"}
                </p>
              </div>
              <button
                onClick={() =>
                  setReply(
                    currentConversation.id === 2
                      ? "I understand you're still seeing the error. Let me take a closer look at your workspace settings and get back to you shortly."
                      : "Is there anything else I can help you with today?",
                  )
                }
              >
                Use reply <ArrowRight size={13} />
              </button>
            </div>
            <div className="composer">
              <div className="composer-tabs">
                <button
                  className={!internalNote ? "active" : ""}
                  onClick={() => setInternalNote(false)}
                >
                  Reply
                </button>
                <button
                  className={internalNote ? "active" : ""}
                  onClick={() => setInternalNote(true)}
                >
                  Internal note
                </button>
              </div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                    sendReply()
                }}
                placeholder={
                  internalNote
                    ? "Write a note for your team..."
                    : "Type your reply..."
                }
              />
              <div className="composer-bottom">
                <button
                  className="icon-button"
                  title="Attach a file"
                  onClick={() => notify("Attachment picker opened")}
                >
                  <Paperclip size={17} />
                </button>
                <span>Press ⌘ Enter to send</span>
                <Button
                  variant="primary"
                  icon={Send}
                  onClick={sendReply}
                  disabled={!reply.trim()}
                >
                  {internalNote ? "Add note" : "Send reply"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="customer-panel">
          <div className="customer-panel-title">
            Customer details{" "}
            <button
              className="icon-button"
              onClick={() => setSelectedCustomer(currentConversation)}
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
          <div className="customer-identity">
            <Avatar
              initials={currentConversation.initials}
              color={currentConversation.color}
              size="lg"
            />
            <strong>{currentConversation.name}</strong>
            <span>{currentConversation.email}</span>
            <Badge tone="green" dot>
              Active customer
            </Badge>
          </div>
          <div className="detail-group">
            <div className="detail-group-heading">DETAILS</div>
            <div className="detail-line">
              <span>Company</span>
              <strong>{currentConversation.company}</strong>
            </div>
            <div className="detail-line">
              <span>Assignee</span>
              <strong>{currentConversation.assignee}</strong>
            </div>
            <div className="detail-line">
              <span>Channel</span>
              <strong>{currentConversation.channel}</strong>
            </div>
            <div className="detail-line">
              <span>Customer since</span>
              <strong>Oct 2024</strong>
            </div>
          </div>
          <div className="detail-group">
            <div className="detail-group-heading">
              TAGS{" "}
              <button onClick={() => notify("Tag editor opened")}>
                <Plus size={14} />
              </button>
            </div>
            <div className="tag-row">
              <Badge tone="blue">Pro plan</Badge>
              <Badge tone="neutral">Billing</Badge>
            </div>
          </div>
          <div className="detail-group">
            <div className="detail-group-heading">HISTORY</div>
            <div className="detail-line">
              <span>Conversations</span>
              <strong>12</strong>
            </div>
            <div className="detail-line">
              <span>Open tickets</span>
              <strong>1</strong>
            </div>
            <button
              className="text-link"
              onClick={() => setSelectedCustomer(currentConversation)}
            >
              View customer profile <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
