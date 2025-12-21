# Auth lifecycle
```mermaid
stateDiagram-v2
  [*] --> Anonymous
  Anonymous --> Authenticated: login
  Authenticated --> Anonymous: logout
```
