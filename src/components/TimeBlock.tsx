import { useState } from 'react'
import {
  EFFICIENCY_BG,
  EFFICIENCY_COLORS,
  EFFICIENCY_LABELS,
  type Efficiency,
  type TimeEntry,
} from '../types'
import { minutesToTime } from '../lib/time'

interface TimeBlockProps {
  entry: TimeEntry
  top: number
  height: number
  onCycleEfficiency: (entry: TimeEntry) => Promise<Efficiency>
  onDelete: (id: string) => void
}

export function TimeBlock({
  entry,
  top,
  height,
  onCycleEfficiency,
  onDelete,
}: TimeBlockProps) {
  const [flashLabel, setFlashLabel] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = await onCycleEfficiency(entry)
    setFlashLabel(EFFICIENCY_LABELS[next])
    setTimeout(() => setFlashLabel(null), 1200)
  }

  const barColor = EFFICIENCY_COLORS[entry.efficiency]
  const bg = EFFICIENCY_BG[entry.efficiency]

  return (
    <div
      className="absolute left-0 right-2 rounded-lg border border-border/60 cursor-pointer transition-shadow hover:shadow-sm overflow-hidden group"
      style={{
        top,
        height: Math.max(height, 28),
        background: bg,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors duration-300"
        style={{ background: barColor }}
      />

      <div className="pl-3 pr-6 py-1.5 h-full flex flex-col justify-center min-h-0">
        <div className="text-sm font-medium text-text truncate leading-tight">
          {entry.title || '（无标题）'}
        </div>
        <div className="text-xs text-text-weak mt-0.5">
          {minutesToTime(entry.start_minutes)}–{minutesToTime(entry.end_minutes)}
        </div>
      </div>

      {entry.notes && (
        <div
          className="absolute bottom-1.5 right-6 text-text-weak"
          title={entry.notes}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {flashLabel && (
        <span className="absolute top-1 right-6 text-[10px] font-medium px-1.5 py-0.5 rounded bg-card border border-border efficiency-tag-flash">
          {flashLabel}
        </span>
      )}

      {hovered && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(entry.id)
          }}
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded text-text-weak/50 hover:text-red-400 hover:bg-red-50 text-xs"
          aria-label="删除"
        >
          ×
        </button>
      )}
    </div>
  )
}
