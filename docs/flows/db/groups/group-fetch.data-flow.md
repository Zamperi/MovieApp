## GET /api/groups/{groupId} – Data Flow

```mermaid
sequenceDiagram
  participant UI as React UI
  participant API as Express API
  participant DB as PostgreSQL

  UI->>API: GET /api/groups/:groupId
  API->>DB: Query group aggregate (group row + member userIds)
  DB-->>API: Group aggregate
  API->>API: Map to GroupResponseDTO
  API-->>UI: 200 OK<br/>GroupResponseDTO
```

### Data Objects

#### Database Group Row
```ts
- id: integer
- name: string
- ownerId: integer
- public: boolean
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime | null
```

#### GroupMembers (many-to-many)
```ts
- groupId: integer
- userId: integer
```

#### Group Response DTO
```ts
- groupId: integer
- groupName: string
- public: boolean
- members: integer[]
- createdAt: timestamp
```