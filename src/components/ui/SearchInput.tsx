"use client"

import { Search, X } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative w-60 ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="compact-input w-full !pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => { onChange(""); onClear?.() }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
