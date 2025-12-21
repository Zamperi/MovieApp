# Login Data flow

```mermaid
sequenceDiagram
  participant UI as React UI
  participant API as Express Controller
  participant V as Validate body (email, password)
  participant DB as PostgreSQL
  participant AUTH as Auth/token logic

  UI->>API: POST /api/auth/login
  API->>V: parse body (email, password required)
  V-->>API: {email, password}

  API->>DB: SELECT user WHERE email = {email}
  DB-->>API: user (includes passwordHash)

  API->>AUTH: verify password against stored hash
  AUTH-->>API: valid

  API->>DB: REVOKE existing refresh tokens (userId)
  DB-->>API: ok

  API->>AUTH: issue access token + refresh token
  AUTH-->>API: tokens

  API-->>UI: 200 LoginResponse + Set-Cookie (access, refresh)
```

## Data objects

### UI Login (req.body)
 - email string
 - password string

### User (DB record)
  - id    integer
  - username    string
  - email       string
  - firstname   string
  - lastname    string
  - ownedGroups Group[]
  - groups      Group[]
  - refreshTokens RefreshToken[]
  - passwordHash   string

### Login response (JSON)
  - id    integer
  - username    string
  - email       string
  - firstname   string
  - lastname    string
  - ownedGroups Group[]
  - groups      Group[]
  - refreshTokens RefreshToken[]
  - passwordHash   string

### Auth cookies (Set-Cookie)
#### accessToken
 - type: opaque string / JWT
 - storage: httpOnly cookie
 - purpose: authenticated API requests
 - lifetime: short (minutes)

#### refreshToken
 - type: opaque string / JWT
 - storage: httpOnly cookie
 - purpose: access token renewal
 - lifetime: long (days / weeks)
 - server-side state: stored & revocable

### RefreshToken (DB record)
 - id: string | number
 - userId: number
 - revoked: boolean
 - createdAt: timestamp
 - expiresAt: timestamp 