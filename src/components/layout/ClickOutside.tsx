"use client"

import { useRef, useEffect } from "react"

export default function ClickOutside({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClick()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClick])

  return <div ref={ref}>{children}</div>
}
