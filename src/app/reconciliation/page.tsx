"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import Link from "next/link"
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, Eye } from "lucide-react"
import { getSessions } from "@/lib/data/reconciliation"
import type { ReconciliationSession } from "@/lib/data/reconciliation"
import { TODAY } from "@/lib/data/constants"

const allSessions = getSessions()

function pad(n: number) { return String(n).padStart(2, "0") }

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`
}

function shiftDay(dateStr: string, offset: number) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function MatchRateBadge({ rate }: { rate: number }) {
  const color = rate >= 95 ? "text-success border border-success" : rate >= 85 ? "text-warning border border-warning" : "text-danger border border-danger"
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${rate > 0 ? color : "text-gray-400"}`}>
      {rate > 0 ? `${rate.toFixed(1)}%` : "--"}
    </span>
  )
}

export default function ReconciliationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Use query param for date, default to TODAY
  const dateFilter = searchParams.get("date") || TODAY
  
  const [calendarOpen, setCalendarOpen] = useState(false)
  
  // Parse initial month/year from dateFilter for calendar view
  const [y, m] = dateFilter.split("-").map(Number)
  const [calMonth, setCalMonth] = useState(m)
  const [calYear, setCalYear] = useState(y)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Sync calendar view month/year when dateFilter changes
  useEffect(() => {
    const [y, m] = dateFilter.split("-").map(Number)
    if (!isNaN(y) && !isNaN(m)) {
      setCalMonth(m)
      setCalYear(y)
    }
  }, [dateFilter])

  const setDateFilter = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("date", newDate)
    router.replace(`/reconciliation?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredSessions = allSessions.filter((s) => s.date === dateFilter)

  function daysInMonth(m: number, y: number) {
    return new Date(y, m, 0).getDate()
  }

  function firstDayOfMonth(m: number, y: number) {
    return new Date(y, m - 1, 1).getDay()
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const availDays = allSessions
    .filter((s, i, a) => a.findIndex((x) => x.date === s.date) === i)
    .map((s) => s.date)
  const minDate = availDays[0]
  const maxDate = availDays[availDays.length - 1]

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Reconciliation" />

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDateFilter(shiftDay(dateFilter, -1))}
              disabled={dateFilter <= minDate}
              className="inline-flex items-center justify-center rounded border border-stroke p-2 hover:bg-gray-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="relative" ref={calendarRef}>
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="inline-flex items-center gap-2 rounded border border-stroke px-4 py-2 text-sm font-medium hover:bg-gray-1"
              >
                <Calendar className="h-4 w-4" />
                {formatDate(dateFilter)}
              </button>
              {calendarOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-stroke bg-white p-4 shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (calMonth === 1) { setCalMonth(12); setCalYear(calYear - 1) }
                        else { setCalMonth(calMonth - 1) }
                      }}
                      className="rounded p-1 hover:bg-gray-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-black">{monthNames[calMonth - 1]} {calYear}</span>
                    <button
                      onClick={() => {
                        if (calMonth === 12) { setCalMonth(1); setCalYear(calYear + 1) }
                        else { setCalMonth(calMonth + 1) }
                      }}
                      className="rounded p-1 hover:bg-gray-1"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-body mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {Array.from({ length: firstDayOfMonth(calMonth, calYear) }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth(calMonth, calYear) }, (_, i) => i + 1).map((day) => {
                      const dateStr = toDateStr(calYear, calMonth, day)
                      const hasData = availDays.includes(dateStr)
                      const isSelected = dateStr === dateFilter
                      return (
                        <button
                          key={day}
                          disabled={!hasData}
                          onClick={() => { setDateFilter(dateStr); setCalendarOpen(false) }}
                          className={`rounded py-1 text-sm ${
                            isSelected
                              ? "bg-primary text-white"
                              : hasData
                                ? "text-black hover:bg-gray-1 cursor-pointer"
                                : "text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setDateFilter(shiftDay(dateFilter, 1))}
              disabled={dateFilter >= maxDate}
              className="inline-flex items-center justify-center rounded border border-stroke p-2 hover:bg-gray-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-body">
            {filteredSessions.length} session
          </p>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="min-w-[110px] xl:pl-11">Session ID</th>
                <th className="min-w-[120px]">Date</th>
                <th className="min-w-[100px]">Time</th>
                <th className="min-w-[120px]">Duration</th>
                <th className="min-w-[110px]">Total Orders</th>
                <th className="min-w-[110px]">Match Rate</th>
                <th className="min-w-[100px]">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td className="border-b border-[#eee] pl-9 xl:pl-11">
                    <span className="font-medium text-black">{session.id}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{session.date}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{session.time}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{session.duration}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className="text-black">{session.totalOrders.toLocaleString()}</span>
                  </td>
                  <td className="border-b border-[#eee]">
                    <MatchRateBadge rate={session.matchRate} />
                  </td>
                  <td className="border-b border-[#eee]">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      session.status === "COMPLETED"
                        ? "text-success border border-success"
                        : session.status === "FAILED"
                          ? "text-danger border border-danger"
                          : session.status === "NO_ORDERS"
                            ? "text-gray-500 border border-gray-300"
                            : "text-primary border border-primary"
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] text-right">
                    {session.status === "FAILED" ? (
                      <button
                        onClick={() => alert(`Refetch data for ${session.id}...`)}
                        className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1"
                      >
                        <RefreshCw className="h-4 w-4 text-warning" />
                      </button>
                    ) : (
                      <Link href={`/reconciliation/${session.id}?date=${dateFilter}`}>
                        <button className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-body">
                    No sessions yet
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={8} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </DefaultLayout>
  )
}
