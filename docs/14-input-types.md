# Input Types

Input types are used for complex inputs in mutations and queries. They allow you to pass structured data as arguments.

## Overview

Input types enable:
- Complex mutation arguments
- Reusable input structures
- Type safety for inputs
- Better organization of arguments

## Basic Input Type Syntax

```graphql
input CreateUserInput {
  name: String!
  email: String!
  age: Int
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

## Nested Input Types

```graphql
input AddressInput {
  street: String!
  city: String!
  zipCode: String!
}

input CreateUserInput {
  name: String!
  email: String!
  address: AddressInput!
}
```

## Input Types with Default Values

```graphql
input CreatePostInput {
  title: String!
  content: String!
  published: Boolean = false
  tags: [String!] = []
}
```

## Input Types Best Practices

1. **Use descriptive names** - End with "Input" suffix
2. **Keep inputs focused** - Don't mix unrelated fields
3. **Use nested inputs** - For complex structures
4. **Provide defaults** - When appropriate
5. **Validate inputs** - In resolvers

## Code Example

See `examples/14-input-types.js` for a complete implementation.

