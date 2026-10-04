import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { Conversation, TicketItem } from "../mocks/types"
import { conversations } from "../mocks/conversations"
import { tickets } from "../mocks/tickets"

export type ModalType = "agent" | "upload" | "url" | "faq" | null

interface AppContextValue {
  toast: string
  setToast: (toast: string) => void
  notify: (message: string) => void
  modal: ModalType
  setModal: React.Dispatch<React.SetStateAction<ModalType>>
  draftName: string
  setDraftName: React.Dispatch<React.SetStateAction<string>>
  createdAgents: string[]
  setCreatedAgents: React.Dispatch<React.SetStateAction<string[]>>
  uploadedSources: { title: string; type: "Document" | "Website" | "FAQ" }[]
  setUploadedSources: React.Dispatch<
    React.SetStateAction<{ title: string; type: "Document" | "Website" | "FAQ" }[]>
  >
  uploadProgress: number | null
  setUploadProgress: React.Dispatch<React.SetStateAction<number | null>>
  fileRef: React.RefObject<HTMLInputElement | null>
  handleFiles: (files: File[]) => void
  selectedConversation: number
  setSelectedConversation: React.Dispatch<React.SetStateAction<number>>
  sentMessages: Record<number, string[]>
  setSentMessages: React.Dispatch<React.SetStateAction<Record<number, string[]>>>
  commandOpen: boolean
  setCommandOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedTicket: TicketItem | null
  setSelectedTicket: React.Dispatch<React.SetStateAction<TicketItem | null>>
  selectedCustomer: Conversation | null
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Conversation | null>>
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  mobileOpen: boolean
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
  currentConversation: Conversation
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [modal, setModal] = useState<ModalType>(null)
  const [draftName, setDraftName] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [sentMessages, setSentMessages] = useState<Record<number, string[]>>({})
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Conversation | null>(null)
  const [createdAgents, setCreatedAgents] = useState<string[]>([])
  const [uploadedSources, setUploadedSources] = useState<
    { title: string; type: "Document" | "Website" | "FAQ" }[]
  >([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 3500)
  }

  const handleFiles = (files: File[]) => {
    if (!files.length) return
    const allowed = ["pdf", "docx", "txt"]
    if (
      files.some(
        (file) =>
          file.size > 20 * 1024 * 1024 ||
          !allowed.includes(file.name.split(".").pop()?.toLowerCase() || ""),
      )
    ) {
      notify("Use PDF, DOCX, or TXT files under 20MB")
      return
    }
    setUploadProgress(15)
    window.setTimeout(() => setUploadProgress(65), 350)
    window.setTimeout(() => {
      setUploadedSources((v) => [
        ...files.map((file) => ({
          title: file.name,
          type: "Document" as const,
        })),
        ...v,
      ])
      setUploadProgress(null)
      notify(
        `${files.length} file${files.length === 1 ? "" : "s"} added to knowledge base`,
      )
    }, 800)
  }

  const currentConversation =
    conversations.find((c) => c.id === selectedConversation) || conversations[0]

  // Global keyboard shortcuts (Cmd+K and Escape)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
      if (e.key === "Escape") {
        setCommandOpen(false)
        setModal(null)
        if (location.pathname.startsWith("/tickets/")) {
          navigate("/tickets")
        } else if (location.pathname.startsWith("/customers/")) {
          navigate("/customers")
        } else if (location.pathname === "/agents/new") {
          navigate("/agents")
        } else {
          setSelectedTicket(null)
          setSelectedCustomer(null)
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [location.pathname, navigate])

  return (
    <AppContext.Provider
      value={{
        toast,
        setToast,
        notify,
        modal,
        setModal,
        draftName,
        setDraftName,
        createdAgents,
        setCreatedAgents,
        uploadedSources,
        setUploadedSources,
        uploadProgress,
        setUploadProgress,
        fileRef,
        handleFiles,
        selectedConversation,
        setSelectedConversation,
        sentMessages,
        setSentMessages,
        commandOpen,
        setCommandOpen,
        selectedTicket,
        setSelectedTicket,
        selectedCustomer,
        setSelectedCustomer,
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
        currentConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
