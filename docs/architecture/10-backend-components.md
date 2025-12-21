# Backend components
```mermaid
flowchart LR
  subgraph API[Express API]
    R[Routes]
    C[Controllers]
    S[Services]
    REPO[Repositories]
  end
  R --> C --> S --> REPO
```
