"use client"

import Link from "next/link"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import CardDataStats from "@/components/layout/CardDataStats"
import dynamic from "next/dynamic"
import { ShoppingCart, TrendingUp, AlertTriangle, ShieldAlert } from "lucide-react"
import { UNITS } from "@/lib/units"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

const chartOptions: ApexCharts.ApexOptions = {
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
    categories: Array.from({ length: 30 }, (_, i) => {
      const d = new Date(2026, 5, 4 + i)
      return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("id-ID", { month: "short" })}`
    }),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: "#64748B", fontSize: "10px" },
      rotate: 0,
      formatter: (v) => String(v ?? "").replace(" ", "\n"),
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

const unitRates: Record<string, number> = { dfn: 98.5, swa: 96.2, ods: 93.1, awa: 82.5, pgu: 95.8, jbl: 97.3 }
const unitVisitors: Record<string, number> = { dfn: 28450, swa: 12380, ods: 8970, awa: 15620, pgu: 42350, jbl: 6750 }

const rates = Object.values(unitRates)
const totalOrders = 1234
const overallMatchRate = Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1))
const totalMismatch = Math.round(totalOrders * (100 - overallMatchRate) / 100)
const orphanPayments = 3
const totalRevenue = 185000000

const chartSeries = [
  {
    name: "Match Rate",
    data: Array.from({ length: 30 }, () => Number((Math.random() * 15 + 85).toFixed(1))),
  },
]

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Dashboard" />
      <div className="mb-6 flex items-center justify-between border-y border-stroke py-4">
        <p className="text-sm font-medium text-body">Total Revenue this month</p>
        <p className="text-2xl font-bold text-black">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalRevenue)}</p>
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
          <h3 className="mb-5 text-lg font-semibold text-black">Match Rate per Wahana (30 Hari)</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {UNITS.map((u) => {
              const rate = unitRates[u.id]
              const visitors = unitVisitors[u.id]
              const color = rate >= 95 ? "text-success border border-success" : rate >= 85 ? "text-warning border border-warning" : "text-danger border border-danger"
              return (
                <Link key={u.id} href={`/orders?unit=${u.id}`} className="block rounded-lg border border-stroke bg-gray-50 p-4 text-center hover:border-primary hover:shadow-md transition">
                  <p className="mb-2 text-sm font-medium text-black">{u.name}</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold mb-1.5 ${color}`}>
                    {rate.toFixed(1)}%
                  </span>
                  <p className="text-xs text-body">{visitors.toLocaleString("id-ID")} pengunjung</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
          <h3 className="mb-5 text-lg font-semibold text-black">Trend Match Rate (30 Hari)</h3>
          <div id="chart" className="-ml-5">
            <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={350} />
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
