import { useEffect, useRef } from 'react'
import type { DraftEntry } from '../types'
import { minutesToTime, timeToMinutes } from '../lib/time'

interface RecordPopoverProps {
  draft: DraftEntry
  anchorTop: number
  side: 'left' | 'right' | 'inside'
  title: string
  onChange: (patch: Partial<DraftEntry>) => void
  onSave: () => void
  onCancel: () => void
}

export function RecordPopover({
  draft,
  anchorTop,
  side,
  title,
  onChange,
  onSave,
  onCancel,
}: RecordPopoverProps) {
  const titleRef = useRef<HTMLInputElement>(null)
  const isValid = Boolean(
    draft.title.trim() && draft.end_minutes > draft.start_minutes,
  )

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const handleTitleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (draft.title.trim()) onSave()
    }
    if (e.key === 'Escape') onCancel()
  }

  const updateTime = (key: 'start_minutes' | 'end_minutes', value: string) => {
    const minutes = timeToMinutes(value)
    if (minutes === null) return
    onChange({ [key]: minutes })
  }

  return (
    <div
      className={`absolute z-40 w-72 max-w-[calc(100%-16px)] bg-card border border-border rounded-xl shadow-lg p-4 ${
        side === 'right'
          ? 'left-[calc(100%+12px)]'
          : side === 'left'
            ? 'right-[calc(100%+12px)]'
            : 'left-2'
      }`}
      style={{ top: anchorTop }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <span className="text-xs text-text-weak">
          {minutesToTime(draft.start_minutes)}–{minutesToTime(draft.end_minutes)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <label className="text-xs text-text-weak block">
          开始
          <input
            type="time"
            value={minutesToTime(draft.start_minutes)}
            onChange={(e) => updateTime('start_minutes', e.target.value)}
            className="mt-1 w-full border border-border rounded-lg px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>
        <label className="text-xs text-text-weak block">
          结束
          <input
            type="time"
            value={minutesToTime(draft.end_minutes)}
            onChange={(e) => updateTime('end_minutes', e.target.value)}
            className="mt-1 w-full border border-border rounded-lg px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>
      </div>

      <label className="text-xs text-text-weak mb-1 block">做了什么</label>
      <input
        ref={titleRef}
        value={draft.title}
        onChange={(e) => onChange({ title: e.target.value })}
        onKeyDown={handleTitleKey}
        placeholder="例如：深度工作、会议…"
        className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label className="text-xs text-text-weak mb-1 block">备注（可选）</label>
      <textarea
        value={draft.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        rows={2}
        placeholder="补充细节…"
        className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-text-weak hover:text-text"
        >
          取消
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="px-4 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </div>
  )
}
