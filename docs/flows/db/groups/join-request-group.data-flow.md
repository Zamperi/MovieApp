## POST /api/groups/{groupId}/join-requests – Data Flow
```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as Express API
    participant DB as PostgreSQL

    UI->>API: POST /api/groups/:groupId/join-requests (authenticated)
    API->>DB: Load group (public, ownerId)
    DB-->>API: Group row

    API->>DB: Check membership (userId ∈ members)
    DB-->>API: Membership status

    API->>DB: Check existing join request (status = pending)
    DB-->>API: Join request status

    API->>DB: Create GroupJoinRequest (status = pending)
    DB-->>API: Created join request row

    API-->>UI: 201 Created JoinRequestDTO
```

## Data Objects
### Path Params
groupId: integer 

### Auth Context
```ts
auth.userId: integer
```
Authenticated requester id.

### GroupJoinRequest (Database Row)
```ts
id: integer
groupId: integer
userId: integer
status: "pending" | "approved" | "rejected"
createdAt: timestamp
decidedAt: timestamp | null
```
### JoinRequestDTO (201 Created)
```ts
requestId: integer
groupId: integer
userId: integer
status: "pending"
createdAt: timestamp
```