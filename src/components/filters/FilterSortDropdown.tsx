"use client"

import { Filter, ChevronsUpDown } from "lucide-react"
import { UNITS } from "@/lib/units"

interface FilterSortDropdownProps {
  filterValue: string
  dropdownOpen: boolean
  setDropdownOpen: (open: boolean) => void
  dropdownRef: React.RefObject<HTMLDivElement | null>
  onFilterSelect: (val: string) => void
  getFilterLabel: (val: string) => string
}

export default function FilterSortDropdown({
  filterValue,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onFilterSelect,
  getFilterLabel,
}: FilterSortDropdownProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-body">Filter/sort by</label>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="inline-flex items-center justify-center gap-1.5 rounded border border-primary bg-primary px-2 py-1 text-sm font-medium text-white whitespace-nowrap"
        >
          <Filter className="h-4 w-4" />
          {getFilterLabel(filterValue)}
          <ChevronsUpDown className="h-3.5 w-3.5" />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-[520px] rounded-lg border border-stroke bg-white p-3 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 px-2 py-1 text-xs font-semibold text-body">Units</div>
                {[["all", "All Units"], ...UNITS.map((u) => [u.id, u.name])].map(([val, label]) => (
                  <button
                    key={`unit_${val}`}
                    onClick={() => onFilterSelect(`unit_${val}`)}
                    className={`w-full rounded px-2 py-1.5 text-left text-sm ${
                      filterValue === `unit_${val}` ? "bg-primary text-white" : "text-black hover:bg-gray-1"
                    }`}
                  >
                    {label as string}
                  </button>
                ))}
              </div>
              <div>
                <div className="mb-1 px-2 py-1 text-xs font-semibold text-body">Sort by</div>
                <div className="space-y-1">
                  {[
                    { label: "Order ID", options: [["orderId_asc", "A-Z"], ["orderId_desc", "Z-A"]] },
                    { label: "Customer", options: [["customer_asc", "A-Z"], ["customer_desc", "Z-A"]] },
                    { label: "Amount", options: [["amount_highest", "Highest"], ["amount_lowest", "Lowest"]] },
                    { label: "Status", options: [["status_asc", "A-Z"], ["status_desc", "Z-A"]] },
                    { label: "Payment", options: [["payment_asc", "A-Z"], ["payment_desc", "Z-A"]] },
                    { label: "Order Date", options: [["orderDate_desc", "Newest"], ["orderDate_asc", "Oldest"]] },
                  ].map((section) => (
                    <div key={section.label}>
                      <div className="px-2 py-0.5 text-[10px] font-medium uppercase text-gray-400">{section.label}</div>
                      <div className="flex gap-1">
                        {(section.options as [string, string][]).map(([val, lbl]) => (
                          <button
                            key={val}
                            onClick={() => onFilterSelect(val)}
                            className={`flex-1 rounded px-2 py-1.5 text-left text-xs ${
                              filterValue === val ? "bg-primary text-white" : "text-black hover:bg-gray-1"
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
