'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface MenstrualLog {
  id: string
  startDate: string
  endDate: string | null
  cycleLength: number
  periodLength: number
  symptoms: string | null
}

export function useMenstrual() {
  return useQuery({
    queryKey: ['menstrual'],
    queryFn: () =>
      apiClient.get<{
        logs: MenstrualLog[]
        currentDay: number | null
        nextPredictedDate: string | null
      }>('/api/menstrual'),
  })
}

export function useCreateMenstrual() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiClient.post('/api/menstrual', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menstrual'] }),
  })
}
export function useDeleteMenstrual() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/menstrual/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menstrual'] }),
  })
}
