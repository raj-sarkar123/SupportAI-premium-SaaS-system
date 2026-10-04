import { useState } from "react"
import {
  CalendarDays,
  ChevronDown,
  Download,
  TrendingUp,
  MoreHorizontal,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react"
import { Button, Card, Badge } from "../components/ui"
import { weekBars, chartDates } from "../mocks/analytics"
import { useApp } from "../context/AppContext"

export default function AnalyticsPage() {
  const { notify } = useApp()
  const [dateRange, setDateRange] = useState("Last 30 days")

  return (
    <main className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">INSIGHTS & REPORTING</div>
          <h1>Analytics</h1>
          <p>Better insights for better customer experiences.</p>
        </div>
        <div className="intro-actions">
          <Button
            icon={CalendarDays}
            onClick={() =>
              setDateRange(
                dateRange === "Last 30 days"
                  ? "Last 7 days"
                  : "Last 30 days",
              )
            }
          >
            {dateRange}
            <ChevronDown size={14} />
          </Button>
          <Button
            icon={Download}
            onClick={() => notify("Your report is being prepared")}
          >
            Export report
          </Button>
        </div>
      </div>

      <div className="analytics-kpis">
        {[
          { label: "Conversations", value: "4,829", change: "12.8%" },
          { label: "AI resolution", value: "89.2%", change: "5.4%" },
          {
            label: "Avg. first response",
            value: "1m 24s",
            change: "18.6%",
          },
          {
            label: "Customer satisfaction",
            value: "4.8/5",
            change: "0.3 pts",
          },
        ].map((k) => (
          <Card key={k.label} className="analytics-kpi">
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <small>
              <TrendingUp size={13} /> {k.change}{" "}
              <span>vs. previous period</span>
            </small>
          </Card>
        ))}
      </div>

      <div className="analytics-grid">
        <Card className="chart-card">
          <div className="card-header">
            <div>
              <h2>Conversation trends</h2>
              <p>Daily volume over the selected period</p>
            </div>
            <MoreHorizontal size={18} className="muted-icon" />
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
                  <div key={i} className="bar-stack">
                    <span
                      className="bar-human"
                      style={{ height: `${v * 0.27}%` }}
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

        <Card className="analytics-split">
          <div className="card-header">
            <div>
              <h2>AI vs. human</h2>
              <p>Who's handling conversations</p>
            </div>
          </div>
          <div className="split-donut">
            <div>
              <strong>89.2%</strong>
              <span>AI handled</span>
            </div>
          </div>
          <div className="split-legend">
            <div>
              <span>
                <i className="legend-ai" /> AI resolved
              </span>
              <strong>4,307</strong>
            </div>
            <div>
              <span>
                <i className="legend-human" /> Human assisted
              </span>
              <strong>522</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="analytics-bottom">
        <Card>
          <div className="card-header">
            <div>
              <h2>Response time</h2>
              <p>Average first response by week</p>
            </div>
            <Badge tone="green">
              <ArrowDownRight size={13} /> 18.6%
            </Badge>
          </div>
          <div className="horizontal-stat">
            <span>Week 1</span>
            <div>
              <i style={{ width: "84%" }} />
            </div>
            <strong>2m 12s</strong>
          </div>
          <div className="horizontal-stat">
            <span>Week 2</span>
            <div>
              <i style={{ width: "70%" }} />
            </div>
            <strong>1m 52s</strong>
          </div>
          <div className="horizontal-stat">
            <span>Week 3</span>
            <div>
              <i style={{ width: "60%" }} />
            </div>
            <strong>1m 38s</strong>
          </div>
          <div className="horizontal-stat">
            <span>Week 4</span>
            <div>
              <i style={{ width: "50%" }} />
            </div>
            <strong>1m 24s</strong>
          </div>
        </Card>

        <Card>
          <div className="card-header">
            <div>
              <h2>Knowledge gaps</h2>
              <p>Topics your agents need help with</p>
            </div>
            <Badge tone="orange">3 opportunities</Badge>
          </div>
          <div className="gap-item">
            <span className="gap-number">01</span>
            <div>
              <strong>Advanced API configuration</strong>
              <small>18 unanswered questions</small>
            </div>
            <ArrowRight size={16} />
          </div>
          <div className="gap-item">
            <span className="gap-number">02</span>
            <div>
              <strong>Enterprise billing options</strong>
              <small>12 unanswered questions</small>
            </div>
            <ArrowRight size={16} />
          </div>
          <div className="gap-item">
            <span className="gap-number">03</span>
            <div>
              <strong>Custom role permissions</strong>
              <small>9 unanswered questions</small>
            </div>
            <ArrowRight size={16} />
          </div>
        </Card>
      </div>
    </main>
  )
}
