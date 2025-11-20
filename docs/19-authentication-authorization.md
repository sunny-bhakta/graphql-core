# Authentication & Authorization

Securing GraphQL APIs with authentication and authorization is crucial for protecting sensitive data and operations.

## Overview

- **Authentication**: Verifying who the user is
- **Authorization**: Determining what the user can do

## Authentication Strategies

### JWT Tokens
```javascript
// Extract token from header
const token = req.headers.authorization?.replace('Bearer ', '');
const user = verifyToken(token);
```

### Context-based Auth
```javascript
const context = async ({ req }) => {
  const token = extractToken(req);
  const user = await verifyUser(token);
  return { user };
};
```

## Authorization Patterns

### Field-level Authorization
```javascript
const resolvers = {
  User: {
    email: (user, _, context) => {
      if (context.user?.id !== user.id) {
        throw new Error('Unauthorized');
      }
      return user.email;
    },
  },
};
```

### Role-based Access Control (RBAC)
```javascript
const resolvers = {
  Query: {
    adminData: (_, __, context) => {
      if (context.user?.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }
      return getAdminData();
    },
  },
};
```

### Directive-based Authorization
```graphql
type Query {
  adminData: String @auth(requires: ADMIN)
  userData: String @auth(requires: USER)
}
```

## Code Example

See `examples/19-authentication-authorization.js` for a complete implementation.

