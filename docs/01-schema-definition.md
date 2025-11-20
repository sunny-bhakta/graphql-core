# Schema Definition

The GraphQL schema is the foundation of your API. It defines all available types, queries, mutations, and subscriptions.

## Overview

A GraphQL schema is written in Schema Definition Language (SDL) and describes:
- What data can be queried
- What data can be mutated
- What real-time subscriptions are available
- The structure of all types

## Basic Schema Structure

```graphql
type Query {
  # Query fields go here
}

type Mutation {
  # Mutation fields go here
}

type Subscription {
  # Subscription fields go here
}
```

## Example Schema

```graphql
# Schema Definition
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  user(id: ID!): User
  users: [User!]!
  posts: [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

type Subscription {
  userCreated: User!
  postUpdated: Post!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  published: Boolean!
  createdAt: String!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

input UpdateUserInput {
  name: String
  email: String
}
```

## Code Example

See `examples/01-schema-definition.js` for a complete implementation.

