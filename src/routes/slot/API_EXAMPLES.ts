/**
 * ⚠️⚠️⚠️ DOCUMENTATION FILE - NOT ACTUAL WORKING CODE ⚠️⚠️⚠️
 *
 * API Routes for Number Slots System - EXAMPLES ONLY
 *
 * This file contains EXAMPLE CODE showing how to implement the required API endpoints.
 * These are NOT actual working routes - they're documentation/templates.
 * The TypeScript errors you see here are EXPECTED because these routes don't exist yet.
 *
 * To use these examples:
 * 1. Create new files in src/routes/api/drawings/
 * 2. Copy the relevant example code from below
 * 3. Adjust as needed for your setup
 *
 * TanStack Start API Pattern (Correct Way):
 * ✅ Use createFileRoute() from '@tanstack/react-router'
 * ✅ Wrap handlers in: server: { handlers: { GET, POST, etc. } }
 * ✅ Return new Response() objects
 * ❌ DON'T use createAPIFileRoute (doesn't exist)
 * ❌ DON'T use Response.json() (use new Response(JSON.stringify(...)))
 */

// @ts-nocheck - This is documentation, not actual working codeimport { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db/index'
import { drawings, participants } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  getDrawingStats,
  getNumberSlots,
  reserveNumber,
  confirmNumberReservation,
  releaseExpiredReservations,
} from '@/lib/number-slots'

// ============================================================================
// Example 1: GET /api/drawings/$drawingId/stats
// ============================================================================
// File: src/routes/api/drawings/$drawingId.stats.ts

export const statsRouteExample = createFileRoute(
  '/api/drawings/$drawingId/stats',
)({
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
          return new Response(
            JSON.stringify({ error: 'Failed to fetch stats' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})

// ============================================================================
// Example 2: GET /api/drawings/$drawingId/slots
// ============================================================================
// File: src/routes/api/drawings/$drawingId.slots.ts

export const slotsRouteExample = createFileRoute(
  '/api/drawings/$drawingId/slots',
)({
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
          return new Response(
            JSON.stringify({ error: 'Failed to fetch slots' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})

// ============================================================================
// Example 3: POST /api/drawings/$drawingId/reserve
// ============================================================================
// File: src/routes/api/drawings/$drawingId.reserve.ts

export const reserveRouteExample = createFileRoute(
  '/api/drawings/$drawingId/reserve',
)({
  server: {
    handlers: {
      POST: async ({
        request,
        params,
      }: {
        request: Request
        params: { drawingId: string }
      }) => {
        try {
          const body = await request.json()
          const { number, expirationMinutes = 15 } = body

          if (typeof number !== 'number') {
            return new Response(JSON.stringify({ error: 'Invalid number' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          // Release expired reservations first
          await releaseExpiredReservations()

          const result = await reserveNumber(
            params.drawingId,
            number,
            expirationMinutes,
          )

          if (!result.success) {
            return new Response(JSON.stringify({ error: result.message }), {
              status: 409,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return new Response(
            JSON.stringify({
              success: true,
              expiresAt: result.expiresAt?.toISOString(),
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('Reserve error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to reserve number' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})

// ============================================================================
// Example 4: POST /api/drawings/$drawingId/participate
// ============================================================================
// File: src/routes/api/drawings/$drawingId/participate.ts
// (This one already exists - you may want to extend it with the reservation logic)

export const participateRouteExample = createFileRoute(
  '/api/drawings/$drawingId/participate',
)({
  server: {
    handlers: {
      POST: async ({
        request,
        params,
      }: {
        request: Request
        params: { drawingId: string }
      }) => {
        try {
          const body = await request.json()
          const { name, email, phone, selectedNumber } = body

          // Validate required fields
          if (!name || !phone) {
            return new Response(
              JSON.stringify({ error: 'Name and phone are required' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Get drawing to check if it's number-based
          const drawing = await db
            .select()
            .from(drawings)
            .where(eq(drawings.id, params.drawingId))
            .limit(1)

          if (!drawing.length) {
            return new Response(
              JSON.stringify({ error: 'Drawing not found' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // If number-based, selectedNumber is required
          if (drawing[0].winnerSelection === 'number' && !selectedNumber) {
            return new Response(
              JSON.stringify({ error: 'Please select a number' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Create participant
          const [participant] = await db
            .insert(participants)
            .values({
              drawingId: params.drawingId,
              name,
              email: email || null,
              phone,
              selectedNumber: selectedNumber || null,
              isEligible: drawing[0].isPaid ? null : true, // Needs approval if paid
            })
            .returning()

          // If number-based, confirm the reservation
          if (selectedNumber) {
            try {
              await confirmNumberReservation(
                params.drawingId,
                selectedNumber,
                participant.id,
              )
            } catch (error) {
              // Rollback participant creation
              await db
                .delete(participants)
                .where(eq(participants.id, participant.id))

              return new Response(
                JSON.stringify({
                  error: 'Number reservation expired or already taken',
                }),
                {
                  status: 409,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              participant: {
                id: participant.id,
                name: participant.name,
                selectedNumber: participant.selectedNumber,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('Participate error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to complete registration' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Background job to release expired reservations
 * This should be called periodically (e.g., every minute via cron)
 *
 * You can set up a cron job or interval timer:
 * setInterval(() => cleanupExpiredReservations(), 60000)
 */
export async function cleanupExpiredReservations() {
  try {
    const count = await releaseExpiredReservations()
    console.log(`Released ${count} expired reservations`)
    return { released: count }
  } catch (error) {
    console.error('Cleanup error:', error)
    throw error
  }
}

/**
 * Helper function to initialize slots when a drawing is created
 * Call this in your drawing creation endpoint after creating the drawing
 *
 * Example usage in src/routes/api/drawings/index.ts:
 *
 * if (newDrawing.winnerSelection === 'number') {
 *   await initializeSlotsForDrawing(newDrawing.id, newDrawing.quantityOfNumbers)
 * }
 */
export async function initializeSlotsForDrawing(
  drawingId: string,
  quantity: number,
) {
  const { initializeNumberSlots } = await import('@/lib/number-slots')
  await initializeNumberSlots(drawingId, quantity)
}

// ============================================================================
// Summary of Required API Files
// ============================================================================
/*

Create these files in your project:

1. src/routes/api/drawings/$drawingId.stats.ts
   - Endpoint: GET /api/drawings/:drawingId/stats
   - Returns: { total, available, taken, reserved, percentageTaken }

2. src/routes/api/drawings/$drawingId.slots.ts  
   - Endpoint: GET /api/drawings/:drawingId/slots?numbers=1,2,3
   - Returns: { slots: [], totalCount, availableCount, ... }

3. src/routes/api/drawings/$drawingId.reserve.ts
   - Endpoint: POST /api/drawings/:drawingId/reserve
   - Body: { number: 42, expirationMinutes?: 15 }
   - Returns: { success: true, expiresAt: "..." }

4. src/routes/api/drawings/$drawingId/participate.ts (may already exist)
   - Endpoint: POST /api/drawings/:drawingId/participate
   - Body: { name, email?, phone, selectedNumber? }
   - Returns: { success: true, participant: {...} }
   - NOTE: Add the confirmNumberReservation() call to the existing endpoint

*/
