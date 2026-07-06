import { db } from "./db"
import type { Order, OrderFilters, PaginatedResult } from "./schema"

export function getOrders(filters: OrderFilters = {}): PaginatedResult<Order> {
  let result = [...db.orders]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q),
    )
  }

  if (filters.unitId && filters.unitId !== "all") {
    result = result.filter((o) => o.items.some((it) => it.unitId === filters.unitId))
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((o) => o.status === filters.status)
  }

  const dateKey = filters.dateType || "orderDate"
  if (filters.dateFrom) {
    result = result.filter((o) => o[dateKey] >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    result = result.filter((o) => o[dateKey] <= filters.dateTo!)
  }

  return {
    data: result,
    total: result.length,
    page: 1,
    pageSize: result.length,
    totalPages: 1,
  }
}

export function getOrderById(id: string): Order | undefined {
  return db.orders.find((o) => o.id === id)
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return db.orders.filter((o) => o.customerId === customerId)
}
