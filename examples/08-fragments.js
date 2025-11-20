const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema
const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
    posts: [Post!]!
    search(query: String!): [SearchResult!]!
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
    published: Boolean!
    tags: [String!]!
  }

  type Profile {
    bio: String
    website: String
    avatar: String
  }

  union SearchResult = User | Post
`;

// Sample Data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    profile: { bio: 'Developer', website: 'https://johndoe.com', avatar: 'avatar1.jpg' },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    profile: { bio: 'Designer', website: 'https://janesmith.com', avatar: 'avatar2.jpg' },
  },
];

const posts = [
  {
    id: '1',
    title: 'GraphQL Fragments',
    content: 'Learning about fragments...',
    authorId: '1',
    published: true,
    tags: ['graphql', 'tutorial'],
  },
  {
    id: '2',
    title: 'Advanced GraphQL',
    content: 'Advanced concepts...',
    authorId: '2',
    published: true,
    tags: ['graphql', 'advanced'],
  },
];

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    users: () => users,
    post: (_, { id }) => posts.find(p => p.id === id),
    posts: () => posts,
    search: (_, { query }) => {
      const q = query.toLowerCase();
      const userResults = users.filter(u => 
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
      const postResults = posts.filter(p => 
        p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      );
      return [...userResults, ...postResults];
    },
  },
  User: {
    posts: (user) => posts.filter(p => p.authorId === user.id),
  },
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
  SearchResult: {
    __resolveType(obj) {
      if (obj.email) return 'User';
      if (obj.title) return 'Post';
      return null;
    },
  },
};

// Example Queries with Fragments

/*
# Basic Fragment
query {
  user(id: "1") {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  name
  email
}

# Fragment with Nested Fields
query {
  user(id: "1") {
    ...UserWithPosts
  }
}

fragment UserWithPosts on User {
  id
  name
  email
  posts {
    id
    title
    content
  }
}

# Multiple Fragments
query {
  user(id: "1") {
    ...UserBasicInfo
    ...UserPosts
  }
}

fragment UserBasicInfo on User {
  id
  name
  email
}

fragment UserPosts on User {
  posts {
    id
    title
  }
}

# Fragment Composition
query {
  user(id: "1") {
    ...UserComplete
  }
}

fragment UserComplete on User {
  ...UserBasicInfo
  ...UserProfile
  ...UserPosts
}

fragment UserBasicInfo on User {
  id
  name
  email
}

fragment UserProfile on User {
  profile {
    bio
    website
  }
}

fragment UserPosts on User {
  posts {
    ...PostFields
  }
}

fragment PostFields on Post {
  id
  title
  content
  published
}

# Inline Fragments (for Unions)
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
  }
}

# Inline Fragments with Type Conditions
query {
  search(query: "john") {
    ... on User {
      id
      name
      email
      posts {
        id
        title
      }
    }
    ... on Post {
      id
      title
      author {
        id
        name
      }
    }
  }
}

# Fragment with Variables
query GetUserWithPosts($userId: ID!) {
  user(id: $userId) {
    ...UserFields
    posts {
      ...PostFields
    }
  }
}

fragment UserFields on User {
  id
  name
  email
}

fragment PostFields on Post {
  id
  title
  content
  published
}
*/

// Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4007 },
  });

  console.log(`🚀 Fragments Server ready at: ${url}`);
  console.log(`\nTry these queries with fragments:`);
  console.log(`1. query { user(id: "1") { ...UserFields } } fragment UserFields on User { id name email }`);
  console.log(`2. query { search(query: "graphql") { ... on User { id name } ... on Post { id title } } }`);
}

startServer().catch(console.error);

