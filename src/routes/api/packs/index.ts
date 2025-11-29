import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'

import { db } from '@/db/index'
import { packs } from '@/db/schema'

export const Route = createFileRoute('/api/packs/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Get all active packs
          const activePacks = await db
            .select()
            .from(packs)
            .where(eq(packs.isActive, true))
            .orderBy(packs.giwayType, packs.price)

          return new Response(JSON.stringify(activePacks), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error fetching packs:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch packs' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
