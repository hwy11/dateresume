import { useEffect, useRef } from 'react'
import type { DraftEntry } from '../types'

interface RecordPopoverProps {
  draft: DraftEntry
  anchorTop: number
  onChange: (patch: Partial<DraftEntry>) => void
  onSave: () => void
  onCancel: () => void
}

export function RecordPopover({
  draft,
  anchorTop,
  onChange,
  onSave,
  onCancel,
}: RecordPopoverProps) {
  const titleRef = useRef<HTMLInputElement>(null)

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

  return (
    <div
      className="absolute left-[calc(100%+12px)] z-40 w-72 bg-card border border-border rounded-xl shadow-lg p-4"
      style={{ top: Math.max(8, anchorTop) }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <h3 className="text-sm font-semibold text-text mb-3">记录这段时间</h3>

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
          disabled={!draft.title.trim()}
          className="px-4 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </div>
  )
}
