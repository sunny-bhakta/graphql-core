# Scalar Types

Scalar types represent primitive values in GraphQL. GraphQL provides built-in scalars, and you can define custom scalars for specific use cases.

## Overview

Scalars are:
- Leaf values in queries
- Cannot have sub-fields
- Can be validated and transformed
- Used for primitive data types

## Built-in Scalars

### String
UTF-8 character sequence

```graphql
type User {
  name: String!
  email: String!
}
```

### Int
Signed 32-bit integer (-2^31 to 2^31-1)

```graphql
type Post {
  views: Int!
  likes: Int
}
```

### Float
Signed double-precision floating-point value

```graphql
type Product {
  price: Float!
  rating: Float
}
```

### Boolean
true or false

```graphql
type Post {
  published: Boolean!
  featured: Boolean
}
```

### ID
Unique identifier, serialized as String

```graphql
type User {
  id: ID!
}
```

## Custom Scalars

You can define custom scalars for specific needs:

```graphql
scalar Date
scalar JSON
scalar Email
scalar URL
scalar Upload
```

## Custom Scalar Implementation

Custom scalars require:
- Serialization (output)
- Value parsing (input)
- Literal parsing (query)

## Code Example

See `examples/15-scalar-types.js` for a complete implementation.

