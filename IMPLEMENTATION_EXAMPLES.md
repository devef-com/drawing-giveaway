# Implementation Examples

This document provides practical examples of how to use the participants rendering system.

## Basic Usage

### 1. Initializing Number Slots for a New Drawing

When a user creates a new drawing, initialize the number slots:

```typescript
import { initializeNumberSlots } from '@/lib/number-slots'

// After creating a drawing
const drawing = await db
  .insert(drawings)
  .values({
    id: 'drawing-abc123',
    userId: user.id,
    title: 'My Giveaway',
    quantityOfNumbers: 300,
    winnerSelection: 'number',
    endAt: new Date('2024-12-31'),
  })
  .returning()

// Initialize the number slots
await initializeNumberSlots(drawing.id, drawing.quantityOfNumbers)
```

### 2. Displaying the Number Grid to Users

```tsx
import { NumberGrid } from '@/components/NumberGrid'
import { DrawingStats } from '@/components/DrawingStats'

export function DrawingPage({ drawingId }: { drawingId: string }) {
  const handleNumberSelect = async (number: number) => {
    // Reserve the number
    const response = await fetch(`/api/drawings/${drawingId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number }),
    })

    const result = await response.json()

    if (result.success) {
      // Proceed to payment/registration
      router.push(`/drawings/${drawingId}/register?number=${number}`)
    } else {
      alert(result.message)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Select Your Number</h1>

      {/* Show statistics */}
      <DrawingStats drawingId={drawingId} />

      {/* Number selection grid */}
      <NumberGrid
        drawingId={drawingId}
        totalNumbers={300}
        onNumberSelect={handleNumberSelect}
        isSelectable={true}
      />
    </div>
  )
}
```

### 3. Implementing the Reservation API

```typescript
// src/routes/api/drawings/[drawingId]/reserve.ts
import { json } from '@tanstack/start'
import { reserveNumber } from '@/lib/number-slots'

export async function POST({ params, request }) {
  const { drawingId } = params
  const { number } = await request.json()

  // Validate input
  if (!number || typeof number !== 'number') {
    return json({ success: false, message: 'Invalid number' }, { status: 400 })
  }

  // Reserve the number (15 minute expiration)
  const result = await reserveNumber(drawingId, number, 15)

  if (result.success) {
    return json({
      success: true,
      expiresAt: result.expiresAt,
      message: 'Number reserved successfully',
    })
  }

  return json(result, { status: 409 })
}
```

### 4. Implementing the Slots Query API

```typescript
// src/routes/api/drawings/[drawingId]/slots.ts
import { json } from '@tanstack/start'
import { getNumberSlots } from '@/lib/number-slots'

export async function GET({ params, request }) {
  const { drawingId } = params
  const url = new URL(request.url)

  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '100')
  const status = url.searchParams.get('status')
  const numbersParam = url.searchParams.get('numbers')

  const numbers = numbersParam
    ? numbersParam
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined

  const result = await getNumberSlots({
    drawingId,
    page,
    pageSize,
    status: status as 'available' | 'reserved' | 'taken' | undefined,
    numbers,
  })

  return json(result)
}
```

### 5. Implementing the Stats API

```typescript
// src/routes/api/drawings/[drawingId]/stats.ts
import { json } from '@tanstack/start'
import { getDrawingStats } from '@/lib/number-slots'

export async function GET({ params }) {
  const { drawingId } = params
  const stats = await getDrawingStats(drawingId)
  return json(stats)
}
```

### 6. Confirming a Participant Registration

After payment verification or approval:

```typescript
import {
  confirmNumberReservation,
  releaseReservation,
} from '@/lib/number-slots'

async function handleParticipantApproval(
  drawingId: string,
  participantId: number,
  number: number,
  isApproved: boolean,
) {
  if (isApproved) {
    // Confirm the reservation
    await confirmNumberReservation(drawingId, number, participantId)

    // Update participant as eligible
    await db
      .update(participants)
      .set({ isEligible: true })
      .where(eq(participants.id, participantId))
  } else {
    // Reject and release the number
    await releaseReservation(drawingId, number)

    // Update participant as rejected
    await db
      .update(participants)
      .set({ isEligible: false })
      .where(eq(participants.id, participantId))
  }
}
```

### 7. Background Job for Releasing Expired Reservations

Create a cron job that runs every minute:

```typescript
// src/jobs/release-expired-reservations.ts
import { releaseExpiredReservations } from '@/lib/number-slots'

export async function releaseExpiredReservationsJob() {
  try {
    const count = await releaseExpiredReservations()

    if (count > 0) {
      console.log(`Released ${count} expired reservations`)
    }

    return { success: true, count }
  } catch (error) {
    console.error('Failed to release expired reservations:', error)
    return { success: false, error }
  }
}

// Schedule this to run every minute
// Using your preferred scheduler (e.g., node-cron, BullMQ, etc.)
```

### 8. Quick Pick (Random Number Selection)

```typescript
import { getRandomAvailableNumber } from '@/lib/number-slots'

async function handleQuickPick(drawingId: string) {
  const luckyNumber = await getRandomAvailableNumber(drawingId)

  if (luckyNumber === null) {
    alert('No numbers available')
    return
  }

  // Automatically reserve this number
  const result = await reserveNumber(drawingId, luckyNumber)

  if (result.success) {
    router.push(`/drawings/${drawingId}/register?number=${luckyNumber}`)
  }
}
```

### 9. Allowing Multiple Number Selection

```typescript
import { bulkReserveNumbers } from '@/lib/number-slots'

async function handleMultipleSelection(
  drawingId: string,
  selectedNumbers: number[],
) {
  const result = await bulkReserveNumbers(drawingId, selectedNumbers, 15)

  if (result.successful.length > 0) {
    console.log(`Reserved: ${result.successful.join(', ')}`)
  }

  if (result.failed.length > 0) {
    console.log(`Failed to reserve: ${result.failed.join(', ')}`)
  }

  return result
}
```

### 10. Displaying User's Selected Numbers

```typescript
import { getParticipantNumbers } from '@/lib/number-slots'

async function showMyNumbers(drawingId: string, participantId: number) {
  const myNumbers = await getParticipantNumbers(drawingId, participantId)

  return (
    <div>
      <h2>Your Numbers</h2>
      <div className="flex gap-2">
        {myNumbers.map(number => (
          <span key={number} className="badge">
            {number}
          </span>
        ))}
      </div>
    </div>
  )
}
```

## Advanced Usage

### Real-time Updates with WebSocket (Optional)

```typescript
// Server-side (WebSocket handler)
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws, req) => {
  const drawingId = new URL(req.url, 'http://localhost').searchParams.get(
    'drawing',
  )

  // Join room for this drawing
  ws.drawingId = drawingId

  ws.on('close', () => {
    // Handle disconnection
  })
})

// Broadcast number status changes
export function broadcastNumberUpdate(
  drawingId: string,
  number: number,
  status: string,
) {
  wss.clients.forEach((client) => {
    if (
      client.drawingId === drawingId &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(
        JSON.stringify({
          type: 'number_update',
          number,
          status,
        }),
      )
    }
  })
}

// Client-side
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeUpdates(drawingId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?drawing=${drawingId}`)

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)

      if (update.type === 'number_update') {
        // Invalidate the cache for this drawing
        queryClient.invalidateQueries({
          queryKey: ['number-slots', drawingId],
        })
      }
    }

    return () => ws.close()
  }, [drawingId, queryClient])
}
```

### Optimistic UI Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useReserveNumber(drawingId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (number: number) => {
      const response = await fetch(`/api/drawings/${drawingId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number }),
      })

      if (!response.ok) throw new Error('Failed to reserve')
      return response.json()
    },

    // Optimistically update the UI
    onMutate: async (number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['number-slots', drawingId],
      })

      // Snapshot the previous value
      const previousSlots = queryClient.getQueryData([
        'number-slots',
        drawingId,
      ])

      // Optimistically update to the new value
      queryClient.setQueryData(['number-slots', drawingId], (old: any) => {
        if (!old) return old

        return {
          ...old,
          slots: old.slots.map((slot: any) =>
            slot.number === number ? { ...slot, status: 'reserved' } : slot,
          ),
        }
      })

      return { previousSlots }
    },

    // If the mutation fails, rollback
    onError: (err, number, context) => {
      queryClient.setQueryData(
        ['number-slots', drawingId],
        context?.previousSlots,
      )
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['number-slots', drawingId],
      })
    },
  })
}
```

## Testing Examples

### Unit Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  initializeNumberSlots,
  getNumberSlots,
  reserveNumber,
  confirmNumberReservation,
  releaseExpiredReservations,
} from '@/lib/number-slots'
import { db } from '@/db'

describe('Number Slots', () => {
  const testDrawingId = 'test-drawing-' + Date.now()

  beforeEach(async () => {
    // Create a test drawing
    await db.insert(drawings).values({
      id: testDrawingId,
      userId: 'test-user',
      title: 'Test Drawing',
      quantityOfNumbers: 100,
      winnerSelection: 'number',
      endAt: new Date('2024-12-31'),
    })
  })

  afterEach(async () => {
    // Clean up test data
    await db.delete(numberSlots).where(eq(numberSlots.drawingId, testDrawingId))
    await db.delete(drawings).where(eq(drawings.id, testDrawingId))
  })

  it('should initialize slots correctly', async () => {
    await initializeNumberSlots(testDrawingId, 100)

    const result = await getNumberSlots({ drawingId: testDrawingId })

    expect(result.totalCount).toBe(100)
    expect(result.availableCount).toBe(100)
    expect(result.takenCount).toBe(0)
  })

  it('should reserve a number', async () => {
    await initializeNumberSlots(testDrawingId, 100)

    const result = await reserveNumber(testDrawingId, 42)
    expect(result.success).toBe(true)

    const slots = await getNumberSlots({
      drawingId: testDrawingId,
      numbers: [42],
    })

    expect(slots.slots[0].status).toBe('reserved')
  })

  it('should not allow double reservation', async () => {
    await initializeNumberSlots(testDrawingId, 100)

    await reserveNumber(testDrawingId, 42)
    const result = await reserveNumber(testDrawingId, 42)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Number is not available')
  })

  it('should release expired reservations', async () => {
    await initializeNumberSlots(testDrawingId, 100)

    // Reserve with negative expiration (already expired)
    await db.insert(numberSlots).values({
      drawingId: testDrawingId,
      number: 50,
      status: 'reserved',
      expiresAt: new Date(Date.now() - 1000),
    })

    const count = await releaseExpiredReservations()
    expect(count).toBeGreaterThan(0)
  })
})
```

## Performance Considerations

1. **Batch Operations**: When initializing large numbers of slots (1000+), use batching
2. **Indexing**: Ensure database indexes are created as specified in the strategy document
3. **Caching**: Configure React Query with appropriate stale times (30 seconds recommended)
4. **Pagination**: Use reasonable page sizes (100-200 items per request)
5. **Lazy Loading**: Only load visible numbers to reduce initial load time

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on reservation endpoints
2. **Validation**: Always validate number ranges and drawing access
3. **Authorization**: Verify user permissions before allowing operations
4. **Transaction Safety**: Use database transactions for critical operations
5. **Input Sanitization**: Validate and sanitize all user inputs

## Monitoring

Track these metrics in production:

```typescript
// Example metrics to monitor
const metrics = {
  averageGridLoadTime: 0,
  cacheHitRate: 0,
  reservationSuccessRate: 0,
  averageReservationTime: 0,
  expiredReservationsPerHour: 0,
}
```

Monitor for:

- Slow query performance
- High reservation failure rates
- Memory usage with large grids
- Cache effectiveness
- WebSocket connection stability (if using real-time)
