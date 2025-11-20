# Mutations

Mutations are write operations that modify data on the server. They are used for creating, updating, and deleting data.

## Overview

While queries are for reading data, mutations are for writing data. Mutations follow the same syntax as queries but semantically indicate that data will be changed.

## Basic Mutation Syntax

```graphql
mutation {
  mutationName(input: InputType!) {
    returnType
  }
}
```

## Create Mutation

```graphql
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
    password: "secret123"
  }) {
    id
    name
    email
  }
}
```

## Update Mutation

```graphql
mutation {
  updateUser(id: "1", input: {
    name: "Jane Doe"
    email: "jane@example.com"
  }) {
    id
    name
    email
  }
}
```

## Delete Mutation

```graphql
mutation {
  deleteUser(id: "1") {
    success
    message
  }
}
```

## Mutation with Variables

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}
```

Variables:
```json
{
  "input": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }
}
```

## Multiple Mutations

```graphql
mutation {
  createUser(input: { name: "John", email: "john@example.com" }) {
    id
  }
  createPost(input: { title: "New Post", content: "Content" }) {
    id
  }
}
```

## Mutation Best Practices

1. **Use Input Types** - Group related mutation arguments
2. **Return Updated Data** - Return the created/updated object
3. **Handle Errors** - Provide meaningful error messages
4. **Idempotency** - Design mutations to be idempotent when possible
5. **Validation** - Validate input data before processing
6. **Atomicity** - Ensure mutations are atomic (all or nothing)

## Mutation Response Pattern

```graphql
type Mutation {
  createUser(input: CreateUserInput!): UserPayload!
}

type UserPayload {
  success: Boolean!
  message: String
  user: User
  errors: [Error!]
}
```

## Code Example

See `examples/04-mutations.js` for a complete implementation.

