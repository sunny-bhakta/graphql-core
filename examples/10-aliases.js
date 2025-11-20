const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema
const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users(limit: Int, role: Role): [User!]!
    post(id: ID!): Post
    posts(limit: Int, published: Boolean, sortBy: String): [Post!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    posts(limit: Int, published: Boolean, sortBy: String): [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    views: Int!
    createdAt: String!
  }

  enum Role {
    USER
    ADMIN
    MODERATOR
  }
`;

// Sample Data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'USER' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'MODERATOR' },
];

const posts = [
  { id: '1', title: 'Post 1', content: 'Content 1', authorId: '1', published: true, views: 100, createdAt: '2024-01-01' },
  { id: '2', title: 'Post 2', content: 'Content 2', authorId: '1', published: false, views: 50, createdAt: '2024-01-02' },
  { id: '3', title: 'Post 3', content: 'Content 3', authorId: '2', published: true, views: 200, createdAt: '2024-01-03' },
  { id: '4', title: 'Post 4', content: 'Content 4', authorId: '1', published: true, views: 150, createdAt: '2024-01-04' },
  { id: '5', title: 'Post 5', content: 'Content 5', authorId: '2', published: false, views: 75, createdAt: '2024-01-05' },
];

// Helper function to sort posts
function sortPosts(posts, sortBy) {
  if (!sortBy) return posts;
  
  const sorted = [...posts];
  switch (sortBy) {
    case 'views':
      return sorted.sort((a, b) => b.views - a.views);
    case 'createdAt':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    default:
      return sorted;
  }
}

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    
    users: (_, { limit, role }) => {
      let result = users;
      if (role) {
        result = result.filter(u => u.role === role);
      }
      if (limit) {
        result = result.slice(0, limit);
      }
      return result;
    },
    
    post: (_, { id }) => posts.find(p => p.id === id),
    
    posts: (_, { limit, published, sortBy }) => {
      let result = posts;
      if (published !== undefined) {
        result = result.filter(p => p.published === published);
      }
      result = sortPosts(result, sortBy);
      if (limit) {
        result = result.slice(0, limit);
      }
      return result;
    },
  },
  
  User: {
    posts: (user, { limit, published, sortBy }) => {
      let result = posts.filter(p => p.authorId === user.id);
      if (published !== undefined) {
        result = result.filter(p => p.published === published);
      }
      result = sortPosts(result, sortBy);
      if (limit) {
        result = result.slice(0, limit);
      }
      return result;
    },
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
};

// Example Queries with Aliases

/*
# Basic Aliases - Querying same field multiple times
query {
  firstUser: user(id: "1") {
    id
    name
    email
  }
  secondUser: user(id: "2") {
    id
    name
    email
  }
}

# Aliases with Different Arguments
query {
  publishedPosts: posts(published: true, limit: 5) {
    id
    title
    views
  }
  draftPosts: posts(published: false, limit: 5) {
    id
    title
  }
}

# Aliases with Sorting
query {
  popularPosts: posts(sortBy: "views", limit: 3) {
    id
    title
    views
  }
  recentPosts: posts(sortBy: "createdAt", limit: 3) {
    id
    title
    createdAt
  }
}

# Aliases in Nested Queries
query {
  user(id: "1") {
    id
    name
    recentPosts: posts(sortBy: "createdAt", limit: 2) {
      id
      title
      createdAt
    }
    popularPosts: posts(sortBy: "views", limit: 2) {
      id
      title
      views
    }
    publishedPosts: posts(published: true) {
      id
      title
    }
    draftPosts: posts(published: false) {
      id
      title
    }
  }
}

# Aliases with Variables
query GetUserPosts($userId: ID!, $limit: Int!) {
  user(id: $userId) {
    id
    name
    recentPosts: posts(sortBy: "createdAt", limit: $limit) {
      id
      title
    }
    topPosts: posts(sortBy: "views", limit: $limit) {
      id
      title
      views
    }
  }
}

Variables:
{
  "userId": "1",
  "limit": 3
}

# Multiple Aliases for Different Users
query {
  adminUsers: users(role: ADMIN) {
    id
    name
    email
  }
  regularUsers: users(role: USER) {
    id
    name
    email
  }
}

# Complex Query with Multiple Aliases
query {
  user(id: "1") {
    id
    name
    allPosts: posts {
      id
      title
    }
    publishedPosts: posts(published: true) {
      id
      title
      views
    }
    draftPosts: posts(published: false) {
      id
      title
    }
    topPost: posts(sortBy: "views", limit: 1) {
      id
      title
      views
    }
  }
  adminUsers: users(role: ADMIN) {
    id
    name
  }
  popularPosts: posts(sortBy: "views", limit: 3) {
    id
    title
    views
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
    listen: { port: 4009 },
  });

  console.log(`🚀 Aliases Server ready at: ${url}`);
  console.log(`\nTry these queries with aliases:`);
  console.log(`1. { firstUser: user(id: "1") { name } secondUser: user(id: "2") { name } }`);
  console.log(`2. { publishedPosts: posts(published: true) { id title } draftPosts: posts(published: false) { id title } }`);
}

startServer().catch(console.error);

