import { ArrowUp, ArrowDown } from "lucide-react"

interface CardDataStatsProps {
  title: string
  total: string
  rate?: string
  levelUp?: boolean
  levelDown?: boolean
  children?: React.ReactNode
}

export default function CardDataStats({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}: CardDataStatsProps) {
  return (
    <div className="relative rounded-lg border border-stroke bg-white px-6 py-5 shadow-default">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-body">{title}</p>
          <h4 className="text-2xl font-bold text-black">{total}</h4>
        </div>
        {rate && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${levelUp ? "text-success" : ""} ${levelDown ? "text-danger" : ""}`}>
            {levelUp && <ArrowUp className="h-3 w-3" />}
            {levelDown && <ArrowDown className="h-3 w-3" />}
            {rate}
          </span>
        )}
      </div>
      <div className="absolute bottom-4 right-4 opacity-15 [&>svg]:h-8 [&>svg]:w-8">
        {children}
      </div>
    </div>
  )
}