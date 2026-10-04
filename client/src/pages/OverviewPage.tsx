import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Sparkles,
  CalendarDays,
  ChevronDown,
  Check,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  ThumbsUp,
  Clock3,
  ArrowRight,
  ChevronRight,
  Zap,
  Inbox,
  Bot,
  BookOpen,
} from "lucide-react"
import { Button, Card, Badge, Avatar, StatusBadge } from "../components/ui"
import { conversations } from "../mocks/conversations"
import { weekBars, chartDates } from "../mocks/analytics"
import { useApp } from "../context/AppContext"

export default function OverviewPage() {
  const navigate = useNavigate()
  const { setSelectedConversation, setModal } = useApp()
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [dateOpen, setDateOpen] = useState(false)

  return (
    <main className="content">
      <div className="page-intro overview-intro">
        <div>
          <div className="eyebrow">
            <span className="live-dot" />{" "}
            {new Date()
              .toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase()}
          </div>
          <h1>
            Good morning, Sarah{" "}
            <Sparkles
              className="greeting-sparkle"
              size={22}
              strokeWidth={1.7}
            />
          </h1>
          <p>Here's what's happening with your support team today.</p>
        </div>
        <Button
          icon={CalendarDays}
          onClick={() => setDateOpen(!dateOpen)}
        >
          {dateRange}
          <ChevronDown size={14} />
        </Button>
        {dateOpen && (
          <div className="date-menu">
            {["Last 7 days", "Last 30 days", "Last 90 days"].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDateRange(d)
                  setDateOpen(false)
                }}
              >
                {d}
                {dateRange === d && <Check size={15} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="kpi-grid">
        {[
          {
            label: "Total conversations",
            value: "4,829",
            icon: MessageSquare,
            change: "+12.8%",
            up: true,
            detail: "vs. previous period",
          },
          {
            label: "AI resolution rate",
            value: "89.2%",
            icon: Sparkles,
            change: "+5.4%",
            up: true,
            detail: "vs. previous period",
          },
          {
            label: "Escalations",
            value: "142",
            icon: ArrowUpRight,
            change: "−8.2%",
            up: true,
            detail: "vs. previous period",
          },
          {
            label: "Customer satisfaction",
            value: "4.8/5",
            icon: ThumbsUp,
            change: "+0.3",
            up: true,
            detail: "vs. previous period",
          },
          {
            label: "Avg. response time",
            value: "1m 24s",
            icon: Clock3,
            change: "−18.6%",
            up: true,
            detail: "vs. previous period",
          },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="kpi-card">
              <div className="kpi-top">
                <span>{metric.label}</span>
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div className="kpi-value">{metric.value}</div>
              <div className="kpi-bottom">
                <span
                  className={`kpi-change ${metric.up ? "good" : "bad"}`}
                >
                  <ArrowUpRight size={13} />
                  {metric.change}
                </span>
                <span>{metric.detail}</span>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="overview-main-grid">
        <Card className="chart-card">
          <div className="card-header">
            <div>
              <h2>Conversation volume</h2>
              <p>How your team is connecting with customers</p>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-ai" /> AI handled
              </span>
              <span>
                <i className="legend-human" /> Human
              </span>
            </div>
          </div>
          <div className="chart-area">
            <div className="chart-y-axis">
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
            </div>
            <div className="chart-body">
              <div className="chart-gridlines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="chart-bars">
                {weekBars.map((v, i) => (
                  <div
                    key={i}
                    className="bar-stack"
                    title={`${Math.round(v * 4)} conversations`}
                  >
                    <span
                      className="bar-human"
                      style={{ height: `${Math.max(12, v * 0.27)}%` }}
                    />
                    <span
                      className="bar-ai"
                      style={{ height: `${v * 0.73}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-x-axis">
            {chartDates.map((date) => (
              <span key={date}>{date}</span>
            ))}
          </div>
        </Card>

        <Card className="health-card">
          <div className="card-header">
            <div>
              <h2>AI performance</h2>
              <p>Your agents are doing great</p>
            </div>
            <span className="health-icon">
              <Sparkles size={18} />
            </span>
          </div>
          <div className="health-score">
            <div className="donut">
              <div>
                <strong>89%</strong>
                <span>resolved</span>
              </div>
            </div>
            <div className="health-score-text">
              <Badge tone="green" dot>
                Healthy
              </Badge>
              <h3>On track</h3>
              <p>
                Your AI agents resolved 89% of conversations without human help
                this month.
              </p>
            </div>
          </div>
          <div className="health-stats">
            <div>
              <span>AI conversations</span>
              <strong>4,307</strong>
            </div>
            <div>
              <span>Avg. confidence</span>
              <strong>96.4%</strong>
            </div>
            <div>
              <span>Knowledge coverage</span>
              <strong>92.1%</strong>
            </div>
          </div>
          <button className="text-link" onClick={() => navigate("/analytics")}>
            View AI analytics <ArrowRight size={15} />
          </button>
        </Card>
      </div>

      <div className="overview-bottom-grid">
        <Card className="recent-card">
          <div className="card-header">
            <div>
              <h2>Recent conversations</h2>
              <p>Latest interactions across all channels</p>
            </div>
            <button className="text-link" onClick={() => navigate("/inbox")}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="recent-list">
            {conversations.slice(0, 4).map((c) => (
              <button
                className="recent-row"
                key={c.id}
                onClick={() => {
                  setSelectedConversation(c.id)
                  navigate("/inbox")
                }}
              >
                <Avatar initials={c.initials} color={c.color} />
                <span className="recent-person">
                  <strong>{c.name}</strong>
                  <small>{c.subject}</small>
                </span>
                <StatusBadge status={c.status} />
                <span className="recent-time">{c.time} ago</span>
                <ChevronRight size={16} className="recent-chevron" />
              </button>
            ))}
          </div>
        </Card>

        <Card className="quick-card">
          <div className="card-header">
            <div>
              <h2>Quick actions</h2>
              <p>Pick up where you left off</p>
            </div>
            <Zap size={18} className="muted-icon" />
          </div>
          <div className="quick-actions">
            <button onClick={() => navigate("/inbox")}>
              <span className="quick-icon purple">
                <Inbox size={18} />
              </span>
              <span>
                <strong>Review inbox</strong>
                <small>8 conversations need attention</small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/agents/new")}>
              <span className="quick-icon blue">
                <Bot size={18} />
              </span>
              <span>
                <strong>Create an AI agent</strong>
                <small>Automate a new workflow</small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button onClick={() => setModal("upload")}>
              <span className="quick-icon amber">
                <BookOpen size={18} />
              </span>
              <span>
                <strong>Add knowledge</strong>
                <small>Keep your agents informed</small>
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      </div>
    </main>
  )
}
