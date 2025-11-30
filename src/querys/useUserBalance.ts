import { useQuery } from '@tanstack/react-query'
import type { UserBalanceResponse } from '@/routes/api/user/balance'

export function useUserBalance(enabled = true) {
  return useQuery<UserBalanceResponse>({
    queryKey: ['userBalance'],
    queryFn: async () => {
      const response = await fetch('/api/user/balance')
      if (!response.ok) throw new Error('Failed to fetch user balance')
      return response.json()
    },
    enabled,
  })
}
