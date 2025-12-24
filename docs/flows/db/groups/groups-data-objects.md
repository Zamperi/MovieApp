# Group Data Objects (Unified)

## Database Models

### Group
```ts
id: integer
name: string
ownerId: integer
isPublic: boolean
createdAt: DateTime
updatedAt: DateTime
deletedAt: DateTime | null
```

### GroupJoinRequest
```ts
id: integer
groupId: integer
userId: integer
status: "pending" | "approved" | "rejected"
createdAt: DateTime
decidedAt: DateTime | null
```

### GroupMember
```ts
groupId: integer
userId: integer
```

## API Request DTOs

### CreateGroupRequestDTO
```ts
groupName: string
isPublic: boolean
```

## API Response DTOs

### GroupDTO
```ts
groupId: integer
groupName: string
isPublic: boolean
createdAt: DateTime
```

### GroupWithMembersDTO
```ts
groupId: integer
groupName: string
isPublic: boolean
members: integer[]
createdAt: DateTime
```

### GroupListItemDTO
```ts
groupId: integer
groupName: string
```

### JoinRequestDTO
```ts
requestId: integer
groupId: integer
userId: integer
status: "pending" | "approved" | "rejected"
createdAt: DateTime
decidedAt?: DateTime
```

### LeaveGroupResponseDTO
```ts
groupId: integer
userId: integer
leftAt: DateTime
```

### DeleteGroupResponseDTO
```ts
groupId: integer
deletedAt: DateTime
```
