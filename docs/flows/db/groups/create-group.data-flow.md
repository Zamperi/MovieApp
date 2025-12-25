## POST /api/groups – Create Group Data Flow
```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as Express API
    participant DB as PostgreSQL

    UI->>API: POST /api/groups (authenticated)
    API->>DB: Create Group (ownerId = auth.userId, deletedAt = null)
    DB-->>API: Created group row
    API->>DB: Create membership (add owner as first member)
    DB-->>API: Membership created
    API-->>UI: 201 Created GroupDTO
```
## Path details
### Auth Context
```ts
auth.userId: integer
Authenticated requester id (from token/session)
```

### Membership (implicit on create)

Owner is automatically added as the first member
No other members are added during create
