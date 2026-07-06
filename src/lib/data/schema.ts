export type OrderStatus = "PAID" | "ISSUED" | "FAILED" | "PENDING"
export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING"
export type PaymentMethod = "PG" | "VA"
export type Gateway = "Midtrans" | "Xendit" | "Doku" | "Direct Bank"
export type TicketStatus = "ACTIVE" | "USED" | "EXPIRED" | "REFUND"

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  loyaltyNo?: string
  totalOrders: number
  lastVisit: string
  createdAt: string
}

export interface OrderItem {
  unitId: string
  ticketType: string
  qty: number
  unitPrice: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: OrderItem[]
  amount: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  orderDate: string
  visitDate: string
}

export interface Payment {
  id: string
  orderId: string
  customerId: string
  customerName: string
  amount: number
  fee: number
  netAmount: number
  method: PaymentMethod
  gateway: Gateway
  status: PaymentStatus
  paidAt: string
  settlement: string
  gatewayResponse: string
  callbackLog: string
}

export interface Ticket {
  id: string
  orderId: string
  unitId: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  ticketType: string
  status: TicketStatus
  issuedAt: string
  usedAt?: string
  validUntil: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  paidIssued: number
  failedPending: number
  totalMismatch: number
  orphanPayments: number
  overallMatchRate: number
  unitRates: Record<string, number>
  unitVisitors: Record<string, number>
  unitRevenue: Record<string, number>
  alerts: { label: string; desc: string; link: string; action: string }[]
  todaySales: number
  todayTransactions: number
  totalTicketsSold: number
  activeTickets: number
  successRate: number
  methodCounts: Record<string, number>
}

export interface OrderFilters {
  search?: string
  unitId?: string
  status?: OrderStatus | "all"
  dateType?: "orderDate" | "visitDate"
  dateFrom?: string
  dateTo?: string
}

export interface PaymentFilters {
  search?: string
  status?: PaymentStatus | "all"
  method?: PaymentMethod | "all"
  dateFrom?: string
  dateTo?: string
}

export interface TicketFilters {
  search?: string
  unitId?: string
  status?: TicketStatus | "all"
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
