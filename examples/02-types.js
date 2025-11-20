const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { GraphQLScalarType, Kind } = require('graphql');

// Custom Scalar: Date
const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
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
    if (typeof value !== 'string') return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

// Schema with various types
const typeDefs = gql`
  scalar Date
  scalar Email

  type Query {
    # Scalar types
    user(id: ID!): User
    users: [User!]!
    
    # List types examples
    tags: [String]
    requiredTags: [String!]!
    nullableTags: [String]
    
    # Mixed types
    numbers: [Int!]!
    optionalNumbers: [Int]
  }

  type User {
    # Scalar types
    id: ID!
    name: String!
    email: Email!
    age: Int
    balance: Float
    isActive: Boolean!
    createdAt: Date!
    
    # List types
    tags: [String!]!
    posts: [Post!]!
    optionalPosts: [Post]
    
    # Nested types
    profile: Profile
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    views: Int!
    rating: Float
    published: Boolean!
  }

  type Profile {
    bio: String
    website: String
    socialLinks: [String!]
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
    tags: ['developer', 'graphql'],
    posts: [
      { id: '1', title: 'Post 1', content: 'Content 1', views: 100, rating: 4.5, published: true },
    ],
    profile: { bio: 'Developer', website: 'https://example.com', socialLinks: ['twitter', 'github'] },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    balance: 500.25,
    isActive: false,
    createdAt: new Date('2024-01-02'),
    tags: ['designer', 'ui'],
    posts: [],
    profile: null,
  },
];

// Resolvers
const resolvers = {
  Date: DateScalar,
  Email: EmailScalar,
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    users: () => users,
    tags: () => ['tag1', 'tag2', null, 'tag4'], // Nullable list with nullable items
    requiredTags: () => ['tag1', 'tag2', 'tag3'], // Non-null list with non-null items
    nullableTags: () => null, // Nullable list
    numbers: () => [1, 2, 3, 4, 5],
    optionalNumbers: () => [1, 2, null, 4],
  },
  User: {
    posts: (user) => user.posts || [],
    optionalPosts: (user) => user.posts.length > 0 ? user.posts : null,
  },
};

// Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
  });

  console.log(`🚀 Types Server ready at: ${url}`);
}

startServer().catch(console.error);

