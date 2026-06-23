import { useEffect, useRef, useState } from 'react'
import {
  BASE_PX_PER_MINUTE,
  TIMELINE_END,
  TIMELINE_START,
  ZOOM_LEVELS,
  type DraftEntry,
  type Efficiency,
  type TimeEntry,
  type ZoomLevel,
} from '../types'
import {
  getCurrentMinutes,
  isToday,
  minutesToTime,
  minutesToY,
  timelineHeight,
  yToMinutes,
} from '../lib/time'
import { TimeBlock } from './TimeBlock'
import { RecordPopover } from './RecordPopover'

interface TimelineProps {
  dateKey: string
  entries: TimeEntry[]
  onCreate: (draft: DraftEntry) => Promise<void>
  onUpdate: (
    id: string,
    patch: Partial<
      Pick<TimeEntry, 'title' | 'notes' | 'start_minutes' | 'end_minutes'>
    >,
  ) => Promise<void>
  onCycleEfficiency: (entry: TimeEntry) => Promise<Efficiency>
  onDelete: (id: string) => void
}

interface DragState {
  startY: number
  currentY: number
}

const DEFAULT_ZOOM_INDEX = 1
const POPOVER_HEIGHT = 340
const POPOVER_WIDTH = 288
const POPOVER_GAP = 12
type PopoverSide = 'left' | 'right' | 'inside'

export function Timeline({
  dateKey,
  entries,
  onCreate,
  onUpdate,
  onCycleEfficiency,
  onDelete,
}: TimelineProps) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const zoom: ZoomLevel = ZOOM_LEVELS[zoomIndex]
  const pxPerMinute = BASE_PX_PER_MINUTE * zoom.scale
  const height = timelineHeight(pxPerMinute)

  const trackRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [hoverY, setHoverY] = useState<number | null>(null)
  const [draft, setDraft] = useState<DraftEntry | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [popoverTop, setPopoverTop] = useState(0)
  const [popoverSide, setPopoverSide] = useState<PopoverSide>('right')
  const [nowMinutes, setNowMinutes] = useState(getCurrentMinutes())

  const showNowLine = isToday(dateKey)

  useEffect(() => {
    if (!showNowLine) return
    const t = setInterval(() => setNowMinutes(getCurrentMinutes()), 60_000)
    return () => clearInterval(t)
  }, [showNowLine])

  const getYFromEvent = (e: React.MouseEvent | MouseEvent) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    return Math.max(0, Math.min(height, e.clientY - rect.top))
  }

  const placePopover = (rawTop: number) => {
    const track = trackRef.current
    const scroller = scrollRef.current
    if (!track || !scroller) {
      setPopoverTop(Math.max(8, rawTop))
      setPopoverSide('right')
      return
    }

    const rect = track.getBoundingClientRect()
    const hasRightRoom = rect.right + POPOVER_GAP + POPOVER_WIDTH < window.innerWidth - 12
    const hasLeftRoom = rect.left - POPOVER_GAP - POPOVER_WIDTH > 12
    const visibleTop = scroller.scrollTop + 8
    const visibleBottom = scroller.scrollTop + scroller.clientHeight - POPOVER_HEIGHT - 8
    setPopoverSide(hasRightRoom ? 'right' : hasLeftRoom ? 'left' : 'inside')
    setPopoverTop(Math.max(visibleTop, Math.min(rawTop, visibleBottom)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || draft) return
    const y = getYFromEvent(e)
    setDrag({ startY: y, currentY: y })
  }

  useEffect(() => {
    if (!drag) return

    const onMove = (e: MouseEvent) => {
      setDrag((d) => d && { ...d, currentY: getYFromEvent(e) })
    }

    const onUp = (e: MouseEvent) => {
      const y = getYFromEvent(e)
      const start = Math.min(drag.startY, y)
      const end = Math.max(drag.startY, y)
      const startMin = yToMinutes(start, pxPerMinute, zoom.snapMinutes)
      const endMin = yToMinutes(end, pxPerMinute, zoom.snapMinutes)

      setDrag(null)
      setHoverY(null)

      if (Math.abs(endMin - startMin) < zoom.snapMinutes) return

      const lo = Math.min(startMin, endMin)
      const hi = Math.max(startMin, endMin)
      if (hi - lo < zoom.snapMinutes) return

      setDraft({
        start_minutes: lo,
        end_minutes: hi,
        title: '',
        notes: '',
      })
      setEditingId(null)
      placePopover(minutesToY(lo, pxPerMinute))
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [drag, pxPerMinute, zoom.snapMinutes])

  const handleSave = async () => {
    if (!draft?.title.trim()) return
    if (editingId) {
      await onUpdate(editingId, {
        start_minutes: draft.start_minutes,
        end_minutes: draft.end_minutes,
        title: draft.title.trim(),
        notes: draft.notes,
      })
    } else {
      await onCreate(draft)
    }
    setDraft(null)
    setEditingId(null)
  }

  const handleEdit = (entry: TimeEntry) => {
    setDrag(null)
    setHoverY(null)
    setDraft({
      start_minutes: entry.start_minutes,
      end_minutes: entry.end_minutes,
      title: entry.title,
      notes: entry.notes ?? '',
    })
    setEditingId(entry.id)
    placePopover(minutesToY(entry.start_minutes, pxPerMinute))
  }

  const dragRect = drag
    ? {
        top: Math.min(drag.startY, drag.currentY),
        height: Math.abs(drag.currentY - drag.startY),
      }
    : null

  const dragMinutes = dragRect
    ? (() => {
        const s = yToMinutes(dragRect.top, pxPerMinute, zoom.snapMinutes)
        const e = yToMinutes(dragRect.top + dragRect.height, pxPerMinute, zoom.snapMinutes)
        return { start: Math.min(s, e), end: Math.max(s, e) }
      })()
    : null

  // 生成刻度线：整点较深，次级刻度较淡
  const gridLines: { y: number; major: boolean; label?: string }[] = []
  for (let m = TIMELINE_START; m <= TIMELINE_END; m += zoom.minorLineMinutes) {
    const isHour = m % 60 === 0
    const isHalfHour = m % 30 === 0 && !isHour
    const show =
      zoom.minorLineMinutes <= 5
        ? true
        : zoom.minorLineMinutes <= 15
          ? m % 15 === 0
          : zoom.minorLineMinutes <= 30
            ? m % 30 === 0
            : m % 60 === 0

    if (!show && !isHour) continue

    gridLines.push({
      y: minutesToY(m, pxPerMinute),
      major: isHour,
      label: isHour ? minutesToTime(m) : isHalfHour && zoom.minorLineMinutes <= 15 ? minutesToTime(m) : undefined,
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* 缩放控制条 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 shrink-0">
        <span className="text-xs text-text-weak">时间轴精度</span>
        <div className="inline-flex rounded-lg border border-border bg-bg/60 p-0.5">
          {ZOOM_LEVELS.map((level, index) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setZoomIndex(index)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                index === zoomIndex
                  ? 'bg-card text-text shadow-sm'
                  : 'text-text-weak hover:text-text'
              }`}
              title={`${level.snapMinutes} 分钟吸附`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto timeline-scroll px-4 py-3"
      >
        <div className="flex gap-0" style={{ minHeight: height + 24 }}>
          {/* 左侧时间刻度 */}
          <div className="w-14 shrink-0 relative" style={{ height }}>
            {gridLines
              .filter((l) => l.label)
              .map((l) => (
                <span
                  key={l.y}
                  className="absolute right-2 text-[11px] text-text-weak -translate-y-1/2 select-none"
                  style={{ top: l.y }}
                >
                  {l.label}
                </span>
              ))}
          </div>

          {/* 可拖拽轨道 */}
          <div
            ref={trackRef}
            className="flex-1 relative border-l border-border/40"
            style={{ height }}
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => {
              if (!drag) setHoverY(getYFromEvent(e))
            }}
            onMouseLeave={() => {
              if (!drag) setHoverY(null)
            }}
          >
            {/* 网格线 */}
            {gridLines.map((l, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: l.y,
                  borderTop: `1px solid ${l.major ? '#E5E7EB' : '#F3F4F6'}`,
                }}
              />
            ))}

            {/* hover 预选高亮 */}
            {hoverY !== null && !drag && !draft && (
              <div
                className="absolute left-0 right-0 pointer-events-none bg-blue-50/60"
                style={{
                  top: minutesToY(
                    yToMinutes(hoverY, pxPerMinute, zoom.snapMinutes),
                    pxPerMinute,
                  ),
                  height: zoom.snapMinutes * pxPerMinute,
                }}
              />
            )}

            {/* 当前时间红线 */}
            {showNowLine && nowMinutes >= TIMELINE_START && nowMinutes <= TIMELINE_END && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: minutesToY(nowMinutes, pxPerMinute) }}
              >
                <div className="flex-1 h-px bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-red-400 -ml-1" />
              </div>
            )}

            {/* 拖拽选区 */}
            {dragRect && dragRect.height > 2 && (
              <div
                className="absolute left-1 right-1 bg-blue-400/25 border border-blue-400/50 rounded-md z-10 pointer-events-none flex items-center justify-center"
                style={{ top: dragRect.top, height: dragRect.height }}
              >
                {dragMinutes && (
                  <span className="text-xs font-medium text-blue-600 bg-card/90 px-2 py-0.5 rounded-full shadow-sm">
                    {minutesToTime(dragMinutes.start)}–{minutesToTime(dragMinutes.end)}
                  </span>
                )}
              </div>
            )}

            {/* 已有时间块 */}
            {entries.map((entry) => (
              <TimeBlock
                key={entry.id}
                entry={entry}
                top={minutesToY(entry.start_minutes, pxPerMinute)}
                height={(entry.end_minutes - entry.start_minutes) * pxPerMinute}
                onEdit={handleEdit}
                onCycleEfficiency={onCycleEfficiency}
                onDelete={onDelete}
              />
            ))}

            {/* 记录浮层 */}
            {draft && (
              <RecordPopover
                draft={draft}
                anchorTop={popoverTop}
                side={popoverSide}
                title={editingId ? '编辑记录' : '记录这段时间'}
                onChange={(patch) => setDraft((d) => d && { ...d, ...patch })}
                onSave={handleSave}
                onCancel={() => {
                  setDraft(null)
                  setEditingId(null)
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
