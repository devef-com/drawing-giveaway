import { createFileRoute } from '@tanstack/react-router'
import { getDrawingStats } from '@/lib/number-slots'

/**
 * GET /api/drawings/:drawingId/stats
 *
 * Returns real-time statistics about slot availability
 */
export const Route = createFileRoute('/api/drawings/$drawingId/stats')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { drawingId: string } }) => {
        try {
          const stats = await getDrawingStats(params.drawingId)
          return new Response(JSON.stringify(stats), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error fetching stats:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch stats' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
