# Movie fetch – error flows

```mermaid
flowchart TD
  A[GET /api/movies/:tmdbId] --> B{Valid tmdbId?}
  B -- No --> E400[400 Bad Request\nVALIDATION_ERROR]

  B -- Yes --> C{Cache hit and fresh?}
  C -- Yes --> OK200[200 OK\nMovieResponseDTO]

  C -- No --> D[Call TMDB: GET /movie/:tmdbId]
  D --> F{TMDB response}
  F -- 404 --> E404[404 Not Found\nMOVIE_NOT_FOUND]
  F -- Timeout/5xx --> E502[502 Bad Gateway\nUPSTREAM_TMDB_ERROR]
  F -- 200 --> G[Validate TMDB payload]
  G --> H{Payload valid?}
  H -- No --> E502B[502 Bad Gateway\nUPSTREAM_SCHEMA_MISMATCH]
  H -- Yes --> I[UPSERT movie_cache]
  I --> J{DB ok?}
  J -- No --> E500[500 Internal Server Error\nDB_ERROR]
  J -- Yes --> OK200
```

## Error response conventions

All error responses follow the same structure:

- error: string (machine-readable)
- message: string (human-readable)
- details?: object (optional)

### 400 VALIDATION_ERROR
Returned when `tmdbId` is not a positive integer.

### 404 MOVIE_NOT_FOUND
Returned when TMDB responds with 404 for the given `tmdbId`.

### 502 UPSTREAM_TMDB_ERROR
Returned when TMDB is unavailable, times out, or returns 5xx.

### 502 UPSTREAM_SCHEMA_MISMATCH
Returned when TMDB returns 200 but the payload does not match `TmdbMovieRaw` schema.

### 500 DB_ERROR
Returned when database operations fail (select/upsert).