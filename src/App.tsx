import { useEffect, useState } from 'react'
import { AuthPage } from './components/AuthPage'
import { ExportModal } from './components/ExportModal'
import { Header } from './components/Header'
import { Timeline } from './components/Timeline'
import { TodayOverview } from './components/TodayOverview'
import { useAuth } from './hooks/useAuth'
import { useTimeEntries } from './hooks/useTimeEntries'
import { entriesToMarkdown } from './lib/markdown'
import { formatDateKey } from './lib/time'
import { supabaseConfigured } from './lib/supabase'
import type { DraftEntry } from './types'

export default function App() {
  const { user, loading: authLoading, signOut, supabaseConfigured: configured } = useAuth()
  const [dateKey, setDateKey] = useState(formatDateKey(new Date()))
  const [showMenu, setShowMenu] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const {
    entries,
    loading: entriesLoading,
    createEntry,
    deleteEntry,
    cycleEfficiency,
  } = useTimeEntries(user?.id, dateKey)

  useEffect(() => {
    const close = () => setShowMenu(false)
    if (showMenu) document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [showMenu])

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

  const markdown = entriesToMarkdown(dateKey, entries)

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
          dateKey={dateKey}
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
