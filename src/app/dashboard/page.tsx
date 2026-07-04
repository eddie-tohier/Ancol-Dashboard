"use client"

import Link from "next/link"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import CardDataStats from "@/components/layout/CardDataStats"
import dynamic from "next/dynamic"
import { ShoppingCart, TrendingUp, AlertTriangle, ShieldAlert, Wallet } from "lucide-react"
import { UNITS } from "@/lib/units"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const trendChartOptions: ApexCharts.ApexOptions = {
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
}

const trendChartSeries = [
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
]

const chartColors = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#00B4D8"]

const donutChartOptions: ApexCharts.ApexOptions = {
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
}

const unitRates: Record<string, number> = { dfn: 98.5, swa: 96.2, ods: 93.1, awa: 82.5, pgu: 95.8, jbl: 97.3 }
const unitVisitors: Record<string, number> = { dfn: 28450, swa: 12380, ods: 8970, awa: 15620, pgu: 42350, jbl: 6750 }

const rates = Object.values(unitRates)
const totalOrders = 1234
const overallMatchRate = Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1))
const totalMismatch = Math.round(totalOrders * (100 - overallMatchRate) / 100)
const orphanPayments = 3
const totalRevenue = 185000000

const matchRateChartOptions: ApexCharts.ApexOptions = {
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
}

const matchRateSeries = [
  {
    name: "Match Rate",
    data: Array.from({ length: 30 }, () => Number((Math.random() * 15 + 85).toFixed(1))),
  },
]

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Dashboard" />
      <div className="relative mb-6 overflow-hidden rounded-lg border border-stroke bg-white p-6 shadow-default">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="text-white">
            <p className="text-sm font-medium opacity-90">Total Revenue this month</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalRevenue)}</p>
              <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
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

      <div className="mt-6">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-black">Match Rate per Wahana (30 Hari)</h3>
            <Link href="/orders" className="text-sm font-medium text-primary">Lihat semua</Link>
          </div>
          <div className="flex items-center gap-8">
            <div className="w-1/3 h-64">
              <ReactApexChart options={donutChartOptions} series={UNITS.map((u) => unitRates[u.id])} type="donut" height="100%" />
            </div>
            <div className="w-2/3 space-y-4">
              {UNITS.map((u, i) => (
                <div key={u.id} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-1/3">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                    <p className="text-sm text-black truncate">{u.name}</p>
                  </div>
                  <div className="h-2 flex-grow rounded-full bg-stroke">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${unitRates[u.id]}%`, 
                        backgroundColor: chartColors[i % chartColors.length] 
                      }} 
                    />
                  </div>
                  <p className="text-sm font-bold text-black w-12 text-right">{unitRates[u.id].toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-black">Trend Revenue & Orders (30 Hari)</h3>
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

      <div className="mt-6">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <h3 className="mb-5 text-lg font-semibold text-black">Trend Match Rate (30 Hari)</h3>
          <div id="chart-match-rate" className="-ml-5">
            <ReactApexChart options={matchRateChartOptions} series={matchRateSeries} type="area" height={350} />
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
