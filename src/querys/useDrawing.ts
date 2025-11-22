import { useQuery } from '@tanstack/react-query'

interface Drawing {
  id: string
  title: string
  guidelines: Array<string> | null
  isPaid: boolean
  price: number
  winnerSelection: 'random' | 'number'
  quantityOfNumbers: number
  endAt: string
  createdAt: string
}

export function useDrawing(drawingId: string, enabled = true) {
  return useQuery<Drawing>({
    queryKey: ['public-drawing', drawingId],
    queryFn: async () => {
      const response = await fetch(`/api/drawings/${drawingId}`)
      if (!response.ok) throw new Error('Failed to fetch drawing')
      return response.json()
    },
    enabled,
    retry(failureCount, error) {
      // Retry up to 2 times for network errors
      if (error instanceof TypeError && failureCount < 2) {
        return true
      }
      return false
    },
  })
}
