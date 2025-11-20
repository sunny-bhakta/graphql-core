# Pagination

Pagination allows fetching data in chunks, which is essential for large datasets and better performance.

## Overview

Pagination patterns in GraphQL:
- **Offset-based**: Use limit and offset
- **Cursor-based**: Use cursors for stable pagination
- **Relay-style**: Connection pattern with edges and nodes
- **Page-based**: Traditional page numbers

## Offset-based Pagination

```graphql
type Query {
  users(limit: Int, offset: Int): [User!]!
}

query {
  users(limit: 10, offset: 0) {
    id
    name
  }
}
```

## Cursor-based Pagination

```graphql
type Query {
  users(first: Int, after: String): UserConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  cursor: String!
  node: User!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

## Relay Connection Pattern

The Relay connection pattern is a standardized way to handle pagination:
- Uses `edges` and `nodes`
- Provides `pageInfo` for navigation
- Uses cursors for stable pagination

## Code Example

See `examples/16-pagination.js` for a complete implementation.

