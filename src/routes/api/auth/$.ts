import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          return await auth.handler(request)
        } catch (err) {
          console.error('AUTH GET error:', err)
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'content-type': 'application/json' },
            },
          )
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          return await auth.handler(request)
        } catch (err) {
          console.error('AUTH POST error:', err)
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'content-type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
