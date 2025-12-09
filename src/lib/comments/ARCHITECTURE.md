# Participant Comments Feature - Visual Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐           ┌─────────────────────────┐  │
│  │   Host View        │           │   Participant View      │  │
│  │  m.$participant    │           │  p.$participateId       │  │
│  ├────────────────────┤           ├─────────────────────────┤  │
│  │ • Add comments     │           │ • View conversation     │  │
│  │ • Toggle visibility│           │ • Reply to host         │  │
│  │ • View full thread │           │ • Add comments          │  │
│  │ • See replies      │           │ • NO LOGIN REQUIRED     │  │
│  │ • Edit/Delete own  │           │                         │  │
│  └────────┬───────────┘           └────────┬────────────────┘  │
│           │                                │                   │
└───────────┼────────────────────────────────┼───────────────────┘
            │                                │
            ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/participant/:participantId/comments                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  GET    - Fetch all comments (host only)                 │  │
│  │  POST   - Create new comment (host only)                 │  │
│  │  PATCH  - Update comment (author only)                   │  │
│  │  DELETE - Remove comment (author only)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/drawings/:drawingId/p/:participantId/comments      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  GET  - Fetch visible comments (NO AUTH - public)        │  │
│  │  POST - Create participant comment (NO AUTH - public)    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/lib/comments/index.ts                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • createHostComment()        (authenticated)             │  │
│  │  • createParticipantComment() (NO AUTH)                   │  │
│  │  • getCommentsForHost()       (full thread)               │  │
│  │  • getCommentsForParticipant() (visible only)             │  │
│  │  • updateComment()            (host only)                 │  │
│  │  • deleteComment()            (host only)                 │  │
│  │  • verifyDrawingOwnership()   (authorization)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Database Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  participant_comments table (BIDIRECTIONAL)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  id                    SERIAL PRIMARY KEY                 │  │
│  │  participant_id        INTEGER → participants(id)         │  │
│  │  author_id             TEXT → user(id) [NULLABLE]         │  │
│  │  author_type           ENUM ('host', 'participant')       │  │
│  │  author_name           VARCHAR(255) [for participants]    │  │
│  │  comment               TEXT NOT NULL                      │  │
│  │  is_visible_to_participant  BOOLEAN DEFAULT TRUE          │  │
│  │  created_at            TIMESTAMP DEFAULT NOW()            │  │
│  │  updated_at            TIMESTAMP DEFAULT NOW()            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Indexes:                                                       │
│  • idx_participant_comments_participant_id                      │
│  • idx_participant_comments_author_id                           │
│  • idx_participant_comments_author_type [NEW]                   │
│  • idx_participant_comments_created_at                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Host Adds Comment

```
┌──────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│  Host UI │────▶│ API POST│────▶│ Validate │────▶│ Database │
└──────────┘     └─────────┘     │ & Auth   │     │  INSERT  │
                                 └──────────┘     │ author_  │
     ▲                                            │ type:    │
     │                                            │ 'host'   │
     └────────────────────────────────────────────┴──────────┘
                    Return new comment
```

### 2. Participant Adds Comment (NO AUTH)

```
┌────────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│Participant │────▶│ API POST│────▶│ Validate │────▶│ Database │
│    UI      │     │ (PUBLIC)│     │ comment  │     │  INSERT  │
└────────────┘     └─────────┘     │   text   │     │ author_  │
     ▲                             └──────────┘     │ type:    │
     │                                              │'particip'│
     └──────────────────────────────────────────────┴──────────┘
              Return new comment (no auth needed)
```

### 3. Conversation View (Both Parties)

```
┌────────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│  Any User  │────▶│ API GET │────▶│  Filter  │────▶│ Database │
│            │     │         │     │ by visi- │     │  SELECT  │
└────────────┘     └─────────┘     │ bility   │     └──────────┘
     ▲                             └──────────┘           │
     │                                                    │
     └────────────────────────────────────────────────────┘
              Return conversation thread
```

## Component Hierarchy

```
src/routes/drawings/$drawingId/m.$participant.tsx
├── Participant Information Card
├── Status Change Section
└── ParticipantComments Component ← NEW (BIDIRECTIONAL)
    ├── Add Comment Form (Host)
    │   ├── Textarea (comment input)
    │   ├── Visibility Toggle Switch
    │   └── Submit Button
    └── Conversation Thread (Chronological)
        └── Comment Item (for each comment)
            ├── Author Badge (Host/Participant)
            ├── Author Name & Timestamp
            ├── Visibility Badge (if private)
            └── Comment Text

src/routes/drawings/$drawingId/p.$participateId.tsx
├── Participant Status Card
├── QR Code Card
└── ParticipantCommentsView Component ← NEW (BIDIRECTIONAL)
    ├── Conversation Thread (read + write)
    │   └── Comment Item (for each)
    │       ├── Author Label (Host/You)
    │       ├── Comment Text
    │       └── Timestamp
    └── Reply Form (Participant can add comments)
        ├── Textarea
        └── Send Button
```

## Database Relationships

```
┌──────────────┐         ┌───────────────────────┐
│     user     │         │   participants        │
│──────────────│         │───────────────────────│
│ id (PK)      │◀────┐   │ id (PK)               │◀───┐
│ name         │     │   │ drawing_id            │    │
│ email        │     │   │ name                  │    │
└──────────────┘     │   │ phone                 │    │
                     │   │ is_eligible           │    │
                     │   └───────────────────────┘    │
                     │                                │
                     │   ┌───────────────────────────┐│
                     │   │ participant_comments      ││
                     │   │───────────────────────────││
                     └───│ author_id (FK) [NULLABLE] ││
                         │ participant_id (FK) ──────┘│
                         │ author_type (ENUM)         │
                         │ author_name (VARCHAR)      │
                         │ comment                    │
                         │ is_visible_to_participant  │
                         │ created_at                 │
                         │ updated_at                 │
                         └────────────────────────────┘

Cascade Rules:
• Delete user → Delete their host comments (author_id FK)
• Delete participant → Delete all comments (thread cleanup)

Author Types:
• 'host' - Comment from drawing host (author_id NOT NULL)
• 'participant' - Comment from participant (author_id NULL)
```

## Access Control Matrix

```
┌──────────────────────┬──────────┬─────────────────┬──────────┐
│ Action               │   Host   │   Participant   │  Public  │
├──────────────────────┼──────────┼─────────────────┼──────────┤
│ View All (Full)      │    ✓     │        ✗        │    ✗     │
│ View Visible Thread  │    ✓     │        ✓        │    ✗     │
│ Create Host Comment  │    ✓     │        ✗        │    ✗     │
│ Create Part Comment  │    ✗     │        ✓        │    ✗     │
│ Edit Host Comment    │    ✓*    │        ✗        │    ✗     │
│ Edit Part Comment    │    ✗     │        ✗        │    ✗     │
│ Delete Host Comment  │    ✓*    │        ✗        │    ✗     │
│ Delete Part Comment  │    ✗     │        ✗        │    ✗     │
│ Toggle Visibility    │    ✓*    │        ✗        │    ✗     │
└──────────────────────┴──────────┴─────────────────┴──────────┘

Notes:
* Host = Drawing owner (authenticated user)
* Participant = Uses unique participant link (NO login)
* ✓* = Only for their own comments
* Participant comments cannot be edited or deleted (permanent record)
* Public = Anyone without participant link
```

## UI Mockups (Text-based)

### Host View - Conversation Thread

```
┌─────────────────────────────────────────────────────────────┐
│ Conversation                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Add a message...                                        │ │
│ │                                                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☑ Visible to participant          [Send Message]           │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ CONVERSATION THREAD                                         │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ John Doe (Host)                    2025-12-08 10:00 AM  │ │
│ │ Please submit payment proof by tomorrow                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────[ Participant ]─┐ │
│ │ Jane Smith                         2025-12-08 11:00 AM  │ │
│ │ I will submit it by today evening. Thank you!           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ John Doe (Host)        [Private]   2025-12-08 12:00 PM  │ │
│ │ Internal note: Follow up tomorrow if not received       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Participant View - Conversation (Bidirectional)

```
┌─────────────────────────────────────────────────────────────┐
│ Conversation with Host                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Host                               2025-12-08 10:00 AM  │ │
│ │ Please submit payment proof by tomorrow                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────[ You ]────┐ │
│ │ You                                2025-12-08 11:00 AM  │ │
│ │ I will submit it by today evening. Thank you!           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ SEND A MESSAGE                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Write your message...                                   │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                        [Send Message]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Timeline

```
Phase 1: Database & Backend (Day 1-2)
├── Create migration file
├── Update schema.ts
├── Implement lib/comments functions
└── Add API routes

Phase 2: Frontend Components (Day 3-4)
├── Create ParticipantComments component
├── Create ParticipantCommentsView component
└── Add UI dependencies (if needed)

Phase 3: Integration (Day 5)
├── Integrate into host view
├── Integrate into participant view
└── Test end-to-end flows

Phase 4: Testing & Polish (Day 6-7)
├── Unit tests
├── Integration tests
├── UI/UX polish
└── Documentation updates
```

## File Structure

```
src/
├── db/
│   └── schema.ts ← Add participant_comments table
│
├── lib/
│   └── comments/
│       ├── README.md ← Quick reference
│       ├── PROPOSAL.md ← Full proposal
│       ├── ARCHITECTURE.md ← This file
│       └── index.ts ← Comment functions (to be created)
│
├── routes/
│   ├── api/
│   │   ├── participant/
│   │   │   └── $participantId.comments.ts ← Host API
│   │   └── drawings/
│   │       └── $drawingId/
│   │           └── p/
│   │               └── $participantId.comments.ts ← Participant API
│   │
│   └── drawings/
│       └── $drawingId/
│           ├── m.$participant.tsx ← Add ParticipantComments
│           └── p.$participateId.tsx ← Add ParticipantCommentsView
│
└── components/ (optional)
    └── ParticipantComments.tsx ← Reusable component
```
