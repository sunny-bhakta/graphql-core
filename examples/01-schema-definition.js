const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema Definition
const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]!
    posts: [Post!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }

  type Subscription {
    userCreated: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
    createdAt: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    createdAt: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }
`;

// Sample Data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2024-01-02' },
];

const posts = [
  { id: '1', title: 'First Post', content: 'Content here', authorId: '1', published: true, createdAt: '2024-01-03' },
  { id: '2', title: 'Second Post', content: 'More content', authorId: '2', published: false, createdAt: '2024-01-04' },
];

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    users: () => users,
    posts: () => posts,
  },
  Mutation: {
    createUser: (_, { input }) => {
      const newUser = {
        id: String(users.length + 1),
        name: input.name,
        email: input.email,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      return newUser;
    },
    updateUser: (_, { id, input }) => {
      const user = users.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      if (input.name) user.name = input.name;
      if (input.email) user.email = input.email;
      return user;
    },
    deleteUser: (_, { id }) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return false;
      users.splice(index, 1);
      return true;
    },
  },
  User: {
    posts: (user) => posts.filter(p => p.authorId === user.id),
  },
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
};

// Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer().catch(console.error);

