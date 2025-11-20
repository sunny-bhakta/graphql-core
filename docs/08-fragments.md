# Fragments

Fragments are reusable sets of fields that can be included in queries, mutations, and subscriptions.

## Overview

Fragments help you:
- Reuse common field selections
- Organize complex queries
- Maintain consistency across queries
- Reduce duplication

## Basic Fragment Syntax

```graphql
fragment FragmentName on Type {
  field1
  field2
  nestedField {
    subField
  }
}
```

## Using Fragments

```graphql
query {
  user(id: "1") {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  name
  email
}
```

## Inline Fragments

Inline fragments are used with unions and interfaces:

```graphql
query {
  searchResult {
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
  }
}
```

## Fragment Composition

Fragments can include other fragments:

```graphql
fragment UserWithPosts on User {
  ...UserFields
  posts {
    ...PostFields
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

## Fragment Best Practices

1. **Name fragments clearly** - Use descriptive names
2. **Keep fragments focused** - Don't make fragments too large
3. **Use inline fragments** - For unions and interfaces
4. **Compose fragments** - Build complex fragments from simple ones
5. **Document fragments** - Add comments for complex fragments

## Code Example

See `examples/08-fragments.js` for a complete implementation.

