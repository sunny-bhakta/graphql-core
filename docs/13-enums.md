# Enums

Enums represent a set of predefined values. They provide type safety and make your schema more self-documenting.

## Overview

Enums allow you to:
- Define a fixed set of values
- Ensure type safety
- Make schemas self-documenting
- Improve API clarity

## Basic Enum Syntax

```graphql
enum Role {
  USER
  ADMIN
  MODERATOR
}

type User {
  id: ID!
  name: String!
  role: Role!
}
```

## Enum with Deprecated Values

```graphql
enum Status {
  ACTIVE
  INACTIVE
  PENDING @deprecated(reason: "Use ACTIVE instead")
}
```

## Enum in Queries

```graphql
query {
  users(role: ADMIN) {
    id
    name
    role
  }
}
```

## Enum in Mutations

```graphql
mutation {
  createUser(input: {
    name: "John"
    email: "john@example.com"
    role: USER
  }) {
    id
    role
  }
}
```

## Enum Best Practices

1. **Use descriptive names** - Make enum values clear
2. **Use UPPER_CASE** - Follow GraphQL conventions
3. **Document enums** - Add descriptions when needed
4. **Deprecate carefully** - Use @deprecated for old values
5. **Keep enums focused** - Don't mix unrelated values

## Code Example

See `examples/13-enums.js` for a complete implementation.

