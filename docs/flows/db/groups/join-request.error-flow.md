## POST /api/groups/{groupId}/join-requests – Error Flow
```mermaid
flowchart TD
    A[POST<br/>/api/groups/:groupId/join-requests] --> B{Authenticated?}

    B -- No --> E401[401 Unauthorized<br/>No valid auth]
    B -- Yes --> C{Valid groupId?}

    C -- No --> E400[400 Bad Request<br/>Invalid groupId]
    C -- Yes --> D{Group exists?}

    D -- No --> E404[404 Not Found<br/>Group not found]
    D -- Yes --> E{Group is public?}

    E -- No --> E403a[403 Forbidden<br/>Group is not public]
    E -- Yes --> F{Requester is owner?}

    F -- Yes --> E403b[403 Forbidden<br/>Owner cannot request to join]
    F -- No --> G{Already a member?}

    G -- Yes --> E409a[409 Conflict<br/>Already a member]
    G -- No --> H{Pending request exists?}

    H -- Yes --> E409b[409 Conflict<br/>Join request already pending]
    H -- No --> I{Database operation succeeded?}

    I -- No --> E500[500 Internal Server Error<br/>DB failure]
    I -- Yes --> OK201[201 Created<br/>JoinRequestDTO]
```

## Error Conventions Response
### 400 Bad Request
Returned when groupId is invalid.

### 401 Unauthorized
Returned when the request is not authenticated.

### 403 Forbidden
Returned when:<br>
the group is not public, or<br>
the requester is the group owner.<br>

### 404 Not Found
Returned when the group does not exist.<br>

### 409 Conflict
Returned when:<br>
the requester is already a group member, or<br>
a pending join request already exists.<br>

### 500 Internal Server Error
Returned when a database operation fails.<br>

### 201 Created
Returned on success. Response body: JoinRequestDTO.<br>