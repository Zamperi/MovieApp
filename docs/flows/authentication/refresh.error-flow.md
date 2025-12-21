## Refresh Error Flow

```mermaid
flowchart TD
  A[POST /api/users/refresh] --> B{RefreshRequest present?<br/>refreshToken cookie}

  B -- No --> E401A[401 Unauthorized<br/>Missing refresh token]

  B -- Yes --> C{Refresh token valid & active?}
  C -- No --> E401B[401 Unauthorized<br/>Invalid refresh token]

  C -- Yes --> S200[200 OK<br/>Set auth cookies<br/>returns ok=true]

  A -. exception .-> E500[500 Internal Server Error]

````