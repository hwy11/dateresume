import { useEffect, useState } from 'react'
import { AuthPage } from './components/AuthPage'
import { ExportModal } from './components/ExportModal'
import { Header } from './components/Header'
import { Timeline } from './components/Timeline'
import { TodayOverview } from './components/TodayOverview'
import { useAuth } from './hooks/useAuth'
import { useTimeEntries } from './hooks/useTimeEntries'
import { entriesToMarkdown } from './lib/markdown'
import { addDays, formatDateKey } from './lib/time'
import { supabaseConfigured } from './lib/supabase'
import type { DraftEntry, ExportRange, TimeEntry } from './types'

const RANGE_DAYS: Record<ExportRange, number> = {
  day: 1,
  week: 7,
  month: 30,
}

export default function App() {
  const { user, loading: authLoading, signOut, supabaseConfigured: configured } = useAuth()
  const [dateKey, setDateKey] = useState(formatDateKey(new Date()))
  const [showMenu, setShowMenu] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [exportRange, setExportRange] = useState<ExportRange>('day')
  const [exportEntries, setExportEntries] = useState<TimeEntry[]>([])
  const [exportLoading, setExportLoading] = useState(false)

  const {
    entries,
    loading: entriesLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    cycleEfficiency,
    fetchEntriesRange,
  } = useTimeEntries(user?.id, dateKey)

  useEffect(() => {
    const close = () => setShowMenu(false)
    if (showMenu) document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [showMenu])

  const exportStartDate = addDays(dateKey, -(RANGE_DAYS[exportRange] - 1))
  const markdown = entriesToMarkdown(exportStartDate, dateKey, exportEntries)
  const exportFileStem =
    exportStartDate === dateKey ? dateKey : `${exportStartDate}_${dateKey}`

  useEffect(() => {
    if (!showExport) return

    let cancelled = false
    setExportLoading(true)
    fetchEntriesRange(exportStartDate, dateKey)
      .then((rangeEntries) => {
        if (!cancelled) setExportEntries(rangeEntries)
      })
      .finally(() => {
        if (!cancelled) setExportLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [dateKey, exportStartDate, fetchEntriesRange, showExport])

  if (authLoading) {
    return (
      <div className="min-h-full flex items-center justify-center text-text-weak text-sm">
        加载中…
      </div>
    )
  }

  // 配置了 Supabase 但未登录 → 登录页；未配置 → 本地演示模式直接进
  if (configured && !user) {
    return <AuthPage />
  }

  const handleCreate = async (draft: DraftEntry) => {
    await createEntry(draft)
  }

  return (
    <div className="min-h-full p-4 md:p-6 flex items-start justify-center">
      <div
        className="bg-card w-full max-w-6xl rounded-[18px] shadow-sm border border-border/50 flex flex-col"
        style={{ minHeight: 'calc(100vh - 48px)' }}
      >
        <Header
          dateKey={dateKey}
          onDateChange={setDateKey}
          onExport={() => setShowExport(true)}
          userEmail={user?.email}
          onSignOut={signOut}
          showMenu={showMenu}
          onToggleMenu={() => setShowMenu((v) => !v)}
        />

        <div className="flex flex-1 min-h-0" style={{ height: 'calc(100vh - 140px)' }}>
          {entriesLoading ? (
            <div className="flex-1 flex items-center justify-center text-text-weak text-sm">
              加载记录…
            </div>
          ) : (
            <>
              <Timeline
                dateKey={dateKey}
                entries={entries}
                onCreate={handleCreate}
                onUpdate={updateEntry}
                onCycleEfficiency={cycleEfficiency}
                onDelete={deleteEntry}
              />
              <TodayOverview entries={entries} />
            </>
          )}
        </div>
      </div>

      {showExport && (
        <ExportModal
          content={markdown}
          fileStem={exportFileStem}
          range={exportRange}
          loading={exportLoading}
          onRangeChange={setExportRange}
          onClose={() => setShowExport(false)}
        />
      )}

      {!supabaseConfigured && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-text-weak bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
          本地演示模式 · 数据保存在浏览器
        </div>
      )}
    </div>
  )
}
