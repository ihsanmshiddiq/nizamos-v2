'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'

export interface Budget {
  id: string
  month: string
  category: string
  limit: number
  spent: number
}
export interface Transaction {
  id: string
  amount: number
  type: string
  category: string | null
  note: string | null
  date: string
}
export interface SavingsGoal {
  id: string
  title: string
  target: number
  current: number
  deadline: string | null
}

export function useBudgets(month?: string) {
  const m = month || format(new Date(), 'yyyy-MM')
  return useQuery({
    queryKey: ['budgets', m],
    queryFn: () => apiClient.get<{ budgets: Budget[] }>(`/api/budgets?month=${m}`),
  })
}
export function useSaveBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { month: string; category: string; limit: number }) =>
      apiClient.post('/api/budgets', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/budgets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useTransactions(month?: string) {
  const m = month || format(new Date(), 'yyyy-MM')
  return useQuery({
    queryKey: ['transactions', m],
    queryFn: () =>
      apiClient.get<{
        transactions: Transaction[]
        totalIncome: number
        totalExpense: number
        balance: number
      }>(`/api/transactions?month=${m}`),
  })
}
export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiClient.post('/api/transactions', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}
export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useSavings() {
  return useQuery({
    queryKey: ['savings'],
    queryFn: () => apiClient.get<{ goals: SavingsGoal[] }>('/api/savings'),
  })
}
export function useCreateSavings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: any) => apiClient.post('/api/savings', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  })
}
export function useDepositSavings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      apiClient.post(`/api/savings/${id}/deposit`, { amount }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  })
}
export function useDeleteSavings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/savings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  })
}
