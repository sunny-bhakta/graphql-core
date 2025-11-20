# Resolvers

Resolvers are functions that resolve the value for a field in your GraphQL schema. They define how to fetch or compute the data for each field.

## Overview

Resolvers are the bridge between your GraphQL schema and your data sources. They determine how each field in your schema is populated.

## Resolver Function Signature

```javascript
fieldName: (parent, args, context, info) => {
  // Return the value for this field
}
```

## Resolver Parameters

1. **parent** (root/obj) - The result from the parent resolver
2. **args** - Arguments provided to the field
3. **context** - Shared context across all resolvers
4. **info** - Information about the execution state

## Basic Resolver

```javascript
const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
    user: (parent, args) => {
      return getUserById(args.id);
    },
  },
};
```

## Field Resolvers

```javascript
const resolvers = {
  User: {
    fullName: (user) => `${user.firstName} ${user.lastName}`,
    posts: (user) => getPostsByUserId(user.id),
  },
};
```

## Resolver with Arguments

```javascript
const resolvers = {
  Query: {
    posts: (parent, args) => {
      const { limit, offset } = args;
      return getPosts(limit, offset);
    },
  },
};
```

## Resolver with Context

```javascript
const resolvers = {
  Query: {
    currentUser: (parent, args, context) => {
      return context.user;
    },
  },
};
```

## Default Resolvers

GraphQL provides default resolvers that:
- Return the property from the parent object if it exists
- Pass through the value if it matches the field name

## Resolver Chains

Resolvers can chain together:
```javascript
Query.user → User.posts → Post.author → User.name
```

## Async Resolvers

Resolvers can be async:
```javascript
const resolvers = {
  Query: {
    user: async (parent, args) => {
      return await fetchUser(args.id);
    },
  },
};
```

## Resolver Best Practices

1. **Keep resolvers thin** - Move business logic to services
2. **Handle errors** - Throw meaningful errors
3. **Use async/await** - For database calls
4. **Leverage context** - Share data across resolvers
5. **Avoid N+1 queries** - Use DataLoader for batching

## Code Example

See `examples/06-resolvers.js` for a complete implementation.

