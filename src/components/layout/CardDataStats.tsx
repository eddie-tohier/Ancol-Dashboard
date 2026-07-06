import { ArrowUp, ArrowDown } from "lucide-react"

interface CardDataStatsProps {
  title: string
  total: string
  rate?: string
  levelUp?: boolean
  levelDown?: boolean
  children?: React.ReactNode
  bgImage?: string
}

export default function CardDataStats({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
  bgImage,
}: CardDataStatsProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-stroke bg-white p-5 shadow-default transition-all duration-300${
        bgImage ? " bg-no-repeat bg-[right_bottom] bg-[length:auto_90%]" : ""
      }`}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {/* Floating 3D perspective icon on top of the cube (solid white with drop shadow) */}
      {bgImage && children && (
        <div className="absolute bottom-[66px] right-[32px] z-20 [transform:rotate(30deg)_skewX(-30deg)_scale(1.2)] text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] [&>svg]:h-8 [&>svg]:w-8 transition-all duration-300 hover:scale-[1.3] hover:text-white/95">
          {children}
        </div>
      )}

      {/* Fallback flat icon if no background image is present */}
      {!bgImage && children && (
        <div className="flex justify-end mb-4 text-slate-500 [&>svg]:h-5 [&>svg]:w-5">
          {children}
        </div>
      )}

      <div className="relative z-10">
        <h4 className="text-3xl font-bold text-black tracking-tight">{total}</h4>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{title}</p>
        {rate && (
          <div className="mt-5">
            <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
              levelUp ? "bg-success/10 text-success" : ""
            } ${
              levelDown ? "bg-danger/10 text-danger" : ""
            }`}>
              {levelUp && <ArrowUp className="h-3 w-3 shrink-0" />}
              {levelDown && <ArrowDown className="h-3 w-3 shrink-0" />}
              {rate}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}