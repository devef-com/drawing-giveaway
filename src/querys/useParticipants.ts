import { useQuery } from '@tanstack/react-query'

export function useParticipants(drawingId: string, enabled = true) {
  return useQuery({
    queryKey: ['participants', drawingId],
    queryFn: async () => {
      const response = await fetch(`/api/drawings/${drawingId}/participants`)
      if (!response.ok) throw new Error('Failed to fetch participants')
      return response.json()
    },
    enabled,
  })
}

export function usePublicParticipants(drawingId: string, enabled = true) {
  return useQuery({
    queryKey: ['public-participants', drawingId],
    queryFn: async () => {
      const response = await fetch(`/api/drawings/${drawingId}/participants`)
      if (!response.ok) throw new Error('Failed to fetch participants')
      return response.json()
    },
    enabled,
  })
}
