'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

interface HeatmapDay {
  date: string
  count: number
  label: string
}

interface InteractiveHeatmapProps {
  data: HeatmapDay[]
  maxVal: number
  color?: string
}

export function InteractiveHeatmap({ data, maxVal, color = 'primary' }: InteractiveHeatmapProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    setHoveredIndex(index)
    if (containerRef.current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 8,
      })
    }
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted/40'
    const intensity = Math.min(count / Math.max(maxVal, 1), 1)
    if (intensity <= 0.25) return 'bg-primary/20'
    if (intensity <= 0.5) return 'bg-primary/40'
    if (intensity <= 0.75) return 'bg-primary/60'
    return 'bg-primary'
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => {
          const pct = maxVal > 0 ? (d.count / maxVal) * 100 : 0
          const isHovered = hoveredIndex === i
          return (
            <div
              key={d.date}
              className="group relative flex flex-1 flex-col items-center gap-1"
              onMouseEnter={(e) => handleMouseEnter(i, e)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: `${Math.max(pct, 4)}%`,
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className={`w-full cursor-pointer rounded-t-lg transition-all duration-200 ${getColor(d.count)} ${isHovered ? 'shadow-lg shadow-primary/20' : ''}`}
              />
            </div>
          )
        })}
      </div>

      {/* Day labels */}
      <div className="flex gap-2 mt-2">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center">
            <span className={`text-[10px] ${hoveredIndex === i ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-xl border border-border/60 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-xl"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <p className="text-xs font-medium">{data[hoveredIndex].count} kebiasaan</p>
            <p className="text-[10px] text-muted-foreground">{format(new Date(data[hoveredIndex].date), 'EEEE, d MMM yyyy')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Kurang</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <div
            key={v}
            className={`h-3 w-3 rounded-sm ${v === 0 ? 'bg-muted/40' : v <= 0.25 ? 'bg-primary/20' : v <= 0.5 ? 'bg-primary/40' : v <= 0.75 ? 'bg-primary/60' : 'bg-primary'}`}
          />
        ))}
        <span>Lebih</span>
      </div>
    </div>
  )
}
