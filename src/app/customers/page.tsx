"use client"

import { useState } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  loyaltyNo: string
  orders: number
  lastVisit: string
}

const customers: Customer[] = [
  { id: "CUS-001", name: "Budi Santoso", phone: "081234567890", email: "budi@email.com", loyaltyNo: "L-1001", orders: 12, lastVisit: "2026-07-01" },
  { id: "CUS-002", name: "Siti Rahmawati", phone: "081298765432", email: "siti@email.com", loyaltyNo: "L-1002", orders: 8, lastVisit: "2026-07-02" },
  { id: "CUS-003", name: "Ahmad Hidayat", phone: "087812345678", email: "ahmad@email.com", loyaltyNo: "L-1003", orders: 5, lastVisit: "2026-06-30" },
  { id: "CUS-004", name: "Dewi Lestari", phone: "082134567890", email: "dewi@email.com", loyaltyNo: "L-1004", orders: 15, lastVisit: "2026-07-03" },
  { id: "CUS-005", name: "Rudi Hartono", phone: "085612345678", email: "rudi@email.com", loyaltyNo: "L-1005", orders: 3, lastVisit: "2026-06-28" },
  { id: "CUS-006", name: "Nina Wijaya", phone: "081112223334", email: "nina@email.com", loyaltyNo: "L-1006", orders: 7, lastVisit: "2026-07-04" },
  { id: "CUS-007", name: "Hendra Gunawan", phone: "087765432109", email: "hendra@email.com", loyaltyNo: "L-1007", orders: 11, lastVisit: "2026-07-05" },
  { id: "CUS-008", name: "Maya Sari", phone: "082298765432", email: "maya@email.com", loyaltyNo: "L-1008", orders: 4, lastVisit: "2026-07-06" },
  { id: "CUS-009", name: "Agus Wijaya", phone: "081334455667", email: "agus@email.com", loyaltyNo: "L-1009", orders: 9, lastVisit: "2026-06-29" },
  { id: "CUS-010", name: "Rina Amelia", phone: "085598765432", email: "rina@email.com", loyaltyNo: "L-1010", orders: 6, lastVisit: "2026-07-07" },
  { id: "CUS-011", name: "Bayu Saputra", phone: "087711223344", email: "bayu@email.com", loyaltyNo: "L-1011", orders: 14, lastVisit: "2026-07-08" },
  { id: "CUS-012", name: "Fitri Handayani", phone: "082176543210", email: "fitri@email.com", loyaltyNo: "L-1012", orders: 2, lastVisit: "2026-06-27" },
  { id: "CUS-013", name: "Dimas Prayoga", phone: "081245678901", email: "dimas@email.com", loyaltyNo: "L-1013", orders: 10, lastVisit: "2026-07-09" },
  { id: "CUS-014", name: "Putri Ayu", phone: "085634567890", email: "putri@email.com", loyaltyNo: "L-1014", orders: 13, lastVisit: "2026-07-10" },
  { id: "CUS-015", name: "Adi Susanto", phone: "087898765432", email: "adi@email.com", loyaltyNo: "L-1015", orders: 1, lastVisit: "2026-06-26" },
  { id: "CUS-016", name: "Mega Pratiwi", phone: "081556677889", email: "mega@email.com", loyaltyNo: "L-1016", orders: 16, lastVisit: "2026-07-11" },
  { id: "CUS-017", name: "Fajar Nugroho", phone: "082345678901", email: "fajar@email.com", loyaltyNo: "L-1017", orders: 6, lastVisit: "2026-07-12" },
  { id: "CUS-018", name: "Indah Permata", phone: "085756453423", email: "indah@email.com", loyaltyNo: "L-1018", orders: 8, lastVisit: "2026-07-13" },
  { id: "CUS-019", name: "Rizky Pratama", phone: "087612345678", email: "rizky@email.com", loyaltyNo: "L-1019", orders: 11, lastVisit: "2026-07-14" },
  { id: "CUS-020", name: "Wulan Dari", phone: "081324354657", email: "wulan@email.com", loyaltyNo: "L-1020", orders: 5, lastVisit: "2026-06-25" },
  { id: "CUS-021", name: "Andi Firmansyah", phone: "082187654321", email: "andi@email.com", loyaltyNo: "L-1021", orders: 9, lastVisit: "2026-07-15" },
  { id: "CUS-022", name: "Citra Puspita", phone: "085609876543", email: "citra@email.com", loyaltyNo: "L-1022", orders: 3, lastVisit: "2026-06-24" },
  { id: "CUS-023", name: "Eko Prasetyo", phone: "087734567890", email: "eko@email.com", loyaltyNo: "L-1023", orders: 7, lastVisit: "2026-07-16" },
  { id: "CUS-024", name: "Sri Wahyuni", phone: "081298701234", email: "sri@email.com", loyaltyNo: "L-1024", orders: 12, lastVisit: "2026-07-17" },
  { id: "CUS-025", name: "Dani Ramadhan", phone: "082156789012", email: "dani@email.com", loyaltyNo: "L-1025", orders: 4, lastVisit: "2026-06-23" },
  { id: "CUS-026", name: "Rathi Kusuma", phone: "085644332211", email: "rathi@email.com", loyaltyNo: "L-1026", orders: 10, lastVisit: "2026-07-18" },
  { id: "CUS-027", name: "Yoga Pratama", phone: "087722334455", email: "yoga@email.com", loyaltyNo: "L-1027", orders: 2, lastVisit: "2026-06-22" },
  { id: "CUS-028", name: "Sari Dewi", phone: "081378901234", email: "sari@email.com", loyaltyNo: "L-1028", orders: 15, lastVisit: "2026-07-19" },
  { id: "CUS-029", name: "Bambang Sutejo", phone: "082167890123", email: "bambang@email.com", loyaltyNo: "L-1029", orders: 1, lastVisit: "2026-06-21" },
  { id: "CUS-030", name: "Tari Lestari", phone: "085590123456", email: "tari@email.com", loyaltyNo: "L-1030", orders: 8, lastVisit: "2026-07-20" },
  { id: "CUS-031", name: "Gilang Permana", phone: "087845678901", email: "gilang@email.com", loyaltyNo: "L-1031", orders: 6, lastVisit: "2026-07-21" },
  { id: "CUS-032", name: "Nadia Pramesti", phone: "081412345678", email: "nadia@email.com", loyaltyNo: "L-1032", orders: 13, lastVisit: "2026-07-22" },
  { id: "CUS-033", name: "Irfan Hakim", phone: "082223344556", email: "irfan@email.com", loyaltyNo: "L-1033", orders: 4, lastVisit: "2026-06-20" },
  { id: "CUS-034", name: "Dian Pertiwi", phone: "085667788990", email: "dian@email.com", loyaltyNo: "L-1034", orders: 9, lastVisit: "2026-07-23" },
  { id: "CUS-035", name: "Rama Setiawan", phone: "087755667788", email: "rama@email.com", loyaltyNo: "L-1035", orders: 7, lastVisit: "2026-07-24" },
]

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
  const pageSize = 15
  const totalPages = Math.ceil(customers.length / pageSize)
  const paginatedCustomers = customers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Customers" />

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-3 ">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Cari nama, phone, email..."
              className="compact-input w-full !pl-10 pr-3"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{customers.length} customers • Page {currentPage}/{totalPages}</span>
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
              {paginatedCustomers.map((c) => (
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
                  <td className="border-b border-[#eee] ">{c.loyaltyNo}</td>
                  <td className="border-b border-[#eee] text-center">
                    <span className="inline-flex rounded-full border border-primary px-2 py-0.5 text-xs font-medium text-primary">
                      {c.orders}
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
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, customers.length)} of {customers.length}
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg border border-stroke bg-white shadow-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stroke px-6.5 py-4 ">
              <h3 className="text-lg font-semibold text-black ">Customer Detail</h3>
              <p className="text-sm text-body">Informasi lengkap pelanggan</p>
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
                      <p className="font-medium text-black ">{selected.loyaltyNo}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Orders</span>
                      <p className="font-medium text-black ">{selected.orders}</p>
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
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
