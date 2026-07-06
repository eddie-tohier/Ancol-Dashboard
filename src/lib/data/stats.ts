import { db } from "./db"
import { TODAY } from "./constants"
import type { DashboardStats } from "./schema"

function getPeriodDateRange(period?: string): { start: string; end: string } | null {
  if (!period || period === "all") return null
  const end = TODAY
  if (period === "today") return { start: end, end }
  const start = new Date(TODAY)
  if (period === "week") {
    const day = start.getDay()
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
  } else if (period === "month") {
    start.setDate(1)
  } else if (period === "last3months") {
    start.setMonth(start.getMonth() - 3)
  } else if (period === "year") {
    start.setMonth(0, 1)
  } else return null
  return { start: start.toISOString().slice(0, 10), end }
}

function filterByPeriod(range: { start: string; end: string } | null) {
  const { orders: allOrders, payments: allPayments, tickets: allTickets } = db
  if (!range) return { orders: allOrders, payments: allPayments, tickets: allTickets }
  const orders = allOrders.filter((o) => o.orderDate >= range.start && o.orderDate <= range.end)
  const orderIds = new Set(orders.map((o) => o.id))
  
  const payments = allPayments.filter((p) => {
    const order = allOrders.find((o) => o.id === p.orderId)
    if (order) {
      return orderIds.has(order.id)
    } else {
      // It is an orphan payment (no matching order in db)
      const match = p.id.match(/PAY-(\d+)/)
      if (match) {
        const correspondingOrderId = `ORD-${match[1]}`
        const correspondingOrder = allOrders.find((o) => o.id === correspondingOrderId)
        if (correspondingOrder) {
          return correspondingOrder.orderDate >= range.start && correspondingOrder.orderDate <= range.end
        }
      }
      if (p.paidAt && p.paidAt !== '-') {
        return p.paidAt >= range.start && p.paidAt <= range.end
      }
      return false
    }
  })

  const tickets = allTickets.filter((t) => orderIds.has(t.orderId))
  return { orders, payments, tickets }
}

export function getDashboardStats(period?: string): DashboardStats {
  const { orders, payments, tickets } = filterByPeriod(getPeriodDateRange(period))

  const totalRevenue = orders
    .filter((o) => o.status === "PAID" || o.status === "ISSUED")
    .reduce((s, o) => s + o.amount, 0)
  const totalOrders = orders.length
  const paidIssued = orders.filter((o) => o.status === "PAID" || o.status === "ISSUED").length
  const failedPending = orders.filter((o) => o.status === "FAILED" || o.status === "PENDING").length

  const mismatched = payments.filter((p) => {
    const order = orders.find((o) => o.id === p.orderId)
    return order && order.amount !== p.amount
  })
  const totalMismatch = mismatched.length
  const orphanPayments = payments.filter(
    (p) => !orders.some((o) => o.id === p.orderId),
  ).length

  const overallMatchRate = payments.length > 0
    ? Math.round(((payments.length - totalMismatch) / payments.length) * 100)
    : 100

  const unitRates: Record<string, number> = {}
  const unitVisitors: Record<string, number> = {}
  const unitRevenue: Record<string, number> = {}
  for (const unit of ["dfn", "swa", "ods", "awa", "pgu", "jbl"]) {
    const unitOrders = orders.filter((o) => o.items.some((it) => it.unitId === unit))
    const unitPayments = payments.filter((p) => {
      const o = orders.find((ord) => ord.id === p.orderId)
      return o && o.items.some((it) => it.unitId === unit)
    })
    const match = unitPayments.filter((p) => {
      const o = orders.find((ord) => ord.id === p.orderId)
      return o && o.amount === p.amount
    })
    unitRates[unit] = unitPayments.length > 0
      ? Math.round((match.length / unitPayments.length) * 100)
      : 100
    unitVisitors[unit] = unitOrders.reduce(
      (s, o) => s + o.items.filter((it) => it.unitId === unit).reduce((a, i) => a + i.qty, 0),
      0,
    )
    unitRevenue[unit] = unitOrders.reduce(
      (s, o) => s + o.items.filter((it) => it.unitId === unit).reduce((a, i) => a + i.qty * i.unitPrice, 0),
      0,
    )
  }

  const today = TODAY
  const todayOrders = orders.filter((o) => o.orderDate === today)
  const todaySales = todayOrders.reduce((s, o) => s + o.amount, 0)
  const todayTransactions = todayOrders.length

  const totalTicketsSold = tickets.length
  const activeTickets = tickets.filter((t) => t.status === "ACTIVE").length

  const successPayments = payments.filter((p) => p.status === "SUCCESS").length
  const successRate = payments.length > 0
    ? Math.round((successPayments / payments.length) * 100)
    : 0

  const methodCounts: Record<string, number> = {}
  for (const p of payments) {
    methodCounts[p.method] = (methodCounts[p.method] || 0) + 1
  }

  const alerts: DashboardStats["alerts"] = []

  if (totalMismatch > 0) {
    alerts.push({
      label: `${totalMismatch} Payment Mismatch`,
      desc: "Order amounts don't match payment records",
      link: "/payments",
      action: "Review",
    })
  }

  if (orphanPayments > 0) {
    alerts.push({
      label: `${orphanPayments} Orphan Payments`,
      desc: "Payments without matching orders",
      link: "/payments",
      action: "Investigate",
    })
  }

  const failedCount = payments.filter((p) => p.status === "FAILED").length
  if (failedCount > 0) {
    alerts.push({
      label: `${failedCount} Failed Payments`,
      desc: "Payments that did not go through",
      link: "/payments",
      action: "View",
    })
  }

  const expiringTickets = tickets.filter(
    (t) => t.status === "ACTIVE" && t.validUntil < TODAY,
  ).length
  if (expiringTickets > 0) {
    alerts.push({
      label: `${expiringTickets} Expiring Tickets`,
      desc: "Active tickets past their valid date",
      link: "/tickets",
      action: "Check",
    })
  }

  return {
    totalRevenue,
    totalOrders,
    paidIssued,
    failedPending,
    totalMismatch,
    orphanPayments,
    overallMatchRate,
    unitRates,
    unitVisitors,
    unitRevenue,
    alerts,
    todaySales,
    todayTransactions,
    totalTicketsSold,
    activeTickets,
    successRate,
    methodCounts,
  }
}

function pad(n: number) { return String(n).padStart(2, "0") }

export interface TrendDataPoint {
  label: string
  revenue: number
  orders: number
}

export function getTrendData(tab: "daily" | "weekly" | "monthly", period?: string): TrendDataPoint[] {
  const { orders } = filterByPeriod(getPeriodDateRange(period))
  const result: TrendDataPoint[] = []

  if (tab === "daily") {
    const dateMap: Record<string, { revenue: number; orders: number }> = {}
    for (const o of orders) {
      if (!dateMap[o.orderDate]) dateMap[o.orderDate] = { revenue: 0, orders: 0 }
      dateMap[o.orderDate].revenue += o.amount
      dateMap[o.orderDate].orders++
    }
    const sorted = Object.keys(dateMap).sort()
    for (const date of sorted) {
      const [y, m, d] = date.split("-")
      result.push({
        label: `${parseInt(d)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1]}`,
        revenue: dateMap[date].revenue,
        orders: dateMap[date].orders,
      })
    }
  } else if (tab === "weekly") {
    const weekMap: Record<string, { revenue: number; orders: number }> = {}
    for (const o of orders) {
      const d = new Date(o.orderDate)
      const dayOfWeek = d.getDay()
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diff))
      const key = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
      if (!weekMap[key]) weekMap[key] = { revenue: 0, orders: 0 }
      weekMap[key].revenue += o.amount
      weekMap[key].orders++
    }
    const sorted = Object.keys(weekMap).sort()
    for (const key of sorted) {
      const [y, m, d] = key.split("-")
      result.push({
        label: `${parseInt(d)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1]}`,
        revenue: weekMap[key].revenue,
        orders: weekMap[key].orders,
      })
    }
  } else {
    const monthMap: Record<string, { revenue: number; orders: number }> = {}
    for (const o of orders) {
      const key = o.orderDate.slice(0, 7)
      if (!monthMap[key]) monthMap[key] = { revenue: 0, orders: 0 }
      monthMap[key].revenue += o.amount
      monthMap[key].orders++
    }
    const sorted = Object.keys(monthMap).sort()
    for (const key of sorted) {
      const [y, m] = key.split("-")
      result.push({
        label: `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1]} ${y}`,
        revenue: monthMap[key].revenue,
        orders: monthMap[key].orders,
      })
    }
  }

  return result
}

export interface MatchRatePoint {
  date: string
  label: string
  rate: number
}

export function getMatchRateTrend(period?: string): MatchRatePoint[] {
  const { orders, payments } = filterByPeriod(getPeriodDateRange(period))
  const dateMap: Record<string, { matched: number; total: number }> = {}

  for (const p of payments) {
    const order = orders.find((o) => o.id === p.orderId)
    if (!order) continue
    const date = order.orderDate
    if (!dateMap[date]) dateMap[date] = { matched: 0, total: 0 }
    dateMap[date].total++
    if (order.amount === p.amount) dateMap[date].matched++
  }

  const sorted = Object.keys(dateMap).sort()
  return sorted.map((date) => {
    const [y, m, d] = date.split("-")
    const label = `${parseInt(d)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1]}`
    const { matched, total } = dateMap[date]
    return {
      date,
      label,
      rate: total > 0 ? Math.round((matched / total) * 100) : 100,
    }
  })
}
