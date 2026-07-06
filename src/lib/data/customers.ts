import { db } from "./db"
import type { Customer } from "./schema"

export function getCustomers(): Customer[] {
  return db.customers
}

export function getCustomerById(id: string): Customer | undefined {
  return db.customers.find((c) => c.id === id)
}

export function searchCustomers(q: string): Customer[] {
  const lower = q.toLowerCase()
  return db.customers.filter(
    (c) => c.name.toLowerCase().includes(lower) || c.phone.includes(lower) || c.id.toLowerCase().includes(lower),
  )
}
