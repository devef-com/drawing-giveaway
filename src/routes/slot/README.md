# Improved Number Slots Drawing Route

This directory contains an improved implementation of the drawing participation page using the advanced number slots system.

## Route

- **Path**: `/slot/$drawingId`
- **Component**: `SlotDrawingParticipation`

## Key Improvements Over `/join` Route

### 1. **Virtual Scrolling with NumberGrid Component**
- Efficiently handles large number grids (100, 500, 1000+ numbers)
- Only loads visible numbers, reducing initial load time
- Smooth scrolling with automatic loading of more numbers
- Responsive column layout (5-15 columns based on screen size)

### 2. **Advanced Number Slot Management**
- Uses dedicated `number_slots` database table for efficient tracking
- Three states: `available`, `reserved`, `taken`
- Real-time status updates with React Query
- Prevents race conditions with proper locking

### 3. **Temporary Reservations**
- Numbers are temporarily reserved (15 minutes) when selected
- Prevents multiple users from selecting the same number
- Automatic expiration and release of unused reservations
- Visual countdown of reservation time

### 4. **Better UX**
- **NumberCell Component**: 
  - Color-coded status (green=available, yellow=reserved, red=taken)
  - Hover effects and animations
  - Tooltips showing participant info and expiration times
  - Loading states during operations
  
- **Responsive Design**: 
  - Mobile-first approach
  - Adaptive grid columns
  - Touch-friendly number selection

### 5. **Performance Optimizations**
- Pagination and lazy loading of number slots
- Efficient database queries with indexes
- React Query caching (30s stale time)
- Optimistic updates for better perceived performance

### 6. **Real-time Statistics**
- Live availability counter
- Percentage taken indicator
- Refreshes every 10 seconds
- Visible to all participants

## Architecture

```
src/
├── routes/
│   └── slot/
│       └── $drawingId.tsx          # Main route component
├── components/
│   ├── NumberGrid.tsx              # Virtual scrolling grid
│   └── NumberCell.tsx              # Individual number cell
└── lib/
    └── number-slots.ts             # Business logic utilities
```

## API Endpoints Required

The route expects the following API endpoints:

1. **GET** `/api/drawings/:drawingId` - Get drawing details
2. **GET** `/api/drawings/:drawingId/stats` - Get real-time statistics
3. **GET** `/api/drawings/:drawingId/slots?numbers=1,2,3` - Get slot status
4. **POST** `/api/drawings/:drawingId/reserve` - Reserve a number
   ```json
   { "number": 42, "expirationMinutes": 15 }
   ```
5. **POST** `/api/drawings/:drawingId/participate` - Complete registration
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "phone": "+1234567890",
     "selectedNumber": 42
   }
   ```

## Database Schema

Uses the `number_slots` table from the schema:

```sql
CREATE TABLE number_slots (
  id SERIAL PRIMARY KEY,
  drawing_id VARCHAR(255) REFERENCES drawings(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'reserved', 'taken'
  participant_id INTEGER REFERENCES participants(id) ON DELETE SET NULL,
  reserved_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Example

```tsx
// Link to the improved route
<Link to="/slot/$drawingId" params={{ drawingId: 'abc123' }}>
  Join Drawing (Improved)
</Link>
```

## Benefits

1. **Scalability**: Handles drawings with 10,000+ numbers efficiently
2. **Reliability**: Prevents double-booking with reservation system
3. **User Experience**: Smoother interactions with better visual feedback
4. **Maintainability**: Separated concerns with reusable components
5. **Performance**: Optimized queries and caching strategies

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Bulk number selection (allow multiple numbers per participant)
- [ ] Number search/filter functionality
- [ ] Lucky dip (random number selection)
- [ ] Mobile app-like PWA experience
- [ ] Animation for recently taken numbers
- [ ] Sound effects for selection feedback
