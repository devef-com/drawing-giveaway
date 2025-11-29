import { useQuery } from '@tanstack/react-query'
import type { Pack } from '@/db/schema'

export function usePacks(enabled = true) {
  return useQuery<Array<Pack>>({
    queryKey: ['packs'],
    queryFn: async () => {
      const response = await fetch('/api/packs')
      if (!response.ok) throw new Error('Failed to fetch packs')
      return response.json()
    },
    enabled,
  })
}
