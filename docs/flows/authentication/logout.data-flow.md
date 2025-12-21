## Logout Data Flow

```mermaid
sequenceDiagram
  participant UI as Client
  participant API as Express API
  participant DB as PostgreSQL

  UI->>API: POST /api/auth/logout
  API->>API: read refresh token from request
  API->>DB: revoke current refresh token
  DB-->>API: ok
  API-->>UI: 200 OK + Clear auth cookies
```

### Data object
#### refreshToken
 - type: opaque string / JWT
 - storage: httpOnly cookie
 - purpose: access token renewal
 - lifetime: long (days / weeks)
 - server-side state: stored & revocable