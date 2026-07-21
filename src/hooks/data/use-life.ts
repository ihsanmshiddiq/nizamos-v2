'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'

/* ---------- Habits ---------- */
export interface Habit {
  id: string
  title: string
  icon: string | null
  color: string | null
  schedule: string
  targetCount: number
  logs: { id: string; date: string; count: number }[]
}
export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: () => apiClient.get<{ habits: Habit[] }>('/api/habits'),
  })
}
export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Habit>) => apiClient.post('/api/habits', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}
export function useToggleHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      apiClient.post(`/api/habits/${id}/toggle`, { date }),
    onMutate: async ({ id, date }) => {
      await qc.cancelQueries({ queryKey: ['habits'] })
      const prev = qc.getQueryData<{ habits: Habit[] }>(['habits'])
      if (prev) {
        qc.setQueryData<{ habits: Habit[] }>(['habits'], {
          ...prev,
          habits: prev.habits.map((h) => {
            if (h.id !== id) return h
            const exists = h.logs.some((l) => l.date === date)
            return {
              ...h,
              logs: exists
                ? h.logs.filter((l) => l.date !== date)
                : [...h.logs, { id: 'tmp', date, count: 1 }],
            }
          }),
        })
      }
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['habits'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}
export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/habits/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

/* ---------- Sholat ---------- */
export interface SholatLog {
  id?: string
  date: string
  subuh: boolean
  dzuhur: boolean
  ashar: boolean
  maghrib: boolean
  isya: boolean
}
export function useSholat(date?: string) {
  const d = date || format(new Date(), 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['sholat', d],
    queryFn: () => apiClient.get<{ log: SholatLog; history: SholatLog[] }>(`/api/sholat?date=${d}`),
  })
}
export function useSaveSholat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<SholatLog> & { date: string }) =>
      apiClient.put('/api/sholat', body),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['sholat', vars.date] })
    },
  })
}

/* ---------- Hifdz ---------- */
export interface HifdzItem {
  id: string
  surah: string
  surahNumber: number
  fromAyah: number
  toAyah: number
  status: string
  lastReviewed: string | null
  reviewCount: number
}
export function useHifdz() {
  return useQuery({
    queryKey: ['hifdz'],
    queryFn: () =>
      apiClient.get<{ items: HifdzItem[]; summary: any }>('/api/hifdz'),
  })
}
export function useCreateHifdz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiClient.post('/api/hifdz', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hifdz'] }),
  })
}
export function useReviewHifdz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/hifdz/${id}/review`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hifdz'] }),
  })
}
export function useUpdateHifdz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: any) => apiClient.patch(`/api/hifdz/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hifdz'] }),
  })
}
export function useDeleteHifdz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/hifdz/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hifdz'] }),
  })
}

/* ---------- Targets & Tasks ---------- */
export interface Target {
  id: string
  title: string
  description: string | null
  category: string
  deadline: string | null
  progress: number
  archived: boolean
  tasks: Task[]
}
export interface Task {
  id: string
  title: string
  notes: string | null
  dueDate: string | null
  priority: string
  completed: boolean
  order: number
  targetId: string | null
}
export function useTargets() {
  return useQuery({
    queryKey: ['targets'],
    queryFn: () => apiClient.get<{ targets: Target[] }>('/api/targets'),
  })
}
export function useCreateTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiClient.post('/api/targets', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })
}
export function useUpdateTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: any) => apiClient.patch(`/api/targets/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })
}
export function useDeleteTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/targets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })
}
export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiClient.post('/api/tasks', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['targets'] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: any) => apiClient.patch(`/api/tasks/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['targets'] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['targets'] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
