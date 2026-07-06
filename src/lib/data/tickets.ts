import { db } from "./db"
import type { Ticket, TicketFilters, PaginatedResult } from "./schema"

export function getTickets(filters: TicketFilters = {}): PaginatedResult<Ticket> {
  let result = [...db.tickets]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q),
    )
  }

  if (filters.unitId && filters.unitId !== "all") {
    result = result.filter((t) => t.unitId === filters.unitId)
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status)
  }

  return {
    data: result,
    total: result.length,
    page: 1,
    pageSize: result.length,
    totalPages: 1,
  }
}

export function getTicketById(id: string): Ticket | undefined {
  return db.tickets.find((t) => t.id === id)
}

export function getTicketsByOrder(orderId: string): Ticket[] {
  return db.tickets.filter((t) => t.orderId === orderId)
}
