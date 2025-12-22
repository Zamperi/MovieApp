## GET /api/groups/all
```mermaid
flowchart TD
    A[GET /api/groups/all] --> B[Query public groups]
    B --> C{Database<br>query<br>succeeded?}

    C -- No --> E500[500 Internal Server Error<br/>DB error]
    C -- Yes --> OK200[200 OK<br/>GroupsResponseDTO<br/>may be empty]
```

## Error Response Conventions
### 200 OK
Returned on success. Response body: GroupsResponseDTO (array; may be empty).

### 500 Internal Server Error
Returned when database operations fail.