const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema
const typeDefs = gql`
  type Query {
    # Queries with variables
    user(id: ID!): User
    users(limit: Int, offset: Int, filter: UserFilter): [User!]!
    posts(limit: Int = 10, offset: Int = 0, published: Boolean): [Post!]!
    search(query: String!, limit: Int = 5): [SearchResult!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    role: Role!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
  }

  enum Role {
    USER
    ADMIN
    MODERATOR
  }

  input UserFilter {
    role: Role
    minAge: Int
    maxAge: Int
    search: String
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
    role: Role = USER
  }

  input UpdateUserInput {
    name: String
    email: String
    age: Int
    role: Role
  }

  union SearchResult = User | Post
`;

// Sample Data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, role: 'USER' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, role: 'ADMIN' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'MODERATOR' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', age: 28, role: 'USER' },
];

const posts = [
  { id: '1', title: 'Post 1', content: 'Content 1', authorId: '1', published: true },
  { id: '2', title: 'Post 2', content: 'Content 2', authorId: '1', published: false },
  { id: '3', title: 'Post 3', content: 'Content 3', authorId: '2', published: true },
];

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    
    users: (_, { limit, offset, filter }) => {
      let result = [...users];
      
      // Apply filters
      if (filter) {
        if (filter.role) {
          result = result.filter(u => u.role === filter.role);
        }
        if (filter.minAge !== undefined) {
          result = result.filter(u => u.age >= filter.minAge);
        }
        if (filter.maxAge !== undefined) {
          result = result.filter(u => u.age <= filter.maxAge);
        }
        if (filter.search) {
          const search = filter.search.toLowerCase();
          result = result.filter(u => 
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
          );
        }
      }
      
      // Apply pagination
      if (offset) {
        result = result.slice(offset);
      }
      if (limit) {
        result = result.slice(0, limit);
      }
      
      return result;
    },
    
    posts: (_, { limit = 10, offset = 0, published }) => {
      let result = [...posts];
      
      if (published !== undefined) {
        result = result.filter(p => p.published === published);
      }
      
      return result.slice(offset, offset + limit);
    },
    
    search: (_, { query, limit = 5 }) => {
      const q = query.toLowerCase();
      const userResults = users.filter(u => 
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
      const postResults = posts.filter(p => 
        p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      );
      return [...userResults, ...postResults].slice(0, limit);
    },
  },
  
  Mutation: {
    createUser: (_, { input }) => {
      const newUser = {
        id: String(users.length + 1),
        name: input.name,
        email: input.email,
        age: input.age || null,
        role: input.role || 'USER',
      };
      users.push(newUser);
      return newUser;
    },
    
    updateUser: (_, { id, input }) => {
      const user = users.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      
      if (input.name !== undefined) user.name = input.name;
      if (input.email !== undefined) user.email = input.email;
      if (input.age !== undefined) user.age = input.age;
      if (input.role !== undefined) user.role = input.role;
      
      return user;
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

// Example Queries with Variables

/*
# Query with Required Variable
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
  }
}

Variables:
{
  "userId": "1"
}

# Query with Optional Variables
query GetUsers($limit: Int, $offset: Int) {
  users(limit: $limit, offset: $offset) {
    id
    name
    email
  }
}

Variables:
{
  "limit": 5,
  "offset": 0
}

# Query with Default Values
query GetPosts($limit: Int = 10, $offset: Int = 0, $published: Boolean) {
  posts(limit: $limit, offset: $offset, published: $published) {
    id
    title
    published
  }
}

Variables:
{
  "published": true
}

# Query with Input Type Variable
query GetFilteredUsers($filter: UserFilter!) {
  users(filter: $filter) {
    id
    name
    email
    age
    role
  }
}

Variables:
{
  "filter": {
    "role": "ADMIN",
    "minAge": 25,
    "maxAge": 35
  }
}

# Mutation with Input Type
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    role
  }
}

Variables:
{
  "input": {
    "name": "New User",
    "email": "newuser@example.com",
    "age": 30,
    "role": "USER"
  }
}

# Mutation with Multiple Variables
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    age
    role
  }
}

Variables:
{
  "id": "1",
  "input": {
    "name": "Updated Name",
    "age": 31
  }
}

# Query with Variables and Directives
query GetUser($userId: ID!, $includePosts: Boolean!, $includeAge: Boolean!) {
  user(id: $userId) {
    id
    name
    email
    age @include(if: $includeAge)
    posts @include(if: $includePosts) {
      id
      title
    }
  }
}

Variables:
{
  "userId": "1",
  "includePosts": true,
  "includeAge": false
}
*/

// Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4008 },
  });

  console.log(`🚀 Variables Server ready at: ${url}`);
  console.log(`\nTry these queries with variables:`);
  console.log(`1. query GetUser($userId: ID!) { user(id: $userId) { id name } }`);
  console.log(`   Variables: { "userId": "1" }`);
  console.log(`2. query GetUsers($limit: Int = 10) { users(limit: $limit) { id name } }`);
}

startServer().catch(console.error);

