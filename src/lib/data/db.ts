import { seedData } from "./seed"

const data = seedData()

export const customers = data.customers
export const orders = data.orders
export const payments = data.payments
export const tickets = data.tickets

export const db = data
