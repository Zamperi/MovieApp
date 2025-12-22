## POST /api/groups/{groupId}/leave
```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as Express API
    participant DB as PostgreSQL

    UI->>API: POST /api/groups/:groupId/leave (authenticated)
    API->>DB: Load group (ownerId)
    DB-->>API: Group row

    API->>DB: Check membership (userId ∈ members)
    DB-->>API: Membership status

    API->>DB: Remove membership (userId removed from group members)
    DB-->>API: Membership removed

    API-->>UI: 200 OK LeaveGroupResponseDTO
```
## Data Objecst
### Path Params
```ts
groupId: integer
```
### Auth Context
```ts
auth.userId: integer
```
### Database Group Row (minimum relied-upon fields)
```ts
id: integer
ownerId: integer
deletedAt: timestamp | null
```
### LeaveGroupResponseDTO (200 OK)
```ts
groupId: integer
userId: integer
leftAt: timestamp
```