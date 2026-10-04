import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface TableProps {
  children: ReactNode
  className?: string
}

export default function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`table-scroll ${className}`}>
      <table>{children}</table>
    </div>
  )
}

export interface TablePaginationProps {
  showingText: string
  currentPage?: number
  totalPages?: number
  onPrev?: () => void
  onNext?: () => void
  onPageSelect?: (page: number) => void
}

export function TablePagination({
  showingText,
  currentPage = 1,
  totalPages = 2,
  onPrev,
  onNext,
  onPageSelect,
}: TablePaginationProps) {
  return (
    <div className="table-footer">
      <span>{showingText}</span>
      <div>
        <button
          className="icon-button bordered"
          onClick={onPrev}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={`page-number ${currentPage === pageNum ? "active" : ""}`}
            onClick={() => onPageSelect?.(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        <button
          className="icon-button bordered"
          onClick={onNext}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
