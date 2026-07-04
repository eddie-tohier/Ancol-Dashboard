"use client"

import { Menu, Search } from "lucide-react"
import DropdownUser from "./DropdownUser"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-999 flex w-full rounded-lg border border-stroke bg-white drop-shadow-1">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="z-99999 block rounded-md border border-stroke bg-white p-1.5 shadow-sm lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="hidden sm:block">
          <form className="relative">
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
            <input
              type="text"
              placeholder="Type to search..."
              className="w-full rounded-md bg-transparent pl-10 pr-4 text-sm font-medium text-black focus:outline-none xl:w-125"
            />
          </form>
        </div>
        <div className="flex items-center gap-3 2xsm:gap-7">
          <DropdownUser />
        </div>
      </div>
    </header>
  )
}