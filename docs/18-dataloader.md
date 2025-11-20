# DataLoader Pattern

DataLoader solves the N+1 query problem by batching and caching requests. It's essential for optimizing GraphQL performance.

## Overview

The N+1 problem occurs when:
1. You fetch a list of items (1 query)
2. For each item, you fetch related data (N queries)

DataLoader solves this by:
- **Batching**: Combining multiple requests into one
- **Caching**: Storing results for the request lifecycle
- **Deduplication**: Removing duplicate requests

## The N+1 Problem

Without DataLoader:
```javascript
// Query: Get users
users.forEach(user => {
  // Query: Get posts for each user (N queries!)
  user.posts = getPostsByUserId(user.id);
});
```

## DataLoader Solution

```javascript
const userLoader = new DataLoader(async (userIds) => {
  const users = await getUsersByIds(userIds);
  return userIds.map(id => users.find(u => u.id === id));
});
```

## Basic DataLoader Usage

```javascript
const batchUsers = async (userIds) => {
  const users = await db.users.findByIds(userIds);
  return userIds.map(id => users.find(u => u.id === id));
};

const userLoader = new DataLoader(batchUsers);

// In resolver
const user = await userLoader.load(userId);
```

## DataLoader Features

1. **Batching**: Automatically batches requests
2. **Caching**: Caches results per request
3. **Deduplication**: Removes duplicate keys
4. **Error Handling**: Handles errors gracefully

## Code Example

See `examples/18-dataloader.js` for a complete implementation.

