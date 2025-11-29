import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt, isNull, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import type { Drawing } from '@/db/schema'
import { db } from '@/db/index'
import { drawings, userBalances } from '@/db/schema'
import { auth } from '@/lib/auth'
import { initializeNumberSlots } from '@/lib/number-slots'

// Helper function to get user's available balance
async function getUserBalance(
  userId: string,
  giwayType: 'play_with_numbers' | 'no_numbers',
) {
  const now = new Date()
  const balances = await db
    .select()
    .from(userBalances)
    .where(
      and(
        eq(userBalances.userId, userId),
        eq(userBalances.giwayType, giwayType),
        or(isNull(userBalances.expiresAt), gt(userBalances.expiresAt, now)),
      ),
    )

  return {
    participants: balances.reduce((sum, b) => sum + b.participants, 0),
    images: balances.reduce((sum, b) => sum + b.images, 0),
    emails: balances.reduce((sum, b) => sum + b.emails, 0),
  }
}

// Helper function to deduct from user balance
async function deductFromBalance(
  userId: string,
  giwayType: 'play_with_numbers' | 'no_numbers',
  participantsNeeded: number,
) {
  const now = new Date()

  // Get all non-expired balances ordered by expiration (expiring first, then never-expiring)
  const balances = await db
    .select()
    .from(userBalances)
    .where(
      and(
        eq(userBalances.userId, userId),
        eq(userBalances.giwayType, giwayType),
        or(isNull(userBalances.expiresAt), gt(userBalances.expiresAt, now)),
      ),
    )
    .orderBy(userBalances.expiresAt) // This puts NULL last, which is what we want

  let remaining = participantsNeeded

  for (const balance of balances) {
    if (remaining <= 0) break

    const toDeduct = Math.min(balance.participants, remaining)
    remaining -= toDeduct

    // Update the balance
    await db
      .update(userBalances)
      .set({
        participants: balance.participants - toDeduct,
        updatedAt: now,
      })
      .where(eq(userBalances.id, balance.id))
  }

  return remaining === 0
}

export const Route = createFileRoute('/api/drawings/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          const userDrawings = await db
            .select()
            .from(drawings)
            .where(eq(drawings.userId, session.user.id))

          return new Response(JSON.stringify(userDrawings), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error fetching drawings:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch drawings' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
      POST: async ({ request }: { request: Request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          const body = (await request.json()) as Omit<Drawing, 'id' | 'userId'>

          // Determine giway type based on playWithNumbers
          const giwayType = body.playWithNumbers
            ? 'play_with_numbers'
            : 'no_numbers'

          // Get user's current balance for this giway type
          const balance = await getUserBalance(session.user.id, giwayType)

          // For play_with_numbers, the participants limit is quantityOfNumbers
          // For no_numbers, there's no predefined number limit (unlimited participants)
          const participantsNeeded = body.playWithNumbers
            ? body.quantityOfNumbers || 0
            : 0

          // Validate that user has enough participant balance (only for play_with_numbers)
          if (body.playWithNumbers && participantsNeeded > balance.participants) {
            return new Response(
              JSON.stringify({
                error: 'Insufficient balance',
                message: `You need ${participantsNeeded} participants but only have ${balance.participants} available.`,
                maxParticipants: balance.participants,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Deduct from balance if play_with_numbers
          if (body.playWithNumbers && participantsNeeded > 0) {
            const deductSuccess = await deductFromBalance(
              session.user.id,
              giwayType,
              participantsNeeded,
            )
            if (!deductSuccess) {
              return new Response(
                JSON.stringify({
                  error: 'Failed to deduct balance',
                  message: 'Could not deduct participants from your balance.',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
              )
            }
          }

          const newDrawing = await db
            .insert(drawings)
            .values({
              id: nanoid(10),
              userId: session.user.id,
              title: body.title,
              guidelines: body.guidelines || [],
              isPaid: body.isPaid || false,
              price: body.price || 0,
              winnerSelection: body.winnerSelection,
              quantityOfNumbers: body.quantityOfNumbers || 0,
              playWithNumbers: body.playWithNumbers ?? false,
              endAt: new Date(body.endAt),
              winnersAmount: body.winnersAmount || 1,
            })
            .returning()
          if (newDrawing[0].playWithNumbers) {
            await initializeNumberSlots(
              newDrawing[0].id,
              newDrawing[0].quantityOfNumbers,
            )
          }
          return new Response(JSON.stringify(newDrawing[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error creating drawing:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create drawing' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
