"use client"

import { useState } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { UNITS } from "@/lib/units"
import { Ticket, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface UnitStatus {
  id: string
  name: string
  lastSync: string
  syncStatus: "synced" | "syncing" | "error"
  activeProducts: number
  ticketsIssued: number
}

const initialStatuses: UnitStatus[] = UNITS.map((u, i) => ({
  id: u.id,
  name: u.name,
  lastSync: ["2026-07-03 14:30", "2026-07-03 14:25", "2026-07-03 14:20", "2026-07-03 14:15", "2026-07-03 14:10", "2026-07-03 14:05"][i] || "-",
  syncStatus: i === 1 ? "syncing" : i === 5 ? "error" : "synced",
  activeProducts: [12, 8, 6, 10, 5, 7][i] || 0,
  ticketsIssued: [342, 198, 124, 256, 89, 67][i] || 0,
}))

const statusConfig = {
  synced: { label: "Synced", color: "text-success", bg: "border border-success", icon: CheckCircle },
  syncing: { label: "Syncing", color: "text-primary", bg: "border border-primary", icon: Clock },
  error: { label: "Error", color: "text-danger", bg: "border border-danger", icon: AlertCircle },
}

export default function WahanaPage() {
  const [units] = useState<UnitStatus[]>(initialStatuses)
  const [refreshing, setRefreshing] = useState(false)

  function refreshAll() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Wahana" />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-black">
          Ancol recreation units &amp; ticket sync status
        </p>
        <button
          onClick={refreshAll}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded border border-stroke px-4 py-2 text-sm font-medium hover:bg-gray-1 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Syncing..." : "Sync All"}
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="xl:pl-11">Unit ID</th>
                <th className="min-w-[200px]">Unit Name</th>
                <th className="min-w-[120px]">Status Sync</th>
                <th className="min-w-[160px]">Last Sync</th>
                <th className="text-center">Active Products</th>
                <th className="text-center">Tickets Issued</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => {
                const cfg = statusConfig[u.syncStatus]
                const Icon = cfg.icon
                return (
                  <tr key={u.id}>
                    <td className="border-b border-[#eee] pl-9 font-mono font-semibold text-black xl:pl-11">
                      {u.id}
                    </td>
                    <td className="border-b border-[#eee]">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        <span className="font-medium text-black">{u.name}</span>
                      </div>
                    </td>
                    <td className="border-b border-[#eee]">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] text-sm text-black">{u.lastSync}</td>
                    <td className="border-b border-[#eee] text-center">
                      <span className="inline-flex rounded-full border border-primary px-2 py-0.5 text-xs font-medium text-primary">
                        {u.activeProducts}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] text-center text-sm font-semibold text-black">
                      {u.ticketsIssued.toLocaleString()}
                    </td>
                    <td className="border-b border-[#eee] text-right">
                      <button
                        onClick={refreshAll}
                        className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </DefaultLayout>
  )
}