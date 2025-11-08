import { createFileRoute } from '@tanstack/react-router'
import { getNumberSlots } from '@/lib/number-slots'

/**
 * GET /api/drawings/:drawingId/slots
 *
 * Returns slot status for specific numbers
 * Query params: ?numbers=1,2,3,4,5
 */
export const Route = createFileRoute('/api/drawings/$drawingId/slots')({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request
        params: { drawingId: string }
      }) => {
        try {
          const url = new URL(request.url)
          const numbersParam = url.searchParams.get('numbers')

          if (!numbersParam) {
            return new Response(
              JSON.stringify({ error: 'Missing numbers parameter' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const numbers = numbersParam.split(',').map(Number)

          const result = await getNumberSlots({
            drawingId: params.drawingId,
            numbers,
            pageSize: numbers.length,
          })

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error fetching slots:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch slots' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
