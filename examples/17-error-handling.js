const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { GraphQLError } = require('graphql');

// Custom Error Classes
class UserNotFoundError extends GraphQLError {
  constructor(userId) {
    super(`User with ID ${userId} not found`, {
      extensions: {
        code: 'USER_NOT_FOUND',
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

class ValidationError extends GraphQLError {
  constructor(message, field) {
    super(message, {
      extensions: {
        code: 'VALIDATION_ERROR',
        field,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

class AuthenticationError extends GraphQLError {
  constructor(message = 'Authentication required') {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

class AuthorizationError extends GraphQLError {
  constructor(message = 'Insufficient permissions') {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Schema
const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]!
    protectedData: String!
    adminData: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    profile: Profile
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Profile {
    bio: String
    website: String
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  input UpdateUserInput {
    name: String
    email: String
    age: Int
  }
`;

// Sample Data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
];

const posts = [
  { id: '1', title: 'Post 1', content: 'Content 1', authorId: '1' },
  { id: '2', title: 'Post 2', content: 'Content 2', authorId: '2' },
];

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => {
      const user = users.find(u => u.id === id);
      if (!user) {
        throw new UserNotFoundError(id);
      }
      return user;
    },
    
    users: () => {
      return users;
    },
    
    protectedData: (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to access this data');
      }
      return 'This is protected data';
    },
    
    adminData: (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError();
      }
      if (context.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }
      return 'This is admin-only data';
    },
  },
  
  Mutation: {
    createUser: (_, { input }) => {
      // Validation
      if (!input.name || input.name.length < 2) {
        throw new ValidationError('Name must be at least 2 characters', 'name');
      }
      
      if (!input.email || !input.email.includes('@')) {
        throw new ValidationError('Invalid email format', 'email');
      }
      
      // Check if email exists
      const existingUser = users.find(u => u.email === input.email);
      if (existingUser) {
        throw new GraphQLError('Email already in use', {
          extensions: {
            code: 'EMAIL_EXISTS',
            field: 'email',
            timestamp: new Date().toISOString(),
          },
        });
      }
      
      const newUser = {
        id: String(users.length + 1),
        name: input.name,
        email: input.email,
        age: input.age || null,
      };
      users.push(newUser);
      return newUser;
    },
    
    updateUser: (_, { id, input }) => {
      const user = users.find(u => u.id === id);
      if (!user) {
        throw new UserNotFoundError(id);
      }
      
      // Validation
      if (input.name && input.name.length < 2) {
        throw new ValidationError('Name must be at least 2 characters', 'name');
      }
      
      if (input.email && !input.email.includes('@')) {
        throw new ValidationError('Invalid email format', 'email');
      }
      
      if (input.name !== undefined) user.name = input.name;
      if (input.email !== undefined) user.email = input.email;
      if (input.age !== undefined) user.age = input.age;
      
      return user;
    },
    
    deleteUser: (_, { id }) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        throw new UserNotFoundError(id);
      }
      
      users.splice(index, 1);
      return true;
    },
  },
  
  User: {
    posts: (user) => {
      // Simulate potential error
      try {
        return posts.filter(p => p.authorId === user.id);
      } catch (error) {
        throw new GraphQLError('Failed to load posts', {
          extensions: {
            code: 'POSTS_LOAD_ERROR',
            userId: user.id,
          },
        });
      }
    },
    
    profile: (user) => {
      // Return null for some users (not an error)
      if (user.id === '1') {
        return { bio: 'Developer', website: 'https://example.com' };
      }
      return null;
    },
  },
  
  Post: {
    author: (post) => {
      const user = users.find(u => u.id === post.authorId);
      if (!user) {
        // This creates a partial result - post is returned but author field fails
        throw new UserNotFoundError(post.authorId);
      }
      return user;
    },
  },
};

// Context with user (simulated)
const context = async ({ req }) => {
  // In real app, extract from JWT token
  const authHeader = req.headers.authorization;
  
  if (authHeader === 'Bearer admin-token') {
    return { user: { id: '1', role: 'ADMIN' } };
  } else if (authHeader === 'Bearer user-token') {
    return { user: { id: '2', role: 'USER' } };
  }
  
  return { user: null };
};

// Format error responses
const formatError = (err) => {
  // Log error for debugging
  console.error('GraphQL Error:', err);
  
  // Don't expose internal errors in production
  if (err.extensions?.code === 'INTERNAL_SERVER_ERROR') {
    return new GraphQLError('Internal server error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
  
  return err;
};

// Example Queries and Mutations

/*
# Query that throws error
query {
  user(id: "999") {
    id
    name
  }
}

# Partial result (some fields succeed, others fail)
query {
  users {
    id
    name
    posts {
      id
      title
      author {
        name
      }
    }
  }
}

# Authentication error
query {
  protectedData
}

# Authorization error
query {
  adminData
}

# Validation error
mutation {
  createUser(input: {
    name: "A"
    email: "invalid-email"
  }) {
    id
    name
  }
}

# Multiple errors
mutation {
  createUser(input: {
    name: "A"
    email: "test@example.com"
  }) {
    id
  }
  updateUser(id: "999", input: {
    name: "Updated"
  }) {
    id
  }
}
*/

// Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4016 },
    context,
  });

  console.log(`🚀 Error Handling Server ready at: ${url}`);
  console.log(`\nTry these queries to see different errors:`);
  console.log(`1. { user(id: "999") { id name } } - User not found`);
  console.log(`2. { protectedData } - Authentication required`);
  console.log(`3. mutation { createUser(input: { name: "A", email: "invalid" }) { id } } - Validation error`);
}

startServer().catch(console.error);

