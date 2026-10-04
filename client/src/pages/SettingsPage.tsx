import { useNavigate, useParams } from "react-router-dom"
import {
  Settings2,
  Sparkles,
  Bell,
  ShieldCheck,
  Users,
  LockKeyhole,
  Plus,
} from "lucide-react"
import { Button, Card, Avatar, Badge, Toggle } from "../components/ui"
import { useApp } from "../context/AppContext"

type SettingsTab = "General" | "AI" | "Notifications" | "Security" | "Team"

const tabMap: Record<string, SettingsTab> = {
  general: "General",
  ai: "AI",
  notifications: "Notifications",
  security: "Security",
  team: "Team",
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { tab = "general" } = useParams<{ tab?: string }>()
  const { notify } = useApp()

  const currentTab: SettingsTab = tabMap[tab.toLowerCase()] || "General"

  const handleTabChange = (selected: SettingsTab) => {
    navigate(`/settings/${selected.toLowerCase()}`)
  }

  return (
    <main className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">WORKSPACE MANAGEMENT</div>
          <h1>Settings</h1>
          <p>Everything you need to make this workspace yours.</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {[
            { name: "General" as const, icon: Settings2 },
            { name: "AI" as const, icon: Sparkles },
            { name: "Notifications" as const, icon: Bell },
            { name: "Security" as const, icon: ShieldCheck },
            { name: "Team" as const, icon: Users },
          ].map((t) => {
            const Icon = t.icon
            return (
              <button
                className={currentTab === t.name ? "active" : ""}
                key={t.name}
                onClick={() => handleTabChange(t.name)}
              >
                <Icon size={17} />
                {t.name}
              </button>
            )
          })}
        </div>

        <Card className="settings-card">
          <div className="settings-heading">
            <h2>{currentTab} settings</h2>
            <p>
              {currentTab === "General"
                ? "Manage the basics of your workspace."
                : `Manage your workspace ${currentTab.toLowerCase()} preferences.`}
            </p>
          </div>

          {currentTab === "General" ? (
            <>
              <div className="settings-field">
                <label>Workspace name</label>
                <input defaultValue="Acme Inc." />
                <small>
                  This is how your workspace appears to your team.
                </small>
              </div>
              <div className="settings-field">
                <label>Workspace URL</label>
                <div className="input-prefix">
                  <span>supportai.com/</span>
                  <input defaultValue="acme" />
                </div>
              </div>
              <div className="settings-field">
                <label>Time zone</label>
                <select defaultValue="Pacific Time (PT)">
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>UTC</option>
                </select>
              </div>
            </>
          ) : currentTab === "AI" ? (
            <>
              <div className="settings-field">
                <label>Default AI model</label>
                <select defaultValue="GPT-4o">
                  <option>GPT-4o</option>
                  <option>Claude 3.5</option>
                </select>
                <small>
                  Used for new agents unless you choose another model.
                </small>
              </div>
              <Toggle
                title="AI reply suggestions"
                description="Suggest helpful replies to your team in the inbox."
              />
              <Toggle
                title="Automatic resolution"
                description="Let AI resolve conversations when confidence is high."
              />
            </>
          ) : currentTab === "Notifications" ? (
            <>
              <Toggle
                title="New conversations"
                description="Get notified when a customer starts a conversation."
              />
              <Toggle
                title="Escalations"
                description="Get notified when an AI agent escalates an issue."
              />
              <Toggle
                title="Weekly digest"
                description="Receive a summary of your support performance."
              />
            </>
          ) : currentTab === "Security" ? (
            <>
              <div className="security-callout">
                <LockKeyhole size={20} />
                <div>
                  <strong>Your workspace is protected</strong>
                  <p>All data is encrypted in transit and at rest.</p>
                </div>
              </div>
              <Toggle
                title="Two-factor authentication"
                description="Require 2FA for all workspace members."
              />
              <Toggle
                title="Session timeout"
                description="Automatically sign out inactive team members."
              />
            </>
          ) : (
            <>
              <div className="team-member">
                <Avatar initials="SC" color="dark" />
                <div>
                  <strong>Sarah Chen</strong>
                  <small>sarah@acme.com</small>
                </div>
                <Badge tone="blue">Admin</Badge>
              </div>
              <div className="team-member">
                <Avatar initials="SM" color="mint" />
                <div>
                  <strong>Sarah Miller</strong>
                  <small>miller@acme.com</small>
                </div>
                <Badge tone="neutral">Member</Badge>
              </div>
              <div className="team-member">
                <Avatar initials="JL" color="blue" />
                <div>
                  <strong>James Lee</strong>
                  <small>james@acme.com</small>
                </div>
                <Badge tone="neutral">Member</Badge>
              </div>
              <Button
                icon={Plus}
                onClick={() => notify("Team invitation sent")}
              >
                Invite team member
              </Button>
            </>
          )}

          <div className="settings-footer">
            <Button
              variant="primary"
              onClick={() => notify("Settings saved successfully")}
            >
              Save changes
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
