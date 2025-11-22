# 🎯 Number Slots System - Directory Index

Welcome! This directory contains the improved drawing participation system with advanced number slot management.

## 📁 Files in This Directory

### 🎨 Main Route

- **`$drawingId.tsx`** - The main route component implementing the improved participation flow
  - Uses virtual scrolling for large number grids
  - Implements reservation system
  - Real-time statistics
  - Mobile-optimized responsive design

### 📖 Documentation

1. **`README.md`** - Overview of features and improvements
   - Architecture overview
   - Key features list
   - Benefits summary
   - Read this first for a quick overview

2. **`COMPARISON.md`** - Detailed comparison between `/join` and `/slot` routes
   - Feature comparison table
   - Performance metrics
   - When to use which route
   - Read this to understand the differences

3. **`IMPLEMENTATION_GUIDE.md`** - Complete implementation checklist
   - What's already done ✅
   - What needs to be implemented ❌
   - Step-by-step setup guide
   - Troubleshooting section
   - **Read this before implementing!**

4. **`API_EXAMPLES.ts`** - Example API endpoint implementations
   - Code examples for required endpoints
   - Helper functions
   - Integration patterns
   - Copy/paste starting point

## 🚀 Quick Start

### For Developers New to This System:

1. Read `README.md` → Understand what this is
2. Read `COMPARISON.md` → Understand why it's better
3. Read `IMPLEMENTATION_GUIDE.md` → Learn what to do
4. Reference `API_EXAMPLES.ts` → Implement the API

### For Users Wanting to Test:

1. Ensure API endpoints are created (see `API_EXAMPLES.ts`)
2. Navigate to `/slot/{drawing-id}` in your browser
3. Try selecting numbers and registering

### For Maintainers:

- Main component: `$drawingId.tsx`
- Supporting components: `../../components/NumberGrid.tsx` and `NumberCell.tsx`
- Business logic: `../../lib/number-slots.ts`
- Database schema: `../../db/schema.ts` (look for `number_slots` table)

## 🔗 Related Files

### Components Used

```
src/components/
├── NumberGrid.tsx      # Virtual scrolling grid
└── NumberCell.tsx      # Individual number display
```

### Business Logic

```
src/lib/
└── number-slots.ts     # All slot management functions
```

### Database

```
src/db/
└── schema.ts           # Contains number_slots table definition
```

## 📊 System Architecture

```
User Browser
    ↓
/slot/$drawingId (This Route)
    ↓
NumberGrid Component → NumberCell Components
    ↓                       ↓
API Endpoints         React Query Cache
    ↓                       ↓
number-slots.ts       Real-time Updates
    ↓
Database (number_slots table)
```

## 🎯 Key Features

- ✅ Virtual scrolling (handles 10,000+ numbers)
- ✅ Temporary reservations (15 minutes)
- ✅ Real-time statistics
- ✅ Responsive design
- ✅ Status tracking (available/reserved/taken)
- ✅ Prevents race conditions
- ✅ Automatic cleanup of expired reservations

## 📦 Dependencies

This route uses:

- `@tanstack/react-router` - Routing
- `@tanstack/react-query` - Data fetching & caching
- `drizzle-orm` - Database queries
- UI components from `src/components/ui/`
- Custom components: `NumberGrid`, `NumberCell`

## 🔧 Configuration

All configurable values are documented in the code with comments:

- Reservation expiration time (default: 15 minutes)
- Stats refresh interval (default: 10 seconds)
- Grid column counts for different screen sizes
- Virtual scrolling batch size (default: 100)

## 🐛 Known Issues / TODOs

- [ ] API endpoints need to be created (see `API_EXAMPLES.ts`)
- [ ] Cron job for cleanup needs to be scheduled
- [ ] WebSocket support for instant updates (future enhancement)
- [ ] Bulk number selection support (future enhancement)

## 📞 Need Help?

1. Check the `IMPLEMENTATION_GUIDE.md` troubleshooting section
2. Review code comments in `$drawingId.tsx`
3. Check React Query DevTools in browser
4. Verify database records in the `number_slots` table

## 🎓 Learning Path

**Beginner**: Start with `README.md`, then look at the UI in `$drawingId.tsx`
**Intermediate**: Read `COMPARISON.md`, study `NumberGrid.tsx` component
**Advanced**: Review `number-slots.ts` business logic, implement API endpoints

---

**Last Updated**: November 2025
**Status**: Ready for API implementation
**Version**: 1.0.0
