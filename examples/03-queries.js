const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema
const typeDefs = gql`
  type Query {
    # Simple queries
    hello: String!
    users: [User!]!
    posts: [Post!]!
    
    # Queries with arguments
    user(id: ID!): User
    post(id: ID!): Post
    searchUsers(name: String!): [User!]!
    
    # Queries with multiple arguments
    userPosts(userId: ID!, limit: Int, offset: Int): [Post!]!
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
    views: Int!
    published: Boolean!
    createdAt: String!
  }

  type Profile {
    bio: String
    website: String
    avatar: String
  }
`;

// Sample Data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    posts: ['1', '2'],
    profile: { bio: 'Developer', website: 'https://johndoe.com', avatar: 'avatar1.jpg' },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    posts: ['3'],
    profile: { bio: 'Designer', website: 'https://janesmith.com', avatar: 'avatar2.jpg' },
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 35,
    posts: [],
    profile: null,
  },
];

const posts = [
  {
    id: '1',
    title: 'GraphQL Basics',
    content: 'Learning GraphQL...',
    authorId: '1',
    views: 100,
    published: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Advanced GraphQL',
    content: 'Advanced concepts...',
    authorId: '1',
    views: 50,
    published: true,
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    title: 'GraphQL Best Practices',
    content: 'Best practices...',
    authorId: '2',
    views: 200,
    published: false,
    createdAt: '2024-01-03',
  },
];

// Resolvers
const resolvers = {
  Query: {
    hello: () => 'Hello, GraphQL!',
    
    users: () => users,
    
    posts: () => posts,
    
    user: (_, { id }) => users.find(u => u.id === id),
    
    post: (_, { id }) => posts.find(p => p.id === id),
    
    searchUsers: (_, { name }) => {
      return users.filter(u => 
        u.name.toLowerCase().includes(name.toLowerCase())
      );
    },
    
    userPosts: (_, { userId, limit, offset }) => {
      let userPosts = posts.filter(p => p.authorId === userId);
      
      if (offset) {
        userPosts = userPosts.slice(offset);
      }
      
      if (limit) {
        userPosts = userPosts.slice(0, limit);
      }
      
      return userPosts;
    },
  },
  
  User: {
    posts: (user) => {
      return posts.filter(p => user.posts.includes(p.id));
    },
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
};

// Example Queries to Test

/*
# Simple Query
query {
  hello
}

# Query with nested fields
query {
  users {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

# Query with arguments
query {
  user(id: "1") {
    id
    name
    email
    posts {
      id
      title
      content
    }
  }
}

# Query with variables
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
  }
}

# Multiple queries
query {
  users {
    id
    name
  }
  posts {
    id
    title
  }
}

# Query with aliases
query {
  firstUser: user(id: "1") {
    name
  }
  secondUser: user(id: "2") {
    name
  }
}

# Search query
query {
  searchUsers(name: "John") {
    id
    name
    email
  }
}

# Query with multiple arguments
query {
  userPosts(userId: "1", limit: 1, offset: 0) {
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
    listen: { port: 4002 },
  });

  console.log(`🚀 Queries Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { hello }`);
  console.log(`2. { users { id name email } }`);
  console.log(`3. { user(id: "1") { id name posts { id title } } }`);
}

startServer().catch(console.error);

