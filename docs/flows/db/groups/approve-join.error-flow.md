## POST /api/groups/{groupId}/join-requests/{requestId}/approve – Error Flow
```mermaid
flowchart TD
    A[POST<br/>/api/groups/:groupId/join-requests/:requestId/approve] --> B{Authenticated?}

    B -- No --> E401[401 Unauthorized<br/>No valid auth]
    B -- Yes --> C{Valid ids?}

    C -- No --> E400[400 Bad Request<br/>Invalid groupId or requestId]
    C -- Yes --> D{Group exists?}

    D -- No --> E404a[404 Not Found<br/>Group not found]
    D -- Yes --> E{Requester is owner?}

    E -- No --> E403[403 Forbidden<br/>Not group owner]
    E -- Yes --> F{Join request exists?}

    F -- No --> E404b[404 Not Found<br/>Join request not found]
    F -- Yes --> G{Request status is pending?}

    G -- No --> E409[409 Conflict<br/>Request not pending]
    G -- Yes --> H{Database operation succeeded?}

    H -- No --> E500[500 Internal Server Error<br/>DB failure]
    H -- Yes --> OK200[200 OK<br/>JoinRequestDTO]

```
## Error Conventions Response
### 400 Bad Request
Returned when groupId or requestId is invalid.

### 401 Unauthorized
Returned when the request is not authenticated.

### 403 Forbidden
Returned when the requester is not the group owner.

### 404 Not Found
Returned when the group or join request does not exist.

### 409 Conflict
Returned when the join request is not in pending state.

### 500 Internal Server Error
Returned when a database operation fails.

### 200 OK
Returned on success. Response body: JoinRequestDTO.