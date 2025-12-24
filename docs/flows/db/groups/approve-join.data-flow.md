## POST /api/groups/{groupId}/join-requests/{requestId}/approve – Data Flow
```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as Express API
    participant DB as PostgreSQL

    UI->>API: POST /api/groups/:groupId/join-requests/:requestId/approve (authenticated)
    API->>DB: Load group (ownerId)
    DB-->>API: Group row

    API->>DB: Load join request (status = pending)
    DB-->>API: GroupJoinRequest row

    API->>DB: Add user to group members
    DB-->>API: Membership created

    API->>DB: Update join request (status = approved, decidedAt = now)
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