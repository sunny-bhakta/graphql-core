# Directives

Directives provide a way to describe alternate runtime execution and type validation behavior in GraphQL.

## Overview

Directives can be used to modify the execution of queries, mutations, and subscriptions, or to provide metadata about types and fields.

## Built-in Directives

### @deprecated
Marks a field or enum value as deprecated.

```graphql
type User {
  name: String!
  oldName: String @deprecated(reason: "Use name instead")
}
```

### @skip
Conditionally skip a field if the condition is true.

```graphql
query {
  user {
    name
    email @skip(if: $hideEmail)
  }
}
```

### @include
Conditionally include a field if the condition is true.

```graphql
query {
  user {
    name
    email @include(if: $showEmail)
  }
}
```

## Custom Directives

You can create custom directives for various purposes:

### Schema Directives
- `@upper` - Transform string to uppercase
- `@lower` - Transform string to lowercase
- `@formatDate` - Format date fields
- `@auth` - Authentication/authorization
- `@rateLimit` - Rate limiting
- `@cache` - Caching directives

### Example Custom Directives

```graphql
directive @upper on FIELD_DEFINITION
directive @auth(requires: Role = USER) on FIELD_DEFINITION | OBJECT
directive @cache(maxAge: Int) on FIELD_DEFINITION
```

## Directive Locations

Directives can be applied to:
- `QUERY` - Query operations
- `MUTATION` - Mutation operations
- `SUBSCRIPTION` - Subscription operations
- `FIELD` - Fields
- `FRAGMENT_DEFINITION` - Fragment definitions
- `FRAGMENT_SPREAD` - Fragment spreads
- `INLINE_FRAGMENT` - Inline fragments
- `SCHEMA` - Schema definitions
- `SCALAR` - Scalar types
- `OBJECT` - Object types
- `FIELD_DEFINITION` - Field definitions
- `ARGUMENT_DEFINITION` - Argument definitions
- `INTERFACE` - Interface types
- `UNION` - Union types
- `ENUM` - Enum types
- `ENUM_VALUE` - Enum values
- `INPUT_OBJECT` - Input object types
- `INPUT_FIELD_DEFINITION` - Input field definitions

## Code Example

See `examples/07-directives.js` for a complete implementation.

