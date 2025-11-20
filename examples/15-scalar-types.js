const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { GraphQLScalarType, Kind } = require('graphql');

// Custom Scalar: Date
const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    // Convert Date to ISO string for output
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new Error('Value is not a valid Date');
  },
  parseValue(value) {
    // Parse value from variables
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('Value is not a valid Date string');
  },
  parseLiteral(ast) {
    // Parse value from query literal
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom Scalar: Email
const EmailScalar = new GraphQLScalarType({
  name: 'Email',
  description: 'Email custom scalar type',
  serialize(value) {
    if (typeof value !== 'string') {
      throw new Error('Value is not a string');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    return value;
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new Error('Value is not a string');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(ast.value)) {
        throw new Error('Invalid email format');
      }
      return ast.value;
    }
    return null;
  },
});

// Custom Scalar: URL
const URLScalar = new GraphQLScalarType({
  name: 'URL',
  description: 'URL custom scalar type',
  serialize(value) {
    if (typeof value !== 'string') {
      throw new Error('Value is not a string');
    }
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error('Invalid URL format');
    }
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new Error('Value is not a string');
    }
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error('Invalid URL format');
    }
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        new URL(ast.value);
        return ast.value;
      } catch {
        throw new Error('Invalid URL format');
      }
    }
    return null;
  },
});

// Custom Scalar: JSON
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT: {
        const value = Object.create(null);
        ast.fields.forEach(field => {
          value[field.name.value] = JSONScalar.parseLiteral(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return ast.values.map(JSONScalar.parseLiteral);
      default:
        return null;
    }
  },
});

// Schema
const typeDefs = gql`
  scalar Date
  scalar Email
  scalar URL
  scalar JSON

  type Query {
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
  }

  type User {
    id: ID!
    name: String!
    email: Email!
    age: Int
    balance: Float
    isActive: Boolean!
    createdAt: Date!
    website: URL
    metadata: JSON
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    views: Int!
    rating: Float
    createdAt: Date!
    tags: [String!]!
    settings: JSON
  }

  input CreateUserInput {
    name: String!
    email: Email!
    age: Int
    balance: Float
    isActive: Boolean = true
    website: URL
    metadata: JSON
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
    published: Boolean = false
    views: Int = 0
    rating: Float
    tags: [String!] = []
    settings: JSON
  }
`;

// Sample Data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    balance: 1000.50,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    website: 'https://johndoe.com',
    metadata: { theme: 'dark', preferences: { notifications: true } },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    balance: 500.25,
    isActive: false,
    createdAt: new Date('2024-01-02'),
    website: null,
    metadata: null,
  },
];

const posts = [
  {
    id: '1',
    title: 'GraphQL Scalars',
    content: 'Learning about scalars...',
    authorId: '1',
    published: true,
    views: 100,
    rating: 4.5,
    createdAt: new Date('2024-01-03'),
    tags: ['graphql', 'tutorial'],
    settings: { allowComments: true, public: true },
  },
];

// Resolvers
const resolvers = {
  Date: DateScalar,
  Email: EmailScalar,
  URL: URLScalar,
  JSON: JSONScalar,
  
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    users: () => users,
    post: (_, { id }) => posts.find(p => p.id === id),
  },
  
  Mutation: {
    createUser: (_, { input }) => {
      const newUser = {
        id: String(users.length + 1),
        name: input.name,
        email: input.email,
        age: input.age || null,
        balance: input.balance || null,
        isActive: input.isActive !== undefined ? input.isActive : true,
        createdAt: new Date(),
        website: input.website || null,
        metadata: input.metadata || null,
      };
      users.push(newUser);
      return newUser;
    },
    
    createPost: (_, { input }) => {
      const newPost = {
        id: String(posts.length + 1),
        title: input.title,
        content: input.content,
        authorId: input.authorId,
        published: input.published || false,
        views: input.views || 0,
        rating: input.rating || null,
        createdAt: new Date(),
        tags: input.tags || [],
        settings: input.settings || null,
      };
      posts.push(newPost);
      return newPost;
    },
  },
  
  User: {
    createdAt: (user) => user.createdAt,
    website: (user) => user.website,
    metadata: (user) => user.metadata,
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
    createdAt: (post) => post.createdAt,
    settings: (post) => post.settings,
  },
};

// Example Queries and Mutations

/*
# Query with Built-in Scalars
query {
  user(id: "1") {
    id
    name
    email
    age
    balance
    isActive
    createdAt
    website
    metadata
  }
}

# Query with Custom Scalars
query {
  post(id: "1") {
    id
    title
    createdAt
    settings
    author {
      email
      website
    }
  }
}

# Mutation with Custom Scalars
mutation {
  createUser(input: {
    name: "Test User"
    email: "test@example.com"
    age: 30
    balance: 100.50
    isActive: true
    website: "https://example.com"
    metadata: {
      theme: "light"
      preferences: {
        notifications: true
      }
    }
  }) {
    id
    name
    email
    website
    metadata
  }
}

# Mutation with Variables
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    createdAt
    settings
  }
}

Variables:
{
  "input": {
    "title": "New Post",
    "content": "Content here",
    "authorId": "1",
    "published": true,
    "views": 0,
    "rating": 4.5,
    "tags": ["graphql"],
    "settings": {
      "allowComments": true,
      "public": true
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
    listen: { port: 4014 },
  });

  console.log(`🚀 Scalar Types Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { user(id: "1") { id name email createdAt website } }`);
  console.log(`2. mutation { createUser(input: { name: "Test", email: "test@example.com" }) { id email } }`);
}

startServer().catch(console.error);

