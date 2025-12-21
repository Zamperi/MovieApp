# Overview

## System context
```mermaid
flowchart LR
  U[User / Browser] -->|HTTPS| FE[React SPA]
  FE -->|HTTPS REST| API[Express API]
  API --> DB[(PostgreSQL)]
  API --> TMDB[TMDB API]
```
