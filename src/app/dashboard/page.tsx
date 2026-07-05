"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import CardDataStats from "@/components/layout/CardDataStats"
import dynamic from "next/dynamic"
import { ShoppingCart, TrendingUp, AlertTriangle, ShieldAlert, Wallet, MessageCircle, Clock, RefreshCw, Wifi, ChevronDown, Calendar, CheckCircle } from "lucide-react"
import { UNITS } from "@/lib/units"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const periods = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
]

const chartColors = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#00B4D8"]

const unitRates: Record<string, number> = { dfn: 98.5, swa: 96.2, ods: 93.1, awa: 82.5, pgu: 95.8, jbl: 97.3 }
const unitVisitors: Record<string, number> = { dfn: 28450, swa: 12380, ods: 8970, awa: 15620, pgu: 42350, jbl: 6750 }

const rates = Object.values(unitRates)
const totalOrders = 1234
const overallMatchRate = Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1))
const totalMismatch = Math.round(totalOrders * (100 - overallMatchRate) / 100)
const orphanPayments = 3
const totalRevenue = 185000000

const alerts = [
  { label: "Mismatch Data", desc: `${totalMismatch} transactions don't match`, link: "/reconciliation", action: "Review" },
  { label: "Orphan Payment", desc: `${orphanPayments} payments without orders`, link: "/payments", action: "Check" },
  { label: "Sync Error — Dufan", desc: "Sync failed 30 minutes ago", link: "/wahana", action: "Check" },
  { label: "Sync Error — Atlantis", desc: "Sync failed 2 hours ago", link: "/wahana", action: "Check" },
]

const fullAlerts = [
  { label: "Mismatch Data", desc: "47 transactions don't match", link: "/reconciliation", action: "Review" },
  { label: "Orphan Payment", desc: "3 payments without orders", link: "/payments", action: "Check" },
  { label: "Sync Error — Dufan", desc: "Sync failed 30 minutes ago", link: "/wahana", action: "Check" },
  { label: "Sync Error — Atlantis", desc: "Sync failed 2 hours ago", link: "/wahana", action: "Check" },
  { label: "Sync Error — Sea World", desc: "Sync failed 45 minutes ago", link: "/wahana", action: "Check" },
  { label: "Low Stock — Bahari", desc: "Tiket Reguler tersisa 12", link: "/wahana", action: "Restock" },
  { label: "Pending Refund — IDR 450K", desc: "3 refund requests awaiting approval", link: "/orders", action: "Approve" },
  { label: "Payment Gateway Down", desc: "Midtrans VA timeout 5 menit terakhir", link: "/payments", action: "Monitor" },
  { label: "Unreconciled — Samudra", desc: "28 tiket belum direkonsiliasi sejak kemarin", link: "/reconciliation/samudra", action: "Reconcile" },
  { label: "Ticket Expired — Bird Land", desc: "15 tiket expired belum di-refund", link: "/tickets", action: "Process" },
  { label: "API Rate Limit — Dufan", desc: "Mendekati limit 80%", link: "/wahana", action: "Check" },
  { label: "Duplicate Order — IDR 2.1M", desc: "2 order dengan amount sama, perlu diverifikasi", link: "/orders", action: "Verify" },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState("month")
  const [showPeriod, setShowPeriod] = useState(false)
  const [demoMode, setDemoMode] = useState<"normal" | "empty" | "full">("normal")
  const [lastRefresh] = useState(() => {
    const now = new Date()
    return now.toLocaleString("en-US", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
  })

  const displayAlerts = demoMode === "full" ? fullAlerts : demoMode === "empty" ? [] : alerts

  const trendChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { type: "line", toolbar: { show: false } },
    stroke: { width: [0, 2], curve: "smooth" },
    xaxis: {
      categories: Array.from({ length: 30 }, (_, i) => `${i + 1} Jun`),
    },
    yaxis: [
      { title: { text: "Revenue (Rp)" } },
      { opposite: true, title: { text: "Orders" } },
    ],
    colors: ["#3B82F6", "#10B981"],
  }), [])

  const trendChartSeries = useMemo(() => [
    {
      name: "Revenue",
      type: "column",
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 2),
    },
    {
      name: "Orders",
      type: "line",
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 30),
    },
  ], [])

  const donutChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { type: "donut" },
    colors: chartColors,
    labels: UNITS.map((u) => u.name),
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Match Rate",
              formatter: () => `${overallMatchRate}%`,
            },
          },
        },
      },
    },
  }), [])

  const matchRateChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#10B981"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 3,
    },
    xaxis: {
      categories: Array.from({ length: 30 }, (_, i) => `${i + 1} Jun`),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#64748B", fontSize: "10px" },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        style: { colors: "#64748B", fontSize: "12px" },
        formatter: (v) => `${v}%`,
      },
    },
    tooltip: {
      y: { formatter: (v) => `${v}%` },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
  }), [])

  const matchRateSeries = useMemo(() => [
    {
      name: "Match Rate",
      data: Array.from({ length: 30 }, () => Number((Math.random() * 15 + 85).toFixed(1))),
    },
  ], [])

  const selectedPeriod = periods.find((p) => p.value === period)

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Dashboard" />

      {/* Period Filter + Last Updated */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <button
            onClick={() => setShowPeriod(!showPeriod)}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium text-black shadow-default hover:bg-gray-1"
          >
            <Calendar className="h-4 w-4 text-body" />
            {selectedPeriod?.label}
            <ChevronDown className="h-4 w-4 text-body" />
          </button>
          {showPeriod && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPeriod(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-stroke bg-white shadow-default">
                {periods.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { setPeriod(p.value); setShowPeriod(false) }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-1 first:rounded-t-lg last:rounded-b-lg ${period === p.value ? "bg-primary/10 font-semibold text-primary" : "text-black"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-body">
          <RefreshCw className="h-3.5 w-3.5" />
          Last updated: {lastRefresh}
        </div>
      </div>

      {/* Total Revenue */}
      <div className="relative mb-6 overflow-hidden rounded-lg border border-stroke bg-white p-6 shadow-default">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="text-white flex-1 min-w-0">
            <p className="text-sm font-medium opacity-90 truncate">Total Revenue {selectedPeriod?.label.toLowerCase()}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold whitespace-nowrap">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalRevenue)}</p>
              <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </span>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/revenue-bg.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Orders" total={totalOrders.toLocaleString()} rate="+2.5%" levelUp>
          <ShoppingCart className="h-5 w-5 text-primary" />
        </CardDataStats>
        <CardDataStats title="Match Rate" total={`${overallMatchRate}%`} rate="+0.8%" levelUp>
          <TrendingUp className="h-5 w-5 text-primary" />
        </CardDataStats>
        <CardDataStats title="Mismatch" total={String(totalMismatch)} rate="-0.5%" levelDown>
          <AlertTriangle className="h-5 w-5 text-primary" />
        </CardDataStats>
        <CardDataStats title="Orphan Payments" total={String(orphanPayments)} rate="+0.1%" levelUp>
          <ShieldAlert className="h-5 w-5 text-primary" />
        </CardDataStats>
      </div>

      {/* WhatsApp API Status + Alert Panel */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* WhatsApp Status */}
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-black">WhatsApp API</h3>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              <Wifi className="h-3 w-3" />
              Online
            </span>
          </div>
          <div className="ml-7 divide-y divide-stroke">
            <div className="flex items-center justify-between text-sm py-3 first:pt-0 last:pb-0">
              <span className="text-body">Messages Sent</span>
              <span className="font-bold text-black">1,247</span>
            </div>
            <div className="flex items-center justify-between text-sm py-3 first:pt-0 last:pb-0">
              <span className="text-body">Failed Messages</span>
              <span className="font-bold text-danger">23</span>
            </div>
            <div className="flex items-center justify-between text-sm py-3 first:pt-0 last:pb-0">
              <span className="text-body">Bot Response Time</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-body" />
                <span className="font-bold text-black">1.2s</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm py-3 first:pt-0 last:pb-0">
              <span className="text-body">Success Rate</span>
              <span className="font-bold text-black">98.2%</span>
            </div>
          </div>
        </div>

        {/* Alert Panel */}
        <div className="xl:col-span-2 rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-black">Needs Action</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-body">Show example if data:</span>
              <div className="flex items-center gap-1">
              <button onClick={() => setDemoMode("normal")} className={`rounded px-2 py-1 text-xs font-medium ${demoMode === "normal" ? "bg-primary text-white" : "bg-gray-1 text-black hover:bg-gray-2"}`}>Normal</button>
              <button onClick={() => setDemoMode("empty")} className={`rounded px-2 py-1 text-xs font-medium ${demoMode === "empty" ? "bg-primary text-white" : "bg-gray-1 text-black hover:bg-gray-2"}`}>Empty</button>
              <button onClick={() => setDemoMode("full")} className={`rounded px-2 py-1 text-xs font-medium ${demoMode === "full" ? "bg-primary text-white" : "bg-gray-1 text-black hover:bg-gray-2"}`}>Full</button>
            </div>
            </div>
          </div>
          {displayAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-body">
              <div className="mb-2 rounded-full bg-success/10 p-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm font-medium">All Clear</p>
              <p className="text-xs">No action needed at this time</p>
            </div>
          ) : (
            <div className={`divide-y divide-stroke ${demoMode === "full" ? "max-h-80 overflow-y-auto" : ""}`}>
              {displayAlerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-body">{alert.label}</p>
                    <p className="text-xs text-body truncate">{alert.desc}</p>
                  </div>
                  <Link
                    href={alert.link}
                    className="shrink-0 rounded border border-stroke px-3 py-1 text-xs font-medium text-black hover:bg-gray-1"
                  >
                    {alert.action}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Match Rate per Unit + Top Units by Revenue */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-black">Match Rate per Unit</h3>
            <Link href="/orders" className="text-sm font-medium text-primary">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="h-64">
              <ReactApexChart options={donutChartOptions} series={UNITS.map((u) => unitRates[u.id])} type="donut" height="100%" />
            </div>
            <div className="space-y-4">
              {UNITS.map((u, i) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                    <p className="text-sm text-black truncate">{u.name}</p>
                  </div>
                  <p className="text-sm font-bold text-black">{unitRates[u.id].toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-black">Top Units by Revenue</h3>
            <Link href="/orders" className="text-sm font-medium text-primary">See all</Link>
          </div>
          <div className="space-y-4 pt-6">
            {UNITS.map((u, i) => (
              <div key={u.id} className="flex items-center gap-4">
                <p className="text-sm font-medium text-body w-4">{i + 1}</p>
                <p className="text-sm font-medium text-black w-40 truncate">{u.name}</p>
                <div className="h-2 flex-grow rounded-full bg-stroke">
                  <div className="h-full rounded-full" style={{ width: `${80 - i * 10}%`, backgroundColor: chartColors[i % chartColors.length] }} />
                </div>
                <p className="text-sm font-medium text-black w-32 text-right whitespace-nowrap">
                  Rp {(unitVisitors[u.id] * 50000).toLocaleString("id-ID")}
                </p>
                <p className="text-sm font-bold text-black w-12 text-right">{100 - i * 5}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Revenue & Orders */}
      <div className="mt-6">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-black">Trend Revenue & Orders</h3>
            <div className="flex rounded-md border border-stroke p-1">
              {["Daily", "Weekly", "Monthly"].map((tab) => (
                <button key={tab} className={`px-3 py-1 text-sm font-medium rounded ${tab === "Daily" ? "bg-primary text-white" : "text-body hover:text-primary"}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div id="chart-revenue-orders" className="-ml-5">
            <ReactApexChart options={trendChartOptions} series={trendChartSeries} type="line" height={350} />
          </div>
        </div>
      </div>

      {/* Trend Match Rate */}
      <div className="mt-6">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <h3 className="mb-5 text-lg font-semibold text-black">Trend Match Rate</h3>
          <div id="chart-match-rate" className="-ml-5">
            <ReactApexChart options={matchRateChartOptions} series={matchRateSeries} type="area" height={350} />
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
