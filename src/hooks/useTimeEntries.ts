import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Efficiency, TimeEntry } from '../types'

const LOCAL_KEY = 'traceday_entries'

function loadLocal(userId: string, dateKey: string): TimeEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const all: TimeEntry[] = JSON.parse(raw)
    return all.filter((e) => e.user_id === userId && e.entry_date === dateKey)
  } catch {
    return []
  }
}

function saveLocal(entries: TimeEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries))
}

function mergeLocal(userId: string, dateKey: string, dayEntries: TimeEntry[]) {
  const raw = localStorage.getItem(LOCAL_KEY)
  const all: TimeEntry[] = raw ? JSON.parse(raw) : []
  const rest = all.filter(
    (e) => !(e.user_id === userId && e.entry_date === dateKey),
  )
  saveLocal([...rest, ...dayEntries])
}

export function useTimeEntries(userId: string | undefined, dateKey: string) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    if (!supabase) {
      setEntries(loadLocal(userId, dateKey))
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', dateKey)
      .order('start_minutes')

    if (!error && data) setEntries(data as TimeEntry[])
    setLoading(false)
  }, [userId, dateKey])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const createEntry = useCallback(
    async (payload: {
      start_minutes: number
      end_minutes: number
      title: string
      notes: string
      efficiency?: Efficiency
    }) => {
      if (!userId) return null
      const now = new Date().toISOString()
      const row: TimeEntry = {
        id: crypto.randomUUID(),
        user_id: userId,
        entry_date: dateKey,
        start_minutes: payload.start_minutes,
        end_minutes: payload.end_minutes,
        title: payload.title,
        notes: payload.notes || null,
        efficiency: payload.efficiency ?? 'none',
        created_at: now,
        updated_at: now,
      }

      if (!supabase) {
        const all = loadLocal(userId, dateKey)
        const next = [...all, row]
        mergeLocal(userId, dateKey, next)
        setEntries(next)
        return row
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert(row)
        .select()
        .single()

      if (error) throw error
      setEntries((prev) => [...prev, data as TimeEntry])
      return data as TimeEntry
    },
    [userId, dateKey],
  )

  const updateEntry = useCallback(
    async (id: string, patch: Partial<Pick<TimeEntry, 'title' | 'notes' | 'efficiency'>>) => {
      if (!userId) return

      if (!supabase) {
        const all = loadLocal(userId, dateKey)
        const next = all.map((e) =>
          e.id === id ? { ...e, ...patch, updated_at: new Date().toISOString() } : e,
        )
        mergeLocal(userId, dateKey, next)
        setEntries(next)
        return
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update(patch)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setEntries((prev) => prev.map((e) => (e.id === id ? (data as TimeEntry) : e)))
    },
    [userId, dateKey],
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!userId) return

      if (!supabase) {
        const all = loadLocal(userId, dateKey).filter((e) => e.id !== id)
        mergeLocal(userId, dateKey, all)
        setEntries(all)
        return
      }

      const { error } = await supabase.from('time_entries').delete().eq('id', id)
      if (error) throw error
      setEntries((prev) => prev.filter((e) => e.id !== id))
    },
    [userId, dateKey],
  )

  const cycleEfficiency = useCallback(
    async (entry: TimeEntry) => {
      const order: Efficiency[] = ['none', 'high', 'medium', 'low']
      const next = order[(order.indexOf(entry.efficiency) + 1) % order.length]
      await updateEntry(entry.id, { efficiency: next })
      return next
    },
    [updateEntry],
  )

  return {
    entries,
    loading,
    createEntry,
    updateEntry,
    deleteEntry,
    cycleEfficiency,
    refetch: fetchEntries,
  }
}
