"use client"

import { useState, useEffect } from "react"
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
import { getMenuWithSep, defaultMenuWithSep, SEP } from "@/lib/menuConfig"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()
  const [menuWithSep, setMenuWithSep] = useState<string[]>(defaultMenuWithSep)

  useEffect(() => {
    setMenuWithSep(getMenuWithSep())
  }, [])

  const sepIdx = menuWithSep.indexOf(SEP)
  const isMainSection = (path: string) =>
    menuWithSep.indexOf(path) !== -1 && menuWithSep.indexOf(path) < sepIdx

  const menuMap: Record<string, { path: string; label: string; icon: React.ReactNode }> = {
    "/dashboard": { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    "/orders": { path: "/orders", label: "Orders", icon: <ShoppingCart className="h-5 w-5" /> },
    "/payments": { path: "/payments", label: "Payments", icon: <Wallet className="h-5 w-5" /> },
    "/tickets": { path: "/tickets", label: "Tickets", icon: <TicketCheck className="h-5 w-5" /> },
    "/reconciliation": { path: "/reconciliation", label: "Reconciliation", icon: <FileSpreadsheet className="h-5 w-5" /> },
    "/customers": { path: "/customers", label: "Customers", icon: <Users className="h-5 w-5" /> },
    "/wahana": { path: "/wahana", label: "Wahana", icon: <Ticket className="h-5 w-5" /> },
    "/settings": { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
    "/admin/users": { path: "/admin/users", label: "Admin Users", icon: <UserCog className="h-5 w-5" /> },
  }

  function isActive(path: string): boolean {
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(path)
  }

  const mainItems = menuWithSep.filter((p) => p !== SEP && isMainSection(p)).map((p) => menuMap[p]).filter(Boolean)
  const otherItems = menuWithSep.filter((p) => p !== SEP && !isMainSection(p)).map((p) => menuMap[p]).filter(Boolean)

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
              <ul className="mb-4 flex flex-col gap-1.5">
                {mainItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-400 duration-300 ease-in-out hover:text-white ${
                        isActive(item.path) ? "text-white" : ""
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="mb-4 mx-4 border-gray-600" />
            <div>
              <ul className="mb-4 flex flex-col gap-1.5">
                {otherItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-400 duration-300 ease-in-out hover:text-white ${
                        isActive(item.path) ? "text-white" : ""
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
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
