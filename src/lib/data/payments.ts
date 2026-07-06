import { db } from "./db"
import type { Payment, PaymentFilters, PaginatedResult } from "./schema"

export function getPayments(filters: PaymentFilters = {}): PaginatedResult<Payment> {
  let result = [...db.payments]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q),
    )
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((p) => p.status === filters.status)
  }

  if (filters.method && filters.method !== "all") {
    result = result.filter((p) => p.method === filters.method)
  }

  if (filters.dateFrom) {
    result = result.filter((p) => p.paidAt >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    result = result.filter((p) => p.paidAt <= filters.dateTo!)
  }

  return {
    data: result,
    total: result.length,
    page: 1,
    pageSize: result.length,
    totalPages: 1,
  }
}

export function getPaymentById(id: string): Payment | undefined {
  return db.payments.find((p) => p.id === id)
}
