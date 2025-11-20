# Error Handling

GraphQL provides structured error handling that allows for partial results and detailed error information.

## Overview

GraphQL error handling:
- Returns errors in a standardized format
- Supports partial results (some fields succeed, others fail)
- Provides detailed error information
- Allows custom error types

## Error Format

```json
{
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "USER_NOT_FOUND",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "data": {
    "user": null
  }
}
```

## Throwing Errors

```javascript
const resolvers = {
  Query: {
    user: (_, { id }) => {
      const user = findUser(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
  },
};
```

## Custom Error Classes

```javascript
class UserNotFoundError extends Error {
  constructor(userId) {
    super(`User ${userId} not found`);
    this.extensions = {
      code: 'USER_NOT_FOUND',
      userId,
    };
  }
}
```

## Field-level Errors

GraphQL can return partial results:

```graphql
query {
  user {
    id
    name
    posts {  # This might fail
      id
      title
    }
  }
}
```

## Error Extensions

Add custom error metadata:

```javascript
throw new GraphQLError('User not found', {
  extensions: {
    code: 'USER_NOT_FOUND',
    timestamp: new Date().toISOString(),
  },
});
```

## Code Example

See `examples/17-error-handling.js` for a complete implementation.

