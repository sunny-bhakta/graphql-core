# Unions

Unions represent a value that can be one of several types. Unlike interfaces, union members don't need to share common fields.

## Overview

Unions allow you to:
- Return different types from the same field
- Create flexible search results
- Handle polymorphic data
- Build dynamic schemas

## Basic Union Syntax

```graphql
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}
```

## Querying Unions

Unions require inline fragments to query:

```graphql
query {
  search(query: "graphql") {
    ... on User {
      id
      name
      email
    }
    ... on Post {
      id
      title
      content
    }
    ... on Comment {
      id
      content
    }
  }
}
```

## Union vs Interface

- **Interface**: Types share common fields
- **Union**: Types may have completely different fields

## Union Best Practices

1. **Use type resolvers** - Implement `__resolveType` for unions
2. **Handle all cases** - Query all possible types in fragments
3. **Use descriptive names** - Make union names clear
4. **Document types** - Explain what each union member represents

## Code Example

See `examples/12-unions.js` for a complete implementation.

