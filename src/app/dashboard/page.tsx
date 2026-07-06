"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import CardDataStats from "@/components/layout/CardDataStats"
import dynamic from "next/dynamic"
import { ShoppingCart, TrendingUp, AlertTriangle, ShieldAlert, Wallet, MessageCircle, Clock, RefreshCw, Wifi, ChevronDown, Calendar, CheckCircle } from "lucide-react"
import { UNITS } from "@/lib/units"
import { getDashboardStats, getTrendData, getMatchRateTrend } from "@/lib/data"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const periods = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Months", value: "last3months" },
  { label: "This Year", value: "year" },
]

const chartColors = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#00B4D8"]

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
  const [period, setPeriod] = useState("last3months")
  const [showPeriod, setShowPeriod] = useState(false)
  const [demoMode, setDemoMode] = useState<"normal" | "empty" | "full">("normal")
  const [trendTab, setTrendTab] = useState<"daily" | "weekly" | "monthly">("daily")
  const [lastRefresh] = useState(() => {
    const now = new Date()
    return now.toLocaleString("en-US", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
  })

  const stats = useMemo(() => getDashboardStats(period), [period])

  const unitRates = stats.unitRates
  const unitVisitors = stats.unitVisitors
  const unitRevenue = stats.unitRevenue
  const maxRevenue = Math.max(...Object.values(unitRevenue), 1)
  const rates = Object.values(unitRates)
  const totalOrders = stats.totalOrders
  const overallMatchRate = Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1))
  const totalMismatch = stats.totalMismatch
  const orphanPayments = stats.orphanPayments
  const totalRevenue = stats.totalRevenue
  const alerts = stats.alerts

  const displayAlerts = demoMode === "full" ? fullAlerts : demoMode === "empty" ? [] : alerts

  const trendDataPoints = useMemo(() => getTrendData(trendTab, period), [trendTab, period])

  const trendChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
    chart: { type: "bar", toolbar: { show: false } },
    colors: ["#3B82F6"],
    xaxis: {
      categories: trendDataPoints.map((p) => p.label),
    },
    yaxis: {
      title: { text: "Orders" },
    },
  }), [trendDataPoints])

  const trendChartSeries = useMemo(() => [
    {
      name: "Orders",
      data: trendDataPoints.map((p) => p.orders),
    },
  ], [trendDataPoints])

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
  }), [overallMatchRate])

  const matchRateTrend = useMemo(() => getMatchRateTrend(period), [period])

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
      categories: matchRateTrend.map((p) => p.label),
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
  }), [matchRateTrend])

  const matchRateSeries = useMemo(() => [
    {
      name: "Match Rate",
      data: matchRateTrend.map((p) => p.rate),
    },
  ], [matchRateTrend])

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
        <CardDataStats title="Total Orders" total={totalOrders.toLocaleString()} rate="+2.5%" levelUp bgImage="/cube-bg.jpg">
          <ShoppingCart />
        </CardDataStats>
        <CardDataStats title="Match Rate" total={`${overallMatchRate}%`} rate="+0.8%" levelUp bgImage="/cube-bg_1.jpg">
          <TrendingUp />
        </CardDataStats>
        <CardDataStats title="Mismatch" total={String(totalMismatch)} rate="-0.5%" levelDown bgImage="/cube-bg_2.jpg">
          <AlertTriangle />
        </CardDataStats>
        <CardDataStats title="Orphan Payments" total={String(orphanPayments)} rate="+0.1%" levelUp bgImage="/cube-bg_3.jpg">
          <ShieldAlert />
        </CardDataStats>
      </div>

      {/* WhatsApp API Status + Alert Panel */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-lg border border-stroke bg-white px-6 pb-6 pt-7.5 shadow-default">
          {/* Subtle decorative glow overlay for light theme */}
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          
          <div className="relative z-10 flex items-center gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-black">WhatsApp API</h3>
              <p className="text-xs font-bold text-emerald-600 font-mono tracking-widest uppercase">Engine Status</p>
            </div>
            
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            {/* Grid 1: Sent */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-all duration-300">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Messages Sent</span>
              <span className="text-2xl font-bold text-black block">1,247</span>
              <span className="text-xs text-emerald-600 font-semibold">✓ Delivery Success</span>
            </div>

            {/* Grid 2: Success Rate */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-all duration-300">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Success Rate</span>
              <span className="text-2xl font-bold text-emerald-600 block">98.2%</span>
              <span className="text-xs text-slate-400 font-semibold block">Target &gt; 95%</span>
            </div>

            {/* Grid 3: Response Time */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-all duration-300">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Response Time</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-black">1.2s</span>
                <span className="text-xs text-slate-400 font-semibold">avg</span>
              </div>
              <span className="text-xs text-emerald-600 font-semibold">⚡ Ultra Fast</span>
            </div>

            {/* Grid 4: Failed */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-all duration-300">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Failed Messages</span>
              <span className="text-2xl font-bold text-rose-600 block">23</span>
              <span className="text-xs text-slate-400 font-semibold block">1.8% Loss Rate</span>
            </div>
          </div>
        </div>

        {/* Alert Panel */}
        <div className="xl:col-span-2 rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-black">Needs Action</h3>
              {displayAlerts.length > 0 && (
                <span className="text-sm text-slate-400 font-bold">
                  ({displayAlerts.length})
                </span>
              )}
            </div>
            
            <div className="flex rounded-md border border-stroke p-0.5 bg-gray-50">
              {(["normal", "empty", "full"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDemoMode(mode)}
                  className={`px-2.5 py-1 text-sm rounded font-semibold capitalize transition-all ${
                    demoMode === mode ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-primary"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {displayAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <CheckCircle className="h-5 w-5 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-black">All reconciled</p>
              <p className="text-sm mt-1">No action needed at this time</p>
            </div>
          ) : (
            <div className={`divide-y divide-stroke ${demoMode === "full" ? "max-h-80 overflow-y-auto pr-1" : ""}`}>
              {displayAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-black">{alert.label}</p>
                    <p className="text-sm text-slate-500 truncate mt-1">{alert.desc}</p>
                  </div>
                  <Link
                    href={alert.link}
                    className="group shrink-0 inline-flex items-center gap-0.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    <span>{alert.action}</span>
                    <span className="transition-transform duration-200 ease-out group-hover:translate-x-1">→</span>
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
                  <div className="h-full rounded-full" style={{ width: `${(unitRevenue[u.id] / maxRevenue) * 100}%`, backgroundColor: chartColors[i % chartColors.length] }} />
                </div>
                <p className="text-sm font-medium text-black w-32 text-right whitespace-nowrap">
                  Rp {unitRevenue[u.id].toLocaleString("id-ID")}
                </p>
                <p className="text-sm font-bold text-black w-12 text-right">{((unitRevenue[u.id] / stats.totalRevenue) * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Revenue & Orders */}
      <div className="mt-6">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-black">Order Trends</h3>
            <div className="flex rounded-md border border-stroke p-1">
              {(["daily", "weekly", "monthly"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTrendTab(tab)}
                  className={`px-3 py-1 text-sm font-medium rounded ${trendTab === tab ? "bg-primary text-white" : "text-body hover:text-primary"}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div id="chart-revenue-orders" className="-ml-5">
            <ReactApexChart options={trendChartOptions} series={trendChartSeries} type="bar" height={350} />
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
