"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface DateRangeFilterProps {
  dateType: "orderDate" | "visitDate"
  onDateTypeChange: (type: "orderDate" | "visitDate") => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
  onClearDates: () => void
  onChangePage: () => void
  availDates: string[]
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function daysInMonth(m: number, y: number) {
  return new Date(y, m, 0).getDate()
}

function firstDayOfMonth(m: number, y: number) {
  return new Date(y, m - 1, 1).getDay()
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

export default function DateRangeFilter({
  dateType,
  onDateTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearDates,
  onChangePage,
  availDates,
}: DateRangeFilterProps) {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [datePickerTarget, setDatePickerTarget] = useState<"from" | "to">("from")
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function openCalendar(target: "from" | "to") {
    setDatePickerTarget(target)
    setCalendarOpen(true)
  }

  function selectDate(dateStr: string) {
    if (datePickerTarget === "from") {
      onDateFromChange(dateStr)
      if (dateTo && dateStr > dateTo) onDateToChange(dateStr)
    } else {
      onDateToChange(dateStr)
      if (dateFrom && dateStr < dateFrom) onDateFromChange(dateStr)
    }
    setCalendarOpen(false)
    onChangePage()
  }

  function isInRange(dateStr: string) {
    if (!dateFrom && !dateTo) return false
    if (dateFrom && dateTo) return dateStr >= dateFrom && dateStr <= dateTo
    if (dateFrom) return dateStr === dateFrom
    if (dateTo) return dateStr === dateTo
    return false
  }

  function setQuickFilter(type: "today" | "week" | "month") {
    const d = new Date()
    if (type === "today") {
      onDateFromChange(todayStr)
      onDateToChange(todayStr)
    } else if (type === "week") {
      const dayOfWeek = d.getDay()
      const mon = new Date(d)
      mon.setDate(d.getDate() - ((dayOfWeek + 6) % 7))
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      onDateFromChange(mon.toISOString().slice(0, 10))
      onDateToChange(sun.toISOString().slice(0, 10))
    } else if (type === "month") {
      const first = new Date(d.getFullYear(), d.getMonth(), 1)
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      onDateFromChange(first.toISOString().slice(0, 10))
      onDateToChange(last.toISOString().slice(0, 10))
    }
    onChangePage()
  }

  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-body">Filter Date by</label>
        <select
          value={dateType}
          onChange={(e) => {
            onDateTypeChange(e.target.value as "orderDate" | "visitDate")
            onClearDates()
            onChangePage()
          }}
          className="compact-input rounded border border-stroke px-3 py-1.5 text-sm font-medium text-black"
        >
          <option value="orderDate">Order Date</option>
          <option value="visitDate">Visit Date</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-body">Date Range</label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-stroke p-0.5">
            {(["today", "week", "month"] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuickFilter(q)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded ${
                  dateFrom === todayStr && dateTo === todayStr && q === "today"
                    ? "bg-primary text-white"
                    : "text-body hover:text-primary"
                }`}
              >
                {q === "today" ? "Today" : q === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
          <div className="relative" ref={calendarRef}>
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => openCalendar("from")}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-medium ${
                  dateFrom ? "bg-primary text-white border-primary" : "border-stroke text-body hover:bg-gray-1"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {dateFrom ? formatDate(dateFrom) : "From"}
              </button>
              <span className="text-body">-</span>
              <button
                onClick={() => openCalendar("to")}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-medium ${
                  dateTo ? "bg-primary text-white border-primary" : "border-stroke text-body hover:bg-gray-1"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {dateTo ? formatDate(dateTo) : "To"}
              </button>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { onClearDates(); onChangePage() }}
                  className="text-xs text-body hover:text-primary ml-1"
                >
                  Clear
                </button>
              )}
            </div>
            {calendarOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-stroke bg-white p-4 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
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
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-primary">{datePickerTarget === "from" ? "Select start date" : "Select end date"}</span>
                </div>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-body">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {Array.from({ length: firstDayOfMonth(calMonth, calYear) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth(calMonth, calYear) }, (_, i) => i + 1).map((day) => {
                    const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    const hasData = availDates.includes(dateStr)
                    const inRange = isInRange(dateStr)
                    const isTarget = dateStr === (datePickerTarget === "from" ? dateFrom : dateTo)
                    return (
                      <button
                        key={day}
                        disabled={!hasData}
                        onClick={() => selectDate(dateStr)}
                        className={`rounded py-1 text-sm ${
                          isTarget
                            ? "bg-primary text-white"
                            : inRange
                              ? "bg-primary/10 text-primary"
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
        </div>
      </div>
    </>
  )
}
