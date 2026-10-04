import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Download,
  Users,
  Search,
  ChevronRight,
} from "lucide-react"
import { Button, Card, Avatar } from "../components/ui"
import { conversations } from "../mocks/conversations"
import { useApp } from "../context/AppContext"

export default function CustomersPage() {
  const navigate = useNavigate()
  const { notify } = useApp()
  const [customerSearch, setCustomerSearch] = useState("")

  const filteredCustomers = conversations.filter((c) =>
    `${c.name} ${c.email} ${c.company}`
      .toLowerCase()
      .includes(customerSearch.toLowerCase()),
  )

  const handleCustomerClick = (customerId: number) => {
    navigate(`/customers/${customerId}`)
  }

  return (
    <main className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">YOUR PEOPLE</div>
          <h1>Customers</h1>
          <p>Build better relationships, one conversation at a time.</p>
        </div>
        <Button
          icon={Download}
          onClick={() => notify("Customer export is being prepared")}
        >
          Export
        </Button>
      </div>

      <div className="customer-summary">
        <div className="customer-summary-icon">
          <Users size={20} />
        </div>
        <div>
          <strong>1,284 customers</strong>
          <span>
            Across 38 companies · <b>+42</b> new this month
          </span>
        </div>
        <div className="customer-summary-avatars">
          <Avatar initials="OR" color="peach" size="sm" />
          <Avatar initials="LC" color="lavender" size="sm" />
          <Avatar initials="SM" color="mint" size="sm" />
          <Avatar initials="NW" color="blue" size="sm" />
        </div>
      </div>

      <Card className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>All customers</h2>
            <p>A complete view of everyone you support</p>
          </div>
          <div className="input-search">
            <Search size={16} />
            <input
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>COMPANY</th>
                <th>CONVERSATIONS</th>
                <th>TICKETS</th>
                <th>CSAT</th>
                <th>LAST ACTIVE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, i) => (
                <tr
                  className="customer-row clickable-row"
                  key={c.id}
                  onClick={() => handleCustomerClick(c.id)}
                >
                  <td>
                    <div className="table-name">
                      <Avatar
                        initials={c.initials}
                        color={c.color}
                        size="sm"
                      />
                      <div className="customer-table-identity">
                        <strong>{c.name}</strong>
                        <small>{c.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{c.company}</td>
                  <td>{[12, 8, 6, 15, 4][i % 5]}</td>
                  <td>{[1, 2, 0, 1, 0][i % 5]}</td>
                  <td>
                    <span className="csat-star">★</span>{" "}
                    {[4.9, 4.7, 5.0, 4.6, 4.8][i % 5].toFixed(1)}
                  </td>
                  <td>{c.time} ago</td>
                  <td>
                    <ChevronRight size={16} className="muted-icon" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  )
}
