# Interfaces

Interfaces define a contract that types must implement. They're useful for creating polymorphic types and ensuring consistency.

## Overview

Interfaces allow you to:
- Define common fields across multiple types
- Create polymorphic queries
- Ensure type consistency
- Build flexible schemas

## Basic Interface Syntax

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
  email: String!
}

type Post implements Node {
  id: ID!
  title: String!
  content: String!
}
```

## Interface with Multiple Fields

```graphql
interface Timestamped {
  createdAt: String!
  updatedAt: String!
}

type User implements Timestamped {
  id: ID!
  name: String!
  createdAt: String!
  updatedAt: String!
}
```

## Multiple Interfaces

A type can implement multiple interfaces:

```graphql
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: String!
}

type User implements Node & Timestamped {
  id: ID!
  name: String!
  createdAt: String!
}
```

## Querying Interfaces

Use inline fragments to query interface fields:

```graphql
query {
  nodes {
    id
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
  }
}
```

## Code Example

See `examples/11-interfaces.js` for a complete implementation.

