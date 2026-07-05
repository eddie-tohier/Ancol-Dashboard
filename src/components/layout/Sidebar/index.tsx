"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  TicketCheck,
  Users,
  FileSpreadsheet,
  Ticket,
  Settings,
  UserCog,
  Wallet,
} from "lucide-react"
import ClickOutside from "../ClickOutside"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface MenuItem {
  label: string
  path: string
  icon: React.ReactNode
}

const mainMenu: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Orders", path: "/orders", icon: <ShoppingCart className="h-5 w-5" /> },
  { label: "Payments", path: "/payments", icon: <Wallet className="h-5 w-5" /> },
  { label: "Tickets", path: "/tickets", icon: <TicketCheck className="h-5 w-5" /> },
  { label: "Reconciliation", path: "/reconciliation", icon: <FileSpreadsheet className="h-5 w-5" /> },
  { label: "Customers", path: "/customers", icon: <Users className="h-5 w-5" /> },
]

const otherMenu: MenuItem[] = [
  { label: "Wahana", path: "/wahana", icon: <Ticket className="h-5 w-5" /> },
  { label: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
  { label: "Admin Users", path: "/admin/users", icon: <UserCog className="h-5 w-5" /> },
]

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()

  function isActive(path: string): boolean {
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(path)
  }

  function renderMenu(items: MenuItem[]) {
    return items.map((item) => {
      const active = isActive(item.path)
      return (
        <li key={item.path}>
          <Link
            href={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-400 duration-300 ease-in-out hover:text-white ${
              active ? "text-white" : ""
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        </li>
      )
    })
  }

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-[#0b1a33] duration-300 ease-linear lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center px-6 py-5.5 lg:py-6">
          <Link href="/dashboard">
            <img src="/ancol-connect_white_1.svg" alt="Ancol Connect" className="h-7 w-auto" />
          </Link>
        </div>

        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-2 px-4 py-4 lg:mt-2 lg:px-6">
            <div>
              <ul className="mb-4 flex flex-col gap-1.5">{renderMenu(mainMenu)}</ul>
            </div>

            <hr className="mb-4 mx-4 border-gray-600" />
            <div>
              <ul className="mb-4 flex flex-col gap-1.5">{renderMenu(otherMenu)}</ul>
            </div>
          </nav>
        </div>

        <img src="/ancol-sidebar.png" alt="Ancol" className="w-full h-auto" />
        <div className="z-10 border-t border-gray-700 px-6 py-4 text-center text-gray-500">
          <p className="font-semibold text-white">Ancol Connect</p>
          <p className="text-sm">Management Dashboard</p>
          <p className="text-xs text-gray-600">v1.0.0</p>
        </div>
      </aside>
    </ClickOutside>
  )
}
