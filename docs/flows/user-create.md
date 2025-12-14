# User creation – data flow

```mermaid
sequenceDiagram
  participant UI as React UI
  participant API as Express Controller
  participant Z as Zod Validation
  participant S as UserService
  participant R as UserRepository
  participant DB as PostgreSQL

  UI->>API: POST /api/users (raw JSON)
  API->>Z: validate UserCreateRequest
  Z-->>API: UserCreateDTO (normalized)
  API->>S: createUser(dto)
  S->>R: insertUser(entity)
  R->>DB: INSERT users
  DB-->>R: row
  R-->>S: UserEntity
  S-->>API: UserResponseDTO
  API-->>UI: 201 Created (JSON)
```

## Data objects

### UserCreateRequest (raw input)
- email: string
- password: string
- username: string

### UserCreateDTO (validated)
- email: Email
- passwordHash: string
- username: Username

### UserEntity (domain)
- id: UserId
- email: Email
- username: Username
- createdAt: Date

### UserResponseDTO
- id: number
- email: string
- username: string
