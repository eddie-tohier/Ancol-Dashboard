"use client"

import { useState, useMemo } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { getCustomers } from "@/lib/data"
import type { Customer } from "@/lib/data"

const allCustomers = getCustomers()

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function getAvatarColor(name: string) {
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function CustomersPage() {
  const [selected, setSelected] = useState<Customer | null>(null)
  const [open, setOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const pageSize = 15

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return allCustomers
    const q = searchQuery.toLowerCase()
    return allCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)),
    )
  }, [searchQuery])

  const totalPages = Math.ceil(filteredCustomers.length / pageSize)
  const paginated = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Customers" />

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-3 ">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search name, phone, email..."
              className="compact-input w-full !pl-10 pr-3"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{filteredCustomers.length} customers • Page {currentPage}/{totalPages}</span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left ">
                <th className="min-w-[110px] xl:pl-11">Customer ID</th>
                <th className="min-w-[180px]">Name</th>
                <th className="min-w-[140px]">Phone</th>
                <th className="min-w-[200px]">Email</th>
                <th className="min-w-[110px]">Loyalty No</th>
                <th className="min-w-[80px] text-center">Orders</th>
                <th className="">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer hover:bg-gray-1 "
                  onClick={() => {
                    setSelected(c)
                    setOpen(true)
                  }}
                >
                  <td className="border-b border-[#eee] pl-9 xl:pl-11">
                    <span className="font-medium text-black ">{c.id}</span>
                  </td>
                  <td className="border-b border-[#eee] ">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white ${getAvatarColor(c.name)}`}>
                        {getInitials(c.name)}
                      </div>
                      <span className="text-black ">{c.name}</span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] ">{c.phone}</td>
                  <td className="border-b border-[#eee] ">{c.email}</td>
                  <td className="border-b border-[#eee] ">{c.loyaltyNo || "-"}</td>
                  <td className="border-b border-[#eee] text-center">
                    <span className="inline-flex rounded-full border border-primary px-2 py-0.5 text-xs font-medium text-primary">
                      {c.totalOrders}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] ">{c.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-stroke px-5 py-3">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded text-sm font-medium ${
                  page === currentPage ? "bg-primary text-white" : "border border-stroke hover:bg-gray-1"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-1 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg border border-stroke bg-white shadow-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stroke px-6.5 py-4 ">
              <h3 className="text-lg font-semibold text-black ">Customer Detail</h3>
              <p className="text-sm text-body">Complete customer information</p>
            </div>
            <div className="p-6.5">
              {selected && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-medium text-white ${getAvatarColor(selected.name)}`}>
                      {getInitials(selected.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black ">{selected.name}</h3>
                      <p className="text-sm text-gray-500">{selected.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 text-sm ">
                    <div>
                      <span className="text-gray-500">Phone</span>
                      <p className="font-medium text-black ">{selected.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email</span>
                      <p className="font-medium text-black ">{selected.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Loyalty No</span>
                      <p className="font-medium text-black ">{selected.loyaltyNo || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Orders</span>
                      <p className="font-medium text-black ">{selected.totalOrders}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Last Visit</span>
                      <p className="font-medium text-black ">{selected.lastVisit}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  className="inline-flex items-center justify-center rounded border border-stroke px-6 py-2 text-sm font-medium hover:bg-gray-1"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
