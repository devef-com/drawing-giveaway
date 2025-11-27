import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'

import { db } from '@/db/index'
import { drawings } from '@/db/schema'
import { auth } from '@/lib/auth'
import { selectWinners, getDrawingWinners } from '@/lib/winners/select-winners'

export const Route = createFileRoute('/api/drawings/$drawingId/select-winners')(
  {
    server: {
      handlers: {
        /**
         * POST - Select winners for a drawing
         *
         * Requirements:
         * - User must be authenticated and be the drawing owner
         * - Drawing must have ended (endAt < now)
         * - For 'manually' mode: winnerNumbers array is required in body
         * - For 'system' mode: winnerNumbers is optional (will be generated)
         *
         * Body (optional):
         * - winnerNumbers: number[] - Required for 'manually' mode, optional for 'system'
         *
         * Hosts can re-run winner selection multiple times.
         * Previous winners will be cleared before selecting new ones.
         *
         * Process:
         * - Validates ownership and drawing state
         * - Clears any existing winners
         * - Calls selectWinners() which handles random or number-based selection
         * - Returns winner information
         */
        POST: async ({
          request,
          params,
        }: {
          request: Request
          params: { drawingId: string }
        }) => {
          // Authenticate user
          const session = await auth.api.getSession({
            headers: request.headers,
          })

          if (!session) {
            return new Response(
              JSON.stringify({ error: 'Unauthorized. Please log in.' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          try {
            const { drawingId } = params

            // Parse body for winnerNumbers (optional)
            let winnerNumbers: number[] | undefined
            try {
              const body = await request.json()
              if (body.winnerNumbers && Array.isArray(body.winnerNumbers)) {
                winnerNumbers = body.winnerNumbers
                  .map((n: any) => parseInt(n, 10))
                  .filter((n: number) => !isNaN(n))
              }
            } catch {
              // Body might be empty for system mode, that's ok
            }

            // Verify drawing exists and user is the owner
            const drawing = await db
              .select()
              .from(drawings)
              .where(eq(drawings.id, drawingId))
              .limit(1)

            if (!drawing || drawing.length === 0) {
              return new Response(
                JSON.stringify({ error: 'Drawing not found' }),
                {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            // Verify ownership
            if (drawing[0].userId !== session.user.id) {
              return new Response(
                JSON.stringify({
                  error:
                    'Forbidden. Only the drawing owner can select winners.',
                }),
                {
                  status: 403,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            // Validate winnerNumbers for manually mode
            const isManuallyMode =
              drawing[0].playWithNumbers &&
              drawing[0].winnerSelection === 'manually'
            if (
              isManuallyMode &&
              (!winnerNumbers || winnerNumbers.length === 0)
            ) {
              return new Response(
                JSON.stringify({
                  error:
                    'Winner numbers are required for manual selection mode',
                }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            // Select winners
            const result = await selectWinners(drawingId, winnerNumbers)

            return new Response(
              JSON.stringify({
                success: true,
                message: `Successfully selected ${result.winners.length} winner(s)`,
                data: result,
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          } catch (error) {
            console.error('Error selecting winners:', error)

            // Return specific error messages to user
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to select winners'

            return new Response(
              JSON.stringify({
                error: errorMessage,
                success: false,
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }
        },

        /**
         * GET - Retrieve winners for a drawing
         *
         * Public endpoint - anyone can view winners
         */
        GET: async ({ params }: { params: { drawingId: string } }) => {
          try {
            const { drawingId } = params

            // Verify drawing exists
            const drawing = await db
              .select()
              .from(drawings)
              .where(eq(drawings.id, drawingId))
              .limit(1)

            if (!drawing || drawing.length === 0) {
              return new Response(
                JSON.stringify({ error: 'Drawing not found' }),
                {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            // Get winners
            const winnersData = await getDrawingWinners(drawingId)

            if (winnersData.winners.length === 0) {
              return new Response(
                JSON.stringify({
                  message: 'No winners selected yet',
                  winners: [],
                  winnerNumbers: null,
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            return new Response(
              JSON.stringify({
                drawingId,
                ...winnersData,
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          } catch (error) {
            console.error('Error fetching winners:', error)

            return new Response(
              JSON.stringify({
                error: 'Failed to fetch winners',
              }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }
        },
      },
    },
  },
)
