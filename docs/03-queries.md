# Queries

Queries are read operations that fetch data from the server. They are the primary way to retrieve data in GraphQL.

## Overview

Queries allow clients to request exactly the data they need. Unlike REST APIs, GraphQL queries can fetch multiple resources in a single request.

## Basic Query Syntax

```graphql
query {
  fieldName
}
```

## Simple Query

```graphql
query {
  users {
    id
    name
    email
  }
}
```

## Query with Arguments

```graphql
query {
  user(id: "1") {
    id
    name
    email
  }
}
```

## Nested Queries

```graphql
query {
  user(id: "1") {
    id
    name
    posts {
      id
      title
      content
    }
  }
}
```

## Multiple Queries

```graphql
query {
  users {
    id
    name
  }
  posts {
    id
    title
  }
}
```

## Query with Variables

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
  }
}
```

Variables:
```json
{
  "userId": "1"
}
```

## Query with Aliases

```graphql
query {
  firstUser: user(id: "1") {
    name
  }
  secondUser: user(id: "2") {
    name
  }
}
```

## Query with Fragments

```graphql
query {
  user(id: "1") {
    ...UserFields
    posts {
      ...PostFields
    }
  }
}

fragment UserFields on User {
  id
  name
  email
}

fragment PostFields on Post {
  id
  title
  content
}
```

## Query Best Practices

1. **Request only needed fields** - Don't over-fetch data
2. **Use variables** - Make queries reusable and secure
3. **Use fragments** - Reuse common field selections
4. **Use aliases** - When querying the same field multiple times
5. **Handle errors** - Always include error handling in your queries

## Code Example

See `examples/03-queries.js` for a complete implementation.

