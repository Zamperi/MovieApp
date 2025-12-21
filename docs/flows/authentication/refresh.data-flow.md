## Refresh Data Flow

```mermaid
sequenceDiagram
  participant UI as React UI
  participant API as Express API
  participant DB as PostgreSQL

  UI->>API: POST /api/users/refresh (RefreshRequest)
  API->>DB: rotate refresh token (revoke used token + issue new token)
  DB-->>API: new refresh token issued
  API-->>UI: 200 OK (RefreshResponse) + Set-Cookie (access, refresh)
```

### Data Objects
#### RefreshRequest
 - refreshToken: string (via httpOnly cookie)

##### RefreshResponse (200)
 - ok: boolean

#### Auth cookies (Set-Cookie)
 - accessToken: httpOnly cookie
 - refreshToken: httpOnly cookie (rotated)