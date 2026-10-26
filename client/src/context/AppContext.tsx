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
  knowledgeRefreshKey: number
  triggerKnowledgeRefresh: () => void
  currentConversation: Conversation
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

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
  const [knowledgeRefreshKey, setKnowledgeRefreshKey] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const triggerKnowledgeRefresh = () => {
    setKnowledgeRefreshKey((v) => v + 1)
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 3500)
  }

  const handleFiles = (files: File[]) => {
    if (!files.length) return
    const allowed = ["pdf", "docx", "txt"]
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || ""
      if (!allowed.includes(ext)) {
        notify(`"${file.name}" has an unsupported format. Use PDF, DOCX, or TXT.`)
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        notify(`"${file.name}" exceeds 20MB limit.`)
        return
      }
    }

    setUploadProgress(5)
    let completedCount = 0
    const totalFiles = files.length

    const uploadSingle = (file: File): Promise<void> => {
      return new Promise((resolve) => {
        const formData = new FormData()
        formData.append("file", file)

        const xhr = new XMLHttpRequest()
        xhr.open("POST", `${API_URL}/api/knowledge/upload`, true)
        xhr.withCredentials = true

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const fileProgress = e.loaded / e.total
            const overall = Math.round(((completedCount + fileProgress) / totalFiles) * 100)
            setUploadProgress(Math.min(99, Math.max(5, overall)))
          }
        }

        xhr.onload = () => {
          completedCount++
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            try {
              const res = JSON.parse(xhr.responseText)
              notify(res.message || `Failed to upload ${file.name}`)
            } catch {
              notify(`Failed to upload ${file.name}`)
            }
            resolve()
          }
        }

        xhr.onerror = () => {
          completedCount++
          notify(`Network error uploading ${file.name}`)
          resolve()
        }

        xhr.send(formData)
      })
    }

    ;(async () => {
      for (const file of files) {
        await uploadSingle(file)
      }
      setUploadProgress(100)
      window.setTimeout(() => {
        setUploadProgress(null)
        notify(`${files.length} file${files.length === 1 ? "" : "s"} uploaded. Processing in background...`)
        triggerKnowledgeRefresh()
      }, 400)
    })()
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
        knowledgeRefreshKey,
        triggerKnowledgeRefresh,
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
