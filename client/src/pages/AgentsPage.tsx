import { useNavigate } from "react-router-dom"
import {
  Plus,
  Sparkles,
  ArrowRight,
  Bot,
  MoreHorizontal,
  WandSparkles,
} from "lucide-react"
import { Button, Card, Badge, StatusBadge } from "../components/ui"
import { agents } from "../mocks/agents"
import { useApp } from "../context/AppContext"

export default function AgentsPage() {
  const navigate = useNavigate()
  const { notify, createdAgents, setDraftName, setModal } = useApp()

  const handleConfigure = (agentName: string) => {
    setDraftName(agentName)
    setModal("agent")
  }

  return (
    <main className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">AUTOMATION</div>
          <h1>AI Agents</h1>
          <p>Build and manage your always-on support team.</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate("/agents/new")}
        >
          Create agent
        </Button>
      </div>

      <div className="feature-banner">
        <div className="feature-icon">
          <Sparkles size={21} />
        </div>
        <div>
          <strong>Great support never sleeps.</strong>
          <p>
            Your AI agents are handling 89.2% of conversations on their own.
            Keep them sharp with the latest knowledge.
          </p>
        </div>
        <button onClick={() => navigate("/knowledge")}>
          Manage knowledge <ArrowRight size={15} />
        </button>
      </div>

      <div className="section-heading">
        <div>
          <h2>Your agents</h2>
          <p>
            {agents.length + createdAgents.length} agents working alongside
            your team
          </p>
        </div>
        <Badge tone="green" dot>
          All systems operational
        </Badge>
      </div>

      <div className="agent-grid">
        {[
          ...agents,
          ...createdAgents.map((name) => ({
            name,
            role: "Custom Agent",
            description:
              "A new AI agent ready to help your customers. Add knowledge sources to get started.",
            model: "GPT-4o",
            conversations: "0",
            rate: "—",
            status: "Draft",
            color: "violet",
          })),
        ].map((agent) => (
          <Card className="agent-card" key={agent.name}>
            <div className="agent-card-top">
              <div className={`agent-avatar agent-${agent.color}`}>
                <Bot size={26} />
              </div>
              <button
                className="icon-button"
                onClick={() => notify(`${agent.name}'s settings opened`)}
                aria-label={`${agent.name} options`}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="agent-name-row">
              <h3>{agent.name}</h3>
              <StatusBadge status={agent.status} />
            </div>
            <span className="agent-role">{agent.role}</span>
            <p>{agent.description}</p>
            <div className="agent-stats">
              <div>
                <span>Conversations</span>
                <strong>{agent.conversations}</strong>
              </div>
              <div>
                <span>Resolution rate</span>
                <strong>{agent.rate}</strong>
              </div>
            </div>
            <div className="agent-footer">
              <span>
                <span className="model-dot" />
                {agent.model}
              </span>
              <button onClick={() => handleConfigure(agent.name)}>
                Configure <ArrowRight size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="tip-card">
        <span className="tip-icon">
          <WandSparkles size={19} />
        </span>
        <div>
          <strong>Make your agents even smarter</strong>
          <p>
            Connect your knowledge base so your agents can give more accurate,
            helpful answers.
          </p>
        </div>
        <Button onClick={() => navigate("/knowledge")}>
          Explore knowledge base <ArrowRight size={14} />
        </Button>
      </Card>
    </main>
  )
}
