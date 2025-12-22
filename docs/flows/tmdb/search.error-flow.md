# Search – error flows

```mermaid
flowchart TD
  A[GET /api/search with q] --> B{q present and non-empty}
  B -- No --> E400[400 Bad Request<br/>Missing query]

  B -- Yes --> C[Parse query tokens and<br>power syntax]
  C --> D[Ensure genre list is fresh]
  D --> F{TMDB available}
  F -- No --> E500a[500 Internal Server Error<br/>Search failed]

  F -- Yes --> G[Decide intents max 4]
  G --> H[Execute intent searches]
  H --> I{All searches succeeded}
  I -- No --> E500b[500 Internal Server Error<br/>Search failed]

  I -- Yes --> J[Merge deduplicate<br> and rank]
  J --> K[Build facets]
  K --> OK200[200 OK<br/>SearchResponseDTO]
```

## Status codes & responses

### 200 OK
Returned on success.

Response body: `SearchResponseDTO`

### 400 Bad Request
Returned when `q` is missing or trims to an empty string.

Response body (current implementation):
- `"Missing query"` (JSON string)

### 500 Internal Server Error
Returned when any unexpected error occurs during processing, including upstream TMDB failures.

Response body (current implementation):
- `"Error with searching information"` (JSON string)
