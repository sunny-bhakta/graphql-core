const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In production, use environment variables
const JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Schema
const typeDefs = gql`
  type Query {
    # Public queries
    login(email: String!, password: String!): AuthPayload!
    me: User
    
    # Protected queries
    users: [User!]! @auth
    user(id: ID!): User @auth
    adminData: String! @auth(requires: ADMIN)
    moderatorData: String! @auth(requires: MODERATOR)
    
    # Field-level protection
    myProfile: User
  }

  type Mutation {
    # Public mutations
    register(input: RegisterInput!): AuthPayload!
    
    # Protected mutations
    updateProfile(input: UpdateProfileInput!): User! @auth
    deleteAccount: Boolean! @auth
    createUser(input: CreateUserInput!): User! @auth(requires: ADMIN)
    deleteUser(id: ID!): Boolean! @auth(requires: ADMIN)
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    # Protected field - only user can see their own email
    privateEmail: String
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    # Protected field - only author can see draft content
    draftContent: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum Role {
    USER
    MODERATOR
    ADMIN
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String
    email: String
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: Role = USER
  }
`;

// Sample Data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'USER',
  },
  {
    id: '2',
    name: 'Jane Admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
  },
  {
    id: '3',
    name: 'Bob Moderator',
    email: 'mod@example.com',
    password: bcrypt.hashSync('mod123', 10),
    role: 'MODERATOR',
  },
];

const posts = [
  { id: '1', title: 'Post 1', content: 'Public content', authorId: '1', draftContent: 'Draft content here' },
  { id: '2', title: 'Post 2', content: 'Another post', authorId: '2', draftContent: 'Admin draft' },
];

let nextUserId = 4;

// Helper function to verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Helper function to check authorization
function requireAuth(context, requiredRole = null) {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  
  if (requiredRole) {
    const roleHierarchy = { USER: 1, MODERATOR: 2, ADMIN: 3 };
    const userRole = roleHierarchy[context.user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    if (userRole < requiredRoleLevel) {
      throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
    }
  }
}

// Resolvers
const resolvers = {
  Query: {
    login: async (_, { email, password }) => {
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid credentials');
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    },
    
    me: (_, __, context) => {
      if (!context.user) return null;
      return users.find(u => u.id === context.user.userId);
    },
    
    users: (_, __, context) => {
      requireAuth(context);
      return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }));
    },
    
    user: (_, { id }, context) => {
      requireAuth(context);
      const user = users.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
    
    adminData: (_, __, context) => {
      requireAuth(context, 'ADMIN');
      return 'This is admin-only data';
    },
    
    moderatorData: (_, __, context) => {
      requireAuth(context, 'MODERATOR');
      return 'This is moderator or admin data';
    },
    
    myProfile: (_, __, context) => {
      if (!context.user) return null;
      const user = users.find(u => u.id === context.user.userId);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
  },
  
  Mutation: {
    register: async (_, { input }) => {
      // Check if user exists
      const existingUser = users.find(u => u.email === input.email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const newUser = {
        id: String(nextUserId++),
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'USER',
      };
      users.push(newUser);
      
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      };
    },
    
    updateProfile: (_, { input }, context) => {
      requireAuth(context);
      const user = users.find(u => u.id === context.user.userId);
      if (!user) throw new Error('User not found');
      
      if (input.name !== undefined) user.name = input.name;
      if (input.email !== undefined) user.email = input.email;
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
    
    deleteAccount: (_, __, context) => {
      requireAuth(context);
      const index = users.findIndex(u => u.id === context.user.userId);
      if (index === -1) throw new Error('User not found');
      users.splice(index, 1);
      return true;
    },
    
    createUser: (_, { input }, context) => {
      requireAuth(context, 'ADMIN');
      const hashedPassword = bcrypt.hashSync(input.password, 10);
      const newUser = {
        id: String(nextUserId++),
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role || 'USER',
      };
      users.push(newUser);
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };
    },
    
    deleteUser: (_, { id }, context) => {
      requireAuth(context, 'ADMIN');
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      users.splice(index, 1);
      return true;
    },
  },
  
  User: {
    privateEmail: (user, _, context) => {
      // Only return email if user is viewing their own profile
      if (context.user && context.user.userId === user.id) {
        return user.email;
      }
      return null;
    },
    
    posts: (user) => posts.filter(p => p.authorId === user.id),
  },
  
  Post: {
    author: (post) => {
      const user = users.find(u => u.id === post.authorId);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
    
    draftContent: (post, _, context) => {
      // Only return draft content if user is the author
      if (context.user && context.user.userId === post.authorId) {
        return post.draftContent;
      }
      return null;
    },
  },
};

// Context with authentication
const context = async ({ req }) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      return {
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
      };
    }
  }
  
  return { user: null };
};

// Example Queries and Mutations

/*
# Register
mutation {
  register(input: {
    name: "New User"
    email: "new@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      name
      email
    }
  }
}

# Login
query {
  login(email: "john@example.com", password: "password123") {
    token
    user {
      id
      name
    }
  }
}

# Get current user (requires auth)
query {
  me {
    id
    name
    email
    privateEmail
  }
}

# Get users (requires auth)
query {
  users {
    id
    name
    email
  }
}

# Admin data (requires ADMIN role)
query {
  adminData
}

# Update profile (requires auth)
mutation {
  updateProfile(input: {
    name: "Updated Name"
  }) {
    id
    name
  }
}

# Create user (requires ADMIN role)
mutation {
  createUser(input: {
    name: "New User"
    email: "newuser@example.com"
    password: "password123"
    role: USER
  }) {
    id
    name
    role
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
    listen: { port: 4018 },
    context,
  });

  console.log(`🚀 Authentication Server ready at: ${url}`);
  console.log(`\nTest users:`);
  console.log(`- john@example.com / password123 (USER)`);
  console.log(`- admin@example.com / admin123 (ADMIN)`);
  console.log(`- mod@example.com / mod123 (MODERATOR)`);
  console.log(`\nTry these:`);
  console.log(`1. query { login(email: "john@example.com", password: "password123") { token } }`);
  console.log(`2. query { me { id name } } (with Authorization: Bearer <token>)`);
}

startServer().catch(console.error);

