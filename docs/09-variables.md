# Variables

Variables allow you to parameterize queries and mutations, making them reusable and more secure.

## Overview

Variables enable:
- Reusable queries
- Dynamic values
- Type safety
- Protection against injection attacks
- Better caching

## Variable Declaration

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
  }
}
```

## Variable Types

Variables must be typed:
- `$id: ID!` - Required ID
- `$name: String` - Optional String
- `$limit: Int = 10` - Int with default value
- `$filters: UserFilter!` - Input type

## Variable Usage in Queries

```graphql
query GetUser($userId: ID!, $includePosts: Boolean!) {
  user(id: $userId) {
    id
    name
    email
    posts @include(if: $includePosts) {
      id
      title
    }
  }
}
```

## Variable Usage in Mutations

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}
```

## Default Values

Variables can have default values:

```graphql
query GetUsers($limit: Int = 10, $offset: Int = 0) {
  users(limit: $limit, offset: $offset) {
    id
    name
  }
}
```

## Variable Best Practices

1. **Always type variables** - Use proper GraphQL types
2. **Use required types** - Mark required variables with `!`
3. **Provide defaults** - When appropriate
4. **Validate variables** - On the client side
5. **Use input types** - For complex inputs

## Code Example

See `examples/09-variables.js` for a complete implementation.

