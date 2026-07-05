"use client"

interface StatCardProps {
  label: string
  value: string | number
  bgImage?: string
  valueClassName?: string
  size?: "sm" | "md"
}

export default function StatCard({ label, value, bgImage, valueClassName = "text-[#334155]", size }: StatCardProps) {
  return (
    <div
      className={`rounded-lg border border-stroke bg-white px-5 py-4 shadow-default${bgImage ? " bg-no-repeat bg-[right_bottom] bg-[length:auto_100%]" : ""}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-body">{label}</p>
      </div>
      <p className={`mt-1 font-bold ${size === "sm" ? "text-xl" : "text-2xl"} ${valueClassName}`}>{value}</p>
    </div>
  )
}
