import { createFileRoute } from '@tanstack/react-router'
import { and, eq, gt, isNull, or } from 'drizzle-orm'

import { db } from '@/db/index'
import { userBalances } from '@/db/schema'
import { auth } from '@/lib/auth'

export interface UserBalanceResponse {
  playWithNumbers: {
    participants: number
    images: number
    emails: number
  }
  noNumbers: {
    participants: number
    images: number
    emails: number
  }
}

export const Route = createFileRoute('/api/user/balance')({
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
          // Get all non-expired balances for the user
          const now = new Date()
          const balances = await db
            .select()
            .from(userBalances)
            .where(
              and(
                eq(userBalances.userId, session.user.id),
                or(
                  isNull(userBalances.expiresAt),
                  gt(userBalances.expiresAt, now),
                ),
              ),
            )

          // Aggregate balances by giway type
          const response: UserBalanceResponse = {
            playWithNumbers: {
              participants: 0,
              images: 0,
              emails: 0,
            },
            noNumbers: {
              participants: 0,
              images: 0,
              emails: 0,
            },
          }

          for (const balance of balances) {
            if (balance.giwayType === 'play_with_numbers') {
              response.playWithNumbers.participants += balance.participants
              response.playWithNumbers.images += balance.images
              response.playWithNumbers.emails += balance.emails
            } else {
              response.noNumbers.participants += balance.participants
              response.noNumbers.images += balance.images
              response.noNumbers.emails += balance.emails
            }
          }

          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error fetching user balance:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch user balance' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
