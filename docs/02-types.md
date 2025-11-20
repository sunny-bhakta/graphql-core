# Types

GraphQL has a strong type system that ensures data integrity and provides excellent developer experience.

## Overview

Types in GraphQL define the structure of data. Every field in a GraphQL schema has a type.

## Type Categories

### 1. Object Types
Custom types that represent entities in your API.

### 2. Scalar Types
Primitive types: `String`, `Int`, `Float`, `Boolean`, `ID`

### 3. List Types
Arrays of types: `[String]`, `[User]`

### 4. Non-Null Types
Required fields: `String!`, `[User!]!`

## Object Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  balance: Float
  isActive: Boolean!
  posts: [Post!]!
}
```

## Scalar Types

### Built-in Scalars

- **String**: UTF-8 character sequence
- **Int**: Signed 32-bit integer (-2^31 to 2^31-1)
- **Float**: Signed double-precision floating-point value
- **Boolean**: true or false
- **ID**: Unique identifier, serialized as String

### Custom Scalars

```graphql
scalar Date
scalar JSON
scalar Email
scalar URL

type User {
  createdAt: Date!
  metadata: JSON
  email: Email!
  website: URL
}
```

## List Types

```graphql
type Query {
  # List of strings (nullable list, nullable items)
  tags: [String]
  
  # List of strings (non-null list, nullable items)
  categories: [String]!
  
  # List of strings (nullable list, non-null items)
  requiredTags: [String!]
  
  # List of strings (non-null list, non-null items)
  requiredCategories: [String!]!
}
```

## Non-Null Types

```graphql
type User {
  id: ID!              # Required field
  name: String!        # Required field
  email: String        # Optional field (nullable)
  age: Int             # Optional field (nullable)
}
```

## Type Modifiers

- `Type` - Nullable
- `Type!` - Non-null
- `[Type]` - List (nullable)
- `[Type!]` - List of non-null items
- `[Type!]!` - Non-null list of non-null items
- `[Type]!` - Non-null list (items can be null)

## Code Example

See `examples/02-types.js` for a complete implementation.

