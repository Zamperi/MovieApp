## POST /api/groups/{groupId}/leave – Error Flow
```mermaid
flowchart TD
    A[POST<br/>/api/groups/:groupId/leave] --> B{Authenticated?}

    B -- No --> E401[401 Unauthorized<br/>No valid auth]
    B -- Yes --> C{Valid groupId?}

    C -- No --> E400[400 Bad Request<br/>Invalid groupId]
    C -- Yes --> D{Group exists?}

    D -- No --> E404[404 Not Found<br/>Group not found]
    D -- Yes --> E{Requester is owner?}

    E -- Yes --> E403[403 Forbidden<br/>Owner cannot leave group]
    E -- No --> F{Is member?}

    F -- No --> E409[409 Conflict<br/>Not a member]
    F -- Yes --> G{Database operation succeeded?}

    G -- No --> E500[500 Internal Server Error<br/>DB failure]
    G -- Yes --> OK200[200 OK<br/>LeaveGroupResponseDTO]
```
## Error Convention Responses
### 400 Bad Request
Returned when groupId is invalid.

### 401 Unauthorized
Returned when the request is not authenticated.

### 03 Forbidden
Returned when the requester is the group owner (owners cannot leave their own group).

### 404 Not Found
Returned when the group does not exist (or is deleted).

### 409 Conflict
Returned when the requester is not a member of the group.

### 500 Internal Server Error
Returned when a database operation fails.

### 200 OK
Returned on success. Response body: LeaveGroupResponseDTO.