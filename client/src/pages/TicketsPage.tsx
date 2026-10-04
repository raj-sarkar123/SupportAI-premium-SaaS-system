import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react"
import {
  Button,
  Card,
  Badge,
  Avatar,
  StatusBadge,
  TablePagination,
} from "../components/ui"
import { tickets } from "../mocks/tickets"
import { useApp } from "../context/AppContext"

export default function TicketsPage() {
  const navigate = useNavigate()
  const { notify } = useApp()
  const [ticketSearch, setTicketSearch] = useState("")

  const filteredTickets = tickets.filter((t) =>
    `${t.id} ${t.customer} ${t.subject} ${t.assignee}`
      .toLowerCase()
      .includes(ticketSearch.toLowerCase()),
  )

  const handleTicketClick = (ticketId: string) => {
    // Navigate to /tickets/:id (strip # if present for clean URL)
    const cleanId = ticketId.replace("#", "")
    navigate(`/tickets/${cleanId}`)
  }

  return (
    <main className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">ISSUE TRACKING</div>
          <h1>Tickets</h1>
          <p>Keep every customer issue moving forward.</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => notify("New ticket draft created")}
        >
          New ticket
        </Button>
      </div>

      <div className="ticket-metrics">
        {[
          {
            name: "Open tickets",
            value: "24",
            icon: Ticket,
            color: "blue",
          },
          {
            name: "Pending",
            value: "12",
            icon: Clock3,
            color: "amber",
          },
          {
            name: "Resolved this month",
            value: "186",
            icon: CheckCircle2,
            color: "green",
          },
          {
            name: "High priority",
            value: "3",
            icon: AlertCircle,
            color: "rose",
          },
        ].map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.name} className="ticket-metric">
              <span className={`stat-icon ${m.color}-bg`}>
                <Icon size={19} />
              </span>
              <span>{m.name}</span>
              <strong>{m.value}</strong>
            </Card>
          )
        })}
      </div>

      <Card className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>All tickets</h2>
            <p>Track requests from start to resolution</p>
          </div>
          <div className="toolbar-right">
            <div className="input-search">
              <Search size={16} />
              <input
                placeholder="Search tickets..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
              />
            </div>
            <Button
              icon={Filter}
              onClick={() => notify("Showing all tickets")}
            >
              Filter
            </Button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>TICKET</th>
                <th>CUSTOMER</th>
                <th>SUBJECT</th>
                <th>PRIORITY</th>
                <th>ASSIGNEE</th>
                <th>STATUS</th>
                <th>UPDATED</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr
                  className="ticket-row clickable-row"
                  key={t.id}
                  onClick={() => handleTicketClick(t.id)}
                >
                  <td className="ticket-id">{t.id}</td>
                  <td>
                    <div className="table-name">
                      <Avatar
                        initials={t.initials}
                        color={t.color}
                        size="sm"
                      />
                      <strong>{t.customer}</strong>
                    </div>
                  </td>
                  <td className="subject-cell">{t.subject}</td>
                  <td>
                    <Badge
                      tone={
                        t.priority === "High"
                          ? "orange"
                          : t.priority === "Medium"
                            ? "blue"
                            : "neutral"
                      }
                    >
                      {t.priority}
                    </Badge>
                  </td>
                  <td>{t.assignee}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>{t.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          showingText="Showing 5 of 24 tickets"
          currentPage={1}
          totalPages={2}
          onPrev={() => notify("You're on the first page")}
          onNext={() => notify("More tickets are coming soon")}
          onPageSelect={() => notify("More tickets are coming soon")}
        />
      </Card>
    </main>
  )
}
