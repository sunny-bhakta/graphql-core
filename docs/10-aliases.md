# Aliases

Aliases allow you to rename the result of a field to anything you want. They're useful when you need to query the same field multiple times with different arguments.

## Overview

Aliases enable:
- Querying the same field multiple times
- Avoiding field name conflicts
- Organizing query results
- Better client-side data handling

## Basic Alias Syntax

```graphql
query {
  aliasName: fieldName {
    subField
  }
}
```

## Querying Same Field Multiple Times

```graphql
query {
  firstUser: user(id: "1") {
    name
    email
  }
  secondUser: user(id: "2") {
    name
    email
  }
}
```

## Aliases with Different Arguments

```graphql
query {
  publishedPosts: posts(published: true) {
    id
    title
  }
  draftPosts: posts(published: false) {
    id
    title
  }
}
```

## Aliases in Nested Queries

```graphql
query {
  user(id: "1") {
    id
    recentPosts: posts(limit: 5) {
      id
      title
    }
    popularPosts: posts(sortBy: "views", limit: 5) {
      id
      title
    }
  }
}
```

## Aliases Best Practices

1. **Use descriptive names** - Make aliases meaningful
2. **Avoid conflicts** - When querying same field multiple times
3. **Organize results** - Group related data with aliases
4. **Combine with variables** - Use aliases with variables for dynamic queries

## Code Example

See `examples/10-aliases.js` for a complete implementation.

