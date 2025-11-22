import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db/index'
import { participants } from '@/db/schema'
import { getParticipantNumbers } from '@/lib/number-slots'

export const Route = createFileRoute('/api/drawings/$drawingId/$participantId')(
  {
    server: {
      handlers: {
        GET: async ({
          params,
        }: {
          params: { drawingId: string; participantId: string }
        }) => {
          // getParticipantNumbers

          const { drawingId, participantId } = params
          try {
            const participantInfo = await db
              .select()
              .from(participants)
              .where(
                and(
                  eq(participants.drawingId, drawingId),
                  eq(participants.id, +participantId),
                ),
              )
              .limit(1)

            if (!participantInfo || participantInfo.length === 0) {
              return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              })
            }

            const participantNumbers = await getParticipantNumbers(
              drawingId,
              +participantId,
            )

            const { selectedNumber, ...rest } = participantInfo[0]

            return new Response(
              JSON.stringify({
                ...rest,
                numbers: participantNumbers,
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          } catch (error) {
            return new Response(
              JSON.stringify({ error: 'Failed to fetch participant' }),
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
