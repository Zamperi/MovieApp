## POST /api/groups – Error Flow
```mermaid
flowchart TD
    A[POST<br/>/api/groups] --> B{Authenticated?}

    B -- No --> E401[401 Unauthorized<br/>No valid auth]
    B -- Yes --> C{Valid request body?}

    C -- No --> E400[400 Bad Request<br/>Invalid request body]
    C -- Yes --> D{Database operation succeeded?}

    D -- No --> E500[500 Internal Server Error<br/>DB failure]
    D -- Yes --> OK201[201 Created<br/>CreateGroupResponseDTO]
```
## Error Response Conventions
### 400 Bad Request
Returned when the request body is invalid (e.g. missing or invalid name).

### 401 Unauthorized
Returned when the request is not authenticated.

### 201 Created
Returned on success. Response body: CreateGroupResponseDTO.

### 500 Internal Server Error
Returned when the database operation fails.