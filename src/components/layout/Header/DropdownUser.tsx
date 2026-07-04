"use client"

import Link from "next/link"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Settings, LogOut, ChevronDown } from "lucide-react"
import ClickOutside from "../ClickOutside"

export default function DropdownUser() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)}>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-4"
        >
          <span className="hidden text-right lg:block">
            <span className="block text-sm font-medium text-black">
              {session?.user?.name || "User"}
            </span>
            <span className="block text-xs text-body">
              {session?.user?.role || "admin"}
            </span>
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
          <ChevronDown className="hidden h-4 w-4 sm:block" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2.5 w-62.5 rounded-lg border border-stroke bg-white shadow-default">
            <ul className="flex flex-col border-b border-stroke px-6 py-4">
              <li>
                <Link
                  href="/settings"
                  className="flex items-center gap-3.5 px-0 py-2 text-sm font-medium text-body duration-300 hover:text-primary"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </li>
            </ul>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3.5 px-6 py-4 text-sm font-medium text-body duration-300 hover:text-primary"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </ClickOutside>
  )
}