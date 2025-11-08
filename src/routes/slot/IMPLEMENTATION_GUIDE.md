# Number Slots System - Complete Implementation Guide

## Overview

The new `/slot/$drawingId` route implements an advanced number selection system with virtual scrolling, reservation management, and real-time updates.

## ✅ What's Already Implemented

### 1. Database Schema
Location: `src/db/schema.ts`

✅ **Tables Created:**
- `drawings` - Main drawing information
- `participants` - Participant registrations
- `number_slots` - Dedicated slot tracking with status management
- `assets` - File uploads (payment proofs)

✅ **Key Features:**
- Status tracking: `available`, `reserved`, `taken`
- Expiration timestamps for temporary reservations
- Foreign key relationships with cascade deletes
- Indexes for efficient queries

### 2. Business Logic
Location: `src/lib/number-slots.ts`

✅ **Functions Available:**
- `initializeNumberSlots()` - Create slots for a drawing
- `getNumberSlots()` - Paginated slot retrieval
- `getDrawingStats()` - Real-time statistics
- `reserveNumber()` - Temporary reservation
- `confirmNumberReservation()` - Confirm after registration
- `releaseReservation()` - Cancel reservation
- `releaseExpiredReservations()` - Cleanup job
- `isNumberAvailable()` - Quick availability check
- `getRandomAvailableNumber()` - Lucky dip
- `bulkReserveNumbers()` - Multiple reservations

### 3. UI Components
Location: `src/components/`

✅ **NumberCell Component** (`NumberCell.tsx`)
- Color-coded status indicators
- Hover effects and animations
- Tooltips with participant info
- Loading states
- Accessibility features (ARIA labels)

✅ **NumberGrid Component** (`NumberGrid.tsx`)
- Virtual scrolling for performance
- Responsive column layout (5-15 columns)
- Lazy loading as user scrolls
- Auto-refresh with React Query
- Handles 10,000+ numbers efficiently

### 4. Route Implementation
Location: `src/routes/slot/$drawingId.tsx`

✅ **Features:**
- Complete drawing participation flow
- Number reservation before registration
- Real-time statistics display
- Form validation
- Error handling
- Loading states
- Mobile-optimized layout
- Informational help section

## ❌ What Needs to Be Implemented

### 1. API Endpoints
You need to create these API routes (examples provided in `API_EXAMPLES.ts`):

```
src/routes/api/drawings/
├── $drawingId.stats.ts         # GET stats endpoint
├── $drawingId.slots.ts         # GET slots endpoint  
├── $drawingId.reserve.ts       # POST reservation endpoint
└── $drawingId.participate.ts   # POST registration endpoint
```

**Priority: HIGH** - Route won't work without these.

### 2. Drawing Creation Integration
When creating a drawing with `winnerSelection: 'number'`, you need to:

```typescript
// In your drawing creation handler
import { initializeNumberSlots } from '@/lib/number-slots'

// After creating the drawing
if (drawing.winnerSelection === 'number') {
  await initializeNumberSlots(drawing.id, drawing.quantityOfNumbers)
}
```

**Priority: HIGH** - Required for number-based drawings.

### 3. Cleanup Cron Job
Set up a periodic job to release expired reservations:

```typescript
// Run every minute
import { releaseExpiredReservations } from '@/lib/number-slots'

setInterval(async () => {
  const count = await releaseExpiredReservations()
  console.log(`Released ${count} expired reservations`)
}, 60000)
```

**Priority: MEDIUM** - System will work but reservations won't auto-expire.

### 4. Payment Proof Upload (Optional)
If using paid drawings, implement file upload for payment proofs:

```typescript
// In your participation endpoint
if (drawing.isPaid) {
  // Create asset record
  const asset = await db.insert(assets).values({
    modelType: 'participant',
    modelId: participant.id.toString(),
    url: uploadedFileUrl,
  })
  
  // Link to participant
  await db.update(participants)
    .set({ paymentCaptureId: asset.id })
    .where(eq(participants.id, participant.id))
}
```

**Priority: LOW** - Only if using paid drawings.

## 🚀 Quick Start Guide

### Step 1: Ensure Database is Updated
```bash
npm run db:push
```

This will create the `number_slots` table if it doesn't exist.

### Step 2: Create API Endpoints
Copy the examples from `API_EXAMPLES.ts` and create the four required endpoints.

### Step 3: Test the Route
Navigate to: `/slot/{your-drawing-id}`

### Step 4: Link from Your App
```tsx
// Instead of /join, use /slot
<Link to="/slot/$drawingId" params={{ drawingId: drawing.id }}>
  Join Drawing
</Link>
```

## 📊 Testing Checklist

- [ ] Navigate to `/slot/test-drawing-id`
- [ ] Drawing details load correctly
- [ ] Number grid renders (use a drawing with 100+ numbers)
- [ ] Can select a number
- [ ] Number gets reserved (color changes to yellow)
- [ ] Can fill out registration form
- [ ] Submit creates participant
- [ ] Number status changes to taken (red)
- [ ] Statistics update correctly
- [ ] Mobile view is responsive
- [ ] Expired reservations are released (after 15 min)

## 🔧 Configuration Options

### Adjust Reservation Time
```typescript
// In $drawingId.tsx, line ~97
const response = await fetch(`/api/drawings/${drawingId}/reserve`, {
  body: JSON.stringify({ 
    number, 
    expirationMinutes: 15  // Change this value
  }),
})
```

### Change Grid Columns
```typescript
// In NumberGrid.tsx, lines 42-47
const getColumnsCount = () => {
  if (width < 640) return 5   // mobile - increase for more columns
  if (width < 768) return 8   // tablet
  if (width < 1024) return 10 // small desktop
  return 15                    // large desktop - increase for more columns
}
```

### Adjust Stats Refresh Rate
```typescript
// In $drawingId.tsx, line ~77
refetchInterval: 10000, // Change to 5000 for 5 seconds, etc.
```

## 📝 Migration from `/join` Route

If you have existing drawings using `/join`, here's how to migrate:

1. **Run for Existing Drawings:**
```typescript
// One-time migration script
import { initializeNumberSlots } from '@/lib/number-slots'

const drawings = await db.select().from(drawings)
  .where(eq(drawings.winnerSelection, 'number'))

for (const drawing of drawings) {
  try {
    await initializeNumberSlots(drawing.id, drawing.quantityOfNumbers)
    console.log(`✅ Initialized slots for ${drawing.id}`)
  } catch (error) {
    console.error(`❌ Failed for ${drawing.id}:`, error)
  }
}
```

2. **Migrate Existing Participants:**
```typescript
// Mark existing participant numbers as taken
const participants = await db.select().from(participants)
  .where(and(
    eq(participants.drawingId, drawingId),
    isNotNull(participants.selectedNumber)
  ))

for (const participant of participants) {
  await db.update(numberSlots)
    .set({ 
      status: 'taken', 
      participantId: participant.id 
    })
    .where(and(
      eq(numberSlots.drawingId, drawingId),
      eq(numberSlots.number, participant.selectedNumber!)
    ))
}
```

## 🐛 Troubleshooting

### Numbers Not Loading
- Check API endpoint returns data: `/api/drawings/:id/slots?numbers=1,2,3`
- Verify `number_slots` table has records
- Check browser console for errors

### Reservations Not Working
- Ensure reserve endpoint is implemented
- Check database for expired reservations
- Verify clock synchronization

### Performance Issues
- Reduce initial visible range (currently 100)
- Increase cache time in React Query
- Add database indexes on frequently queried columns

## 📚 Additional Resources

- **Architecture**: See `README.md` in this directory
- **Comparison**: See `COMPARISON.md` for `/join` vs `/slot`
- **API Examples**: See `API_EXAMPLES.ts` for endpoint implementations
- **Utilities**: See `src/lib/number-slots.ts` for all available functions

## 🎯 Next Steps

1. ✅ Review this implementation guide
2. ⬜ Create the API endpoints
3. ⬜ Test with a small drawing (10 numbers)
4. ⬜ Test with a large drawing (500+ numbers)
5. ⬜ Set up cleanup cron job
6. ⬜ Update your main drawing list to link to `/slot`
7. ⬜ Monitor performance and adjust as needed

## 💡 Tips

- Start small - test with 10 numbers first
- Monitor database queries during load testing
- Consider adding WebSocket support for instant updates
- Use the `/join` route as a fallback for simple cases
- Keep both routes available during migration period

---

**Questions or Issues?**
Refer to the code comments in each file for detailed documentation.
