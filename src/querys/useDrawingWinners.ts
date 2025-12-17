import { useQuery } from '@tanstack/react-query'

export interface Winner {
  participantId: string
  participantName: string
  participantEmail: string | null
  participantPhone: string
  selectedAt: string
}

export interface DrawingWinnersResponse {
  drawingId: string
  winners: Winner[]
  winnerNumbers: number[] | null
  selectionMethod: 'random' | 'number' | null
  message?: string
}

export function useDrawingWinners(drawingId: string, enabled = true) {
  return useQuery<DrawingWinnersResponse>({
    queryKey: ['drawing-winners', drawingId],
    queryFn: async () => {
      const response = await fetch(`/api/drawings/${drawingId}/select-winners`)
      if (!response.ok) throw new Error('Failed to fetch winners')
      return response.json()
    },
    enabled,
    staleTime: 30000, // Cache for 30 seconds
  })
}
