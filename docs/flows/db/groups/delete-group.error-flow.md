## DELETE /api/group/{groupId} - Error Flow
```mermaid
flowchart TD
    A[DELETE<br/>/api/group/:groupId] --> B{Valid groupId?}

    B -- No --> E400[400 Bad Request<br/>Invalid groupId]
    B -- Yes --> C{Authenticated?}

    C -- No --> E401[401 Unauthorized<br/>No valid auth]
    C -- Yes --> D{Is group owner?}

    D -- No --> E403[403 Forbidden<br/>Not group owner]
    D -- Yes --> E{Database<br>operation<br>succeeded?}

    E -- No --> E500[500 Internal Server Error<br/>DB failure]
    E -- Yes --> F{Group found?}

    F -- No --> E404[404 Not Found<br/>Group not found]
    F -- Yes --> OK200[200 OK<br/>Successful delete]
```

## Error Response Convention
### 400 Bad Request 
Invalid groupId

### 401 Unauthorized
No valid auth

### 403 Forbidden 
Requester is not the group owner

### 404 Not Found
Group does not exist (or is already deleted)

### 500 Internal Server Error
Database operation fails