const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema with Pagination
const typeDefs = gql`
  type Query {
    # Offset-based pagination
    users(limit: Int = 10, offset: Int = 0): [User!]!
    posts(limit: Int = 10, offset: Int = 0): [Post!]!
    
    # Cursor-based pagination
    usersCursor(first: Int = 10, after: String): UserConnection!
    postsCursor(first: Int = 10, after: String): PostConnection!
    
    # Page-based pagination
    usersPage(page: Int = 1, pageSize: Int = 10): UserPage!
    postsPage(page: Int = 1, pageSize: Int = 10): PostPage!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    views: Int!
  }

  # Cursor-based Pagination (Relay-style)
  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    cursor: String!
    node: User!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PostEdge {
    cursor: String!
    node: Post!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Page-based Pagination
  type UserPage {
    users: [User!]!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type PostPage {
    posts: [Post!]!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }
`;

// Generate sample data
const users = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

const posts = Array.from({ length: 100 }, (_, i) => ({
  id: String(i + 1),
  title: `Post ${i + 1}`,
  content: `Content for post ${i + 1}`,
  authorId: String((i % 50) + 1),
  views: Math.floor(Math.random() * 1000),
}));

// Helper function to create cursor
function createCursor(id) {
  return Buffer.from(id).toString('base64');
}

// Helper function to decode cursor
function decodeCursor(cursor) {
  return Buffer.from(cursor, 'base64').toString();
}

// Resolvers
const resolvers = {
  Query: {
    // Offset-based pagination
    users: (_, { limit = 10, offset = 0 }) => {
      return users.slice(offset, offset + limit);
    },
    
    posts: (_, { limit = 10, offset = 0 }) => {
      return posts.slice(offset, offset + limit);
    },
    
    // Cursor-based pagination
    usersCursor: (_, { first = 10, after }) => {
      let startIndex = 0;
      
      if (after) {
        const afterId = decodeCursor(after);
        startIndex = users.findIndex(u => u.id === afterId) + 1;
      }
      
      const endIndex = startIndex + first;
      const edges = users.slice(startIndex, endIndex).map(user => ({
        cursor: createCursor(user.id),
        node: user,
      }));
      
      const hasNextPage = endIndex < users.length;
      const hasPreviousPage = startIndex > 0;
      
      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount: users.length,
      };
    },
    
    postsCursor: (_, { first = 10, after }) => {
      let startIndex = 0;
      
      if (after) {
        const afterId = decodeCursor(after);
        startIndex = posts.findIndex(p => p.id === afterId) + 1;
      }
      
      const endIndex = startIndex + first;
      const edges = posts.slice(startIndex, endIndex).map(post => ({
        cursor: createCursor(post.id),
        node: post,
      }));
      
      const hasNextPage = endIndex < posts.length;
      const hasPreviousPage = startIndex > 0;
      
      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount: posts.length,
      };
    },
    
    // Page-based pagination
    usersPage: (_, { page = 1, pageSize = 10 }) => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = users.slice(startIndex, endIndex);
      const totalPages = Math.ceil(users.length / pageSize);
      
      return {
        users: paginatedUsers,
        page,
        pageSize,
        totalPages,
        totalCount: users.length,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    
    postsPage: (_, { page = 1, pageSize = 10 }) => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPosts = posts.slice(startIndex, endIndex);
      const totalPages = Math.ceil(posts.length / pageSize);
      
      return {
        posts: paginatedPosts,
        page,
        pageSize,
        totalPages,
        totalCount: posts.length,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
  },
  
  User: {
    posts: (user) => posts.filter(p => p.authorId === user.id),
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
};

// Example Queries

/*
# Offset-based Pagination
query {
  users(limit: 10, offset: 0) {
    id
    name
    email
  }
}

# Cursor-based Pagination
query {
  usersCursor(first: 10) {
    edges {
      cursor
      node {
        id
        name
        email
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}

# Cursor-based Pagination with After
query {
  usersCursor(first: 10, after: "cursor_string_here") {
    edges {
      cursor
      node {
        id
        name
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Page-based Pagination
query {
  usersPage(page: 1, pageSize: 10) {
    users {
      id
      name
      email
    }
    page
    pageSize
    totalPages
    totalCount
    hasNextPage
    hasPreviousPage
  }
}

# Complex Pagination Query
query {
  usersPage(page: 2, pageSize: 20) {
    users {
      id
      name
      posts {
        id
        title
      }
    }
    pageInfo: {
      page
      totalPages
      hasNextPage
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
    listen: { port: 4015 },
  });

  console.log(`🚀 Pagination Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { users(limit: 10, offset: 0) { id name } }`);
  console.log(`2. { usersCursor(first: 10) { edges { node { id name } } pageInfo { hasNextPage } } }`);
  console.log(`3. { usersPage(page: 1, pageSize: 10) { users { id name } totalPages } }`);
}

startServer().catch(console.error);

