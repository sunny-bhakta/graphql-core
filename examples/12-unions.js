const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema with Unions
const typeDefs = gql`
  type Query {
    search(query: String!): [SearchResult!]!
    content: [Content!]!
    notifications: [Notification!]!
  }

  # Union Types
  union SearchResult = User | Post | Comment | Tag
  union Content = Post | Article | Video
  union Notification = UserNotification | PostNotification | SystemNotification

  # Types
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
  }

  type Comment {
    id: ID!
    content: String!
    post: Post!
    author: User!
    createdAt: String!
  }

  type Tag {
    id: ID!
    name: String!
    description: String
    posts: [Post!]!
  }

  type Article {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    tags: [String!]!
  }

  type Video {
    id: ID!
    title: String!
    url: String!
    duration: Int!
    author: User!
  }

  type UserNotification {
    id: ID!
    message: String!
    user: User!
    type: String!
  }

  type PostNotification {
    id: ID!
    message: String!
    post: Post!
    type: String!
  }

  type SystemNotification {
    id: ID!
    message: String!
    severity: String!
  }
`;

// Sample Data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'USER' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN' },
];

const posts = [
  {
    id: '1',
    title: 'GraphQL Unions',
    content: 'Learning about unions...',
    authorId: '1',
    published: true,
  },
  {
    id: '2',
    title: 'Advanced GraphQL',
    content: 'Advanced concepts...',
    authorId: '2',
    published: false,
  },
];

const comments = [
  {
    id: '1',
    content: 'Great post!',
    postId: '1',
    authorId: '2',
    createdAt: '2024-01-01',
  },
];

const tags = [
  {
    id: '1',
    name: 'graphql',
    description: 'GraphQL related content',
    postIds: ['1', '2'],
  },
  {
    id: '2',
    name: 'tutorial',
    description: 'Tutorial content',
    postIds: ['1'],
  },
];

const articles = [
  {
    id: '1',
    title: 'GraphQL Best Practices',
    content: 'Best practices article...',
    authorId: '1',
    published: true,
    tags: ['graphql', 'best-practices'],
  },
];

const videos = [
  {
    id: '1',
    title: 'GraphQL Tutorial',
    url: 'https://example.com/video1',
    duration: 3600,
    authorId: '1',
  },
];

const notifications = [
  {
    id: '1',
    type: 'user',
    message: 'New follower',
    userId: '1',
  },
  {
    id: '2',
    type: 'post',
    message: 'New comment on your post',
    postId: '1',
  },
  {
    id: '3',
    type: 'system',
    message: 'System maintenance scheduled',
    severity: 'info',
  },
];

// Resolvers
const resolvers = {
  Query: {
    search: (_, { query }) => {
      const q = query.toLowerCase();
      const results = [];
      
      // Search users
      users.forEach(user => {
        if (user.name.toLowerCase().includes(q) || 
            user.email.toLowerCase().includes(q)) {
          results.push(user);
        }
      });
      
      // Search posts
      posts.forEach(post => {
        if (post.title.toLowerCase().includes(q) || 
            post.content.toLowerCase().includes(q)) {
          results.push(post);
        }
      });
      
      // Search comments
      comments.forEach(comment => {
        if (comment.content.toLowerCase().includes(q)) {
          results.push(comment);
        }
      });
      
      // Search tags
      tags.forEach(tag => {
        if (tag.name.toLowerCase().includes(q) || 
            tag.description?.toLowerCase().includes(q)) {
          results.push(tag);
        }
      });
      
      return results;
    },
    
    content: () => {
      return [...posts, ...articles, ...videos];
    },
    
    notifications: () => {
      return notifications;
    },
  },
  
  // Union Type Resolvers
  SearchResult: {
    __resolveType(obj) {
      if (obj.email) return 'User';
      if (obj.content && obj.postId) return 'Comment';
      if (obj.postIds) return 'Tag';
      if (obj.title && obj.authorId) return 'Post';
      return null;
    },
  },
  
  Content: {
    __resolveType(obj) {
      if (obj.url) return 'Video';
      if (obj.tags) return 'Article';
      if (obj.title && obj.authorId) return 'Post';
      return null;
    },
  },
  
  Notification: {
    __resolveType(obj) {
      if (obj.severity) return 'SystemNotification';
      if (obj.postId) return 'PostNotification';
      if (obj.userId) return 'UserNotification';
      return null;
    },
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
  
  Comment: {
    post: (comment) => posts.find(p => p.id === comment.postId),
    author: (comment) => users.find(u => u.id === comment.authorId),
  },
  
  Tag: {
    posts: (tag) => posts.filter(p => tag.postIds.includes(p.id)),
  },
  
  Article: {
    author: (article) => users.find(u => u.id === article.authorId),
  },
  
  Video: {
    author: (video) => users.find(u => u.id === video.authorId),
  },
  
  UserNotification: {
    user: (notification) => users.find(u => u.id === notification.userId),
  },
  
  PostNotification: {
    post: (notification) => posts.find(p => p.id === notification.postId),
  },
};

// Example Queries

/*
# Query Union with Inline Fragments
query {
  search(query: "graphql") {
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
    ... on Comment {
      id
      content
    }
    ... on Tag {
      id
      name
      description
    }
  }
}

# Query Content Union
query {
  content {
    ... on Post {
      id
      title
      author {
        name
      }
    }
    ... on Article {
      id
      title
      tags
    }
    ... on Video {
      id
      title
      url
      duration
    }
  }
}

# Query Notifications Union
query {
  notifications {
    ... on UserNotification {
      id
      message
      user {
        name
      }
    }
    ... on PostNotification {
      id
      message
      post {
        title
      }
    }
    ... on SystemNotification {
      id
      message
      severity
    }
  }
}

# Complex Union Query
query {
  search(query: "john") {
    ... on User {
      id
      name
      email
      role
    }
    ... on Post {
      id
      title
      author {
        name
      }
    }
    ... on Comment {
      id
      content
      author {
        name
      }
      post {
        title
      }
    }
  }
}
*/

// Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4011 },
  });

  console.log(`🚀 Unions Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { search(query: "graphql") { ... on User { name } ... on Post { title } } }`);
  console.log(`2. { content { ... on Post { title } ... on Video { title url } } }`);
}

startServer().catch(console.error);

