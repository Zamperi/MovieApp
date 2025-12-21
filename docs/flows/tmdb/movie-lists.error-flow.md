# Movie Lists – Error Flows

```mermaid
flowchart TD
  A[GET /api/movies/:listType?page=n] --> B{Valid params?}
  B -- No --> E400[400 Bad Request\nVALIDATION_ERROR]

  B -- Yes --> C[SELECT movie_list_cache]
  C --> D{DB ok?}
  D -- No --> E500[500 Internal Server Error\nDB_ERROR]

  D -- Yes --> F{Cache hit and fresh?}
  F -- Yes --> OK200[200 OK\nMovieListResponseDTO]

  F -- No --> G[Call TMDB: GET /movie/:listType?page=n]
  G --> H{TMDB response}
  H -- Timeout / 5xx --> E502[502 Bad Gateway\nUPSTREAM_TMDB_ERROR]
  H -- 4xx (401/403) --> E502A[502 Bad Gateway\nUPSTREAM_TMDB_ERROR]
  H -- 200 --> I[Validate TMDB payload]
  I --> J{Payload valid?}
  J -- No --> E502B[502 Bad Gateway\nUPSTREAM_SCHEMA_MISMATCH]
  J -- Yes --> K[UPSERT movie_list_cache]
  K --> L{DB ok?}
  L -- No --> E500B[500 Internal Server Error\nDB_ERROR]
  L -- Yes --> OK200
```

## Error Response Convention

All error responses share the same structure:

- error: string (machine-readable)
- message: string (human-readable)
- details?: object (optional)

### 400 VALIDATION_ERROR
Returned when `listType` is unsupported or `page` is not an integer >= 1.

### 502 UPSTREAM_TMDB_ERROR
Returned when TMDB is unavailable, times out, or responds with non-200 status (including 401/403/5xx).

### 502 UPSTREAM_SCHEMA_MISMATCH
Returned when TMDB responds with 200 but payload does not match `TmdbMovieListRaw`.

### 500 DB_ERROR
Returned when database operations fail (select or upsert).
