# Subscriptions

Subscriptions enable real-time updates in GraphQL. They allow clients to receive data updates as they happen, typically using WebSockets.

## Overview

Subscriptions are similar to queries, but instead of returning data once, they maintain an active connection and push updates to the client when events occur.

## Basic Subscription Syntax

```graphql
subscription {
  subscriptionName {
    field
  }
}
```

## Simple Subscription

```graphql
subscription {
  userCreated {
    id
    name
    email
  }
}
```

## Subscription with Filters

```graphql
subscription {
  postUpdated(postId: "1") {
    id
    title
    content
  }
}
```

## Multiple Subscriptions

```graphql
subscription {
  userCreated {
    id
    name
  }
  postUpdated {
    id
    title
  }
}
```

## Subscription Use Cases

1. **Real-time notifications** - Chat messages, alerts
2. **Live data updates** - Stock prices, sports scores
3. **Collaborative editing** - Multiple users editing the same document
4. **Activity feeds** - Social media updates
5. **Monitoring** - System metrics, logs

## Subscription Architecture

Subscriptions typically use:
- **WebSockets** - For bidirectional communication
- **Server-Sent Events (SSE)** - For one-way server-to-client updates
- **Pub/Sub systems** - Redis, RabbitMQ, etc.

## Code Example

See `examples/05-subscriptions.js` for a complete implementation.

