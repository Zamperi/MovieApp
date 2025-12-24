## DELETE /api/group/{groupId}

```mermaid
sequenceDiagram
  participant UI as React UI
  participant API as Express API
  participant DB as PostgreSQL

  UI->>API: DELETE /api/group/:groupId (authenticated)
  API->>DB: Load group (ownerId)
  DB-->>API: Group row

  API->>API: Authorize: requester is owner
  API->>DB: Mark group deleted (set deletedAt)
  DB-->>API: Updated group row

  API-->>UI: 200 OK (DeletionResultDTO or GroupDTO)
```

## Path details
### Path Params
```ts
- groupId: integer (Positive integer)
```
### Auth Context
```ts
auth.userId: integer
Authenticated requester id (from token/session).
```