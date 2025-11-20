const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema
const typeDefs = gql`
  type Query {
    # Basic resolvers
    hello: String!
    currentTime: String!
    
    # Resolvers with arguments
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    searchUsers(query: String!): [User!]!
    
    # Resolvers with context
    currentUser: User
    userProfile: Profile
    
    # Nested resolvers
    posts: [Post!]!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    
    # Computed field resolver
    fullName: String!
    
    # Field with custom resolver
    email: String!
    age: Int
    
    # Nested type resolver
    posts: [Post!]!
    profile: Profile
    
    # Field with arguments
    postsByStatus(published: Boolean!): [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    
    # Nested resolver
    author: User!
    
    # Computed field
    excerpt(length: Int): String!
    
    # Field with default resolver (uses parent data)
    published: Boolean!
    createdAt: String!
  }

  type Profile {
    bio: String
    website: String
    avatar: String
    user: User!
  }
`;

// Sample Data
const users = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 30,
    profileId: '1',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    age: 25,
    profileId: '2',
  },
];

const profiles = [
  { id: '1', userId: '1', bio: 'Developer', website: 'https://johndoe.com', avatar: 'avatar1.jpg' },
  { id: '2', userId: '2', bio: 'Designer', website: 'https://janesmith.com', avatar: 'avatar2.jpg' },
];

const posts = [
  {
    id: '1',
    title: 'GraphQL Resolvers',
    content: 'This is a long post about GraphQL resolvers and how they work...',
    authorId: '1',
    published: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Advanced GraphQL',
    content: 'Advanced concepts in GraphQL...',
    authorId: '1',
    published: false,
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    title: 'GraphQL Best Practices',
    content: 'Best practices for building GraphQL APIs...',
    authorId: '2',
    published: true,
    createdAt: '2024-01-03',
  },
];

// Simulate async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Resolvers
const resolvers = {
  // Root Query Resolvers
  Query: {
    // Simple resolver
    hello: () => 'Hello, GraphQL Resolvers!',
    
    // Async resolver
    currentTime: async () => {
      await delay(100); // Simulate async operation
      return new Date().toISOString();
    },
    
    // Resolver with arguments
    user: (parent, args) => {
      return users.find(u => u.id === args.id);
    },
    
    // Resolver with optional arguments
    users: (parent, args) => {
      let result = [...users];
      if (args.offset) {
        result = result.slice(args.offset);
      }
      if (args.limit) {
        result = result.slice(0, args.limit);
      }
      return result;
    },
    
    // Resolver with search logic
    searchUsers: (parent, args) => {
      const query = args.query.toLowerCase();
      return users.filter(u => 
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    },
    
    // Resolver using context
    currentUser: (parent, args, context) => {
      return context.user ? users.find(u => u.id === context.user.id) : null;
    },
    
    // Resolver with nested data
    userProfile: (parent, args, context) => {
      if (!context.user) return null;
      return profiles.find(p => p.userId === context.user.id);
    },
    
    // Simple resolver (uses default resolver for nested fields)
    posts: () => posts,
  },
  
  // User Type Resolvers
  User: {
    // Computed field resolver
    fullName: (user) => {
      return `${user.firstName} ${user.lastName}`;
    },
    
    // Field resolver (can transform data)
    email: (user) => {
      // Could add logic here, e.g., masking email
      return user.email;
    },
    
    // Nested type resolver
    posts: (user) => {
      return posts.filter(p => p.authorId === user.id);
    },
    
    // Field with arguments
    postsByStatus: (user, args) => {
      return posts.filter(p => 
        p.authorId === user.id && p.published === args.published
      );
    },
    
    // Nested type resolver
    profile: (user) => {
      return profiles.find(p => p.userId === user.id);
    },
  },
  
  // Post Type Resolvers
  Post: {
    // Nested resolver
    author: (post) => {
      return users.find(u => u.id === post.authorId);
    },
    
    // Field with arguments
    excerpt: (post, args) => {
      const length = args.length || 50;
      return post.content.substring(0, length) + '...';
    },
    
    // Default resolver - no resolver needed, uses parent data
    // published and createdAt are automatically resolved from post object
  },
  
  // Profile Type Resolvers
  Profile: {
    // Reverse relationship resolver
    user: (profile) => {
      return users.find(u => u.id === profile.userId);
    },
  },
};

// Context function
const context = async ({ req }) => {
  // In a real app, you'd extract user from JWT token
  // For demo, we'll simulate a logged-in user
  return {
    user: { id: '1' }, // Simulated authenticated user
  };
};

// Example Queries to Test

/*
# Basic resolver
query {
  hello
}

# Async resolver
query {
  currentTime
}

# Resolver with arguments
query {
  user(id: "1") {
    id
    fullName
    email
  }
}

# Resolver with optional arguments
query {
  users(limit: 1, offset: 0) {
    id
    fullName
  }
}

# Resolver with context
query {
  currentUser {
    id
    fullName
    posts {
      id
      title
    }
  }
}

# Nested resolvers
query {
  posts {
    id
    title
    author {
      id
      fullName
      email
    }
    excerpt(length: 20)
  }
}

# Field with arguments
query {
  user(id: "1") {
    id
    fullName
    postsByStatus(published: true) {
      id
      title
    }
  }
}

# Complex nested query
query {
  user(id: "1") {
    id
    fullName
    posts {
      id
      title
      excerpt(length: 30)
      author {
        fullName
        profile {
          bio
        }
      }
    }
    profile {
      bio
      website
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
    listen: { port: 4005 },
    context,
  });

  console.log(`🚀 Resolvers Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { hello }`);
  console.log(`2. { user(id: "1") { id fullName email } }`);
  console.log(`3. { currentUser { id fullName posts { id title } } }`);
}

startServer().catch(console.error);

