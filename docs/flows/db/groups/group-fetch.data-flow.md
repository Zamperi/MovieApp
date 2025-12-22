## ## GET /api/groups/{groupId} – Data Flow

```mermaid
sequenceDiagram
participant UI as React UI
participant API as Express API
participant DB as PostgreSQL

UI ->> API: GET /api/groups/{groupId}
API ->> DB: Fetch group by id
DB -->> API: Group row
API -->> UI: 200 OK<br>Group Response DTO
```

### Data Objects

#### Database Row
```ts
- id: integer
- name: string
- ownerId: integer
- members: integer[]
- public: boolean
- createdAt: timestamp
- updatedAt: timestamp
- deletedAt: timestamp | null
```

#### Group Response DTO
```ts
- groupId: integer
- groupName: string
- members: integer[]
- createdAt: timestamp
```