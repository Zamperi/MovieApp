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
## Data Objects
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
### GroupJoinRequest (Database Row)
```ts
id: integer
groupId: integer
userId: integer
status: "pending" | "approved" | "rejected"
createdAt: timestamp
decidedAt: timestamp | null
```
### Membership (on approve)

User from join request is added to group members<br>
Membership creation and request update are treated as one logical operation

### JoinRequestDTO (200 OK)
```ts
requestId: integer
groupId: integer
userId: integer
status: "approved"
createdAt: timestamp
decidedAt: timestamp
```