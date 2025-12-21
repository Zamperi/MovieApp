# People fetch – trending – error flows

```mermaid
flowchart TD
  A[GET /api/people/trending] --> C{Cache hit and fresh?}
  C -- Yes --> OK200[200 OK\nTrendingPeopleResponseDTO]

  C -- No --> D[Call TMDB: GET /trending/person/day]
  D --> F{TMDB response}
  F -- Timeout/5xx --> E502[502 Bad Gateway\nUPSTREAM_TMDB_ERROR]
  F -- 200 --> G[Validate TMDB payload]
  G --> H{Payload valid?}
  H -- No --> E502B[502 Bad Gateway\nUPSTREAM_SCHEMA_MISMATCH]
  H -- Yes --> I[UPSERT trending_people_cache]
  I --> J{DB ok?}
  J -- No --> E500[500 Internal Server Error\nDB_ERROR]
  J -- Yes --> OK200
```

## Error response conventions

All error responses follow the same structure:

- error: string (machine-readable)
- message: string (human-readable)
- details?: object (optional)

### 502 UPSTREAM_TMDB_ERROR
Returned when TMDB is unavailable, times out, or returns 5xx.

### 502 UPSTREAM_SCHEMA_MISMATCH
Returned when TMDB returns 200 but the payload does not match `TmdbTrendingPeopleRaw` schema.

### 500 DB_ERROR
Returned when database operations fail (select/upsert).
