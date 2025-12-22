## GET /api/group/{groupId}

```mermaid
flowchart TD
    A[GET /api/group/:groupId] --> B{Valid groupId?}

    B -- No --> E400[400 Bad Request<br/>Invalid groupId]
    B -- Yes --> C[Query group by id]

    C --> D{Database operation succeeded?}
    D -- No --> E500[500 Internal Server Error<br/>DB error]
    D -- Yes --> E{Group found?}

    E -- No --> E404[404 Not Found<br/>Group not found]
    E -- Yes --> OK200[200 OK<br/>GroupResponseDTO]
```

## Error Response Conventions
### 400 BAD REQUEST
Returned when groupId is not a positive integer.

### 404 NOT FOUND
Returned when no group exists with the requested groupId.

### 500 INTERNAL SERVER ERROR
Returned when database operations fail.

### 200 OK
Returned on success. Response body: GroupResponseDTO.
