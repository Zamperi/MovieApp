## POST /api/groups/{groupId}/join-requests/{requestId}/decline – Data Flow
```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as Express API
    participant DB as PostgreSQL

    UI->>API: POST /api/groups/:groupId/join-requests/:requestId/decline (authenticated)
    API->>DB: Load group (ownerId)
    DB-->>API: Group row

    API->>DB: Load join request (status = pending)
    DB-->>API: GroupJoinRequest row

    API->>DB: Update join request (status = rejected, decidedAt = now)
    DB-->>API: Updated join request row

    API-->>UI: 200 OK JoinRequestDTO
```
## Path details
### Path Params
```ts
groupId: integer
requestId: integer
```
### Auth Context
```ts
auth.userId: integer
Authenticated requester id.
```