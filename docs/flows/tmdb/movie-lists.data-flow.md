# Movie Lists – Paginated Data Flow (Endless Scrolling)

```mermaid
sequenceDiagram
  participant UI as React UI (Endless scroll)
  participant API as Express Controller
  participant V1 as Zod: validate params
  participant DB as PostgreSQL
  participant TMDB as TMDB API
  participant V2 as Zod: validate TMDB payload

  Note over UI: UI keeps state: listType, currentPage, totalPages\nand loads more when scroll nears the end.
  UI->>API: GET /api/movies/{listType}?page=N
  API->>V1: parse listType (enum) + page (int, >=1)
  V1-->>API: { listType, page }

  API->>DB: SELECT movie_list_cache WHERE list_type=listType AND page=page
  alt cache hit (fresh)
    DB-->>API: cached row (payload_json)
    API-->>UI: 200 MovieListResponseDTO (page + totalPages)
  else cache miss / stale
    DB-->>API: none / stale row
    API->>TMDB: GET /movie/{listType}?page=page
    TMDB-->>API: raw JSON
    API->>V2: parse & validate TmdbMovieListRaw
    V2-->>API: TmdbMovieListRaw (trusted)
    API->>DB: UPSERT movie_list_cache (list_type, page, payload_json, updated_at)
    DB-->>API: row
    API-->>UI: 200 MovieListResponseDTO (page + totalPages)
  end

  Note over UI: Endless scroll logic:\n- Append results to existing list\n- If page < totalPages => next page = N+1\n- Otherwise stop (hasMore = false)
```

## Frontend Contract
```ts
- UI always requests `page=N` (starting from 1)
- `hasMore = page < totalPages`
- Next request uses `page + 1`
- Results are appended to the existing list
```
## DTO Requirements

### ListParams
```ts
- listType: "popular" | "top_rated" | "now_playing" | "upcoming"
- page: number (int, >=1)
```

### MovieListResponseDTO
```ts
- listType: string
- page: number
- results: MovieListItemDTO[]
- totalPages: number
- totalResults: number
```

## Cache
```ts
- Unique key: (list_type, page)
- payload_json contains one fully normalized page response
```