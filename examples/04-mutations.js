const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema
const typeDefs = gql`
  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    # Create mutations
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
    
    # Update mutations
    updateUser(id: ID!, input: UpdateUserInput!): User!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    
    # Delete mutations
    deleteUser(id: ID!): Boolean!
    deletePost(id: ID!): Boolean!
    
    # Complex mutations
    publishPost(id: ID!): Post!
    unpublishPost(id: ID!): Post!
    
    # Mutation with custom response
    createUserWithResponse(input: CreateUserInput!): UserPayload!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    createdAt: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    views: Int!
    createdAt: String!
  }

  # Input Types
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

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
  }

  input UpdatePostInput {
    title: String
    content: String
  }

  # Custom Response Type
  type UserPayload {
    success: Boolean!
    message: String
    user: User
    errors: [String!]
  }
`;

// Sample Data (in-memory store)
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    createdAt: '2024-01-02',
  },
];

let posts = [
  {
    id: '1',
    title: 'First Post',
    content: 'Content here',
    authorId: '1',
    published: false,
    views: 0,
    createdAt: '2024-01-03',
  },
];

let nextUserId = 3;
let nextPostId = 2;

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(u => u.id === id),
    posts: () => posts,
    post: (_, { id }) => posts.find(p => p.id === id),
  },
  
  Mutation: {
    // Create User
    createUser: (_, { input }) => {
      // Check if email already exists
      const existingUser = users.find(u => u.email === input.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const newUser = {
        id: String(nextUserId++),
        name: input.name,
        email: input.email,
        age: input.age || null,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      return newUser;
    },
    
    // Update User
    updateUser: (_, { id, input }) => {
      const user = users.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (input.name !== undefined) user.name = input.name;
      if (input.email !== undefined) user.email = input.email;
      if (input.age !== undefined) user.age = input.age;
      
      return user;
    },
    
    // Delete User
    deleteUser: (_, { id }) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }
      
      // Also delete user's posts
      posts = posts.filter(p => p.authorId !== id);
      users.splice(index, 1);
      return true;
    },
    
    // Create Post
    createPost: (_, { input }) => {
      const author = users.find(u => u.id === input.authorId);
      if (!author) {
        throw new Error('Author not found');
      }
      
      const newPost = {
        id: String(nextPostId++),
        title: input.title,
        content: input.content,
        authorId: input.authorId,
        published: false,
        views: 0,
        createdAt: new Date().toISOString(),
      };
      
      posts.push(newPost);
      return newPost;
    },
    
    // Update Post
    updatePost: (_, { id, input }) => {
      const post = posts.find(p => p.id === id);
      if (!post) {
        throw new Error('Post not found');
      }
      
      if (input.title !== undefined) post.title = input.title;
      if (input.content !== undefined) post.content = input.content;
      
      return post;
    },
    
    // Delete Post
    deletePost: (_, { id }) => {
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Post not found');
      }
      
      posts.splice(index, 1);
      return true;
    },
    
    // Publish Post
    publishPost: (_, { id }) => {
      const post = posts.find(p => p.id === id);
      if (!post) {
        throw new Error('Post not found');
      }
      
      post.published = true;
      return post;
    },
    
    // Unpublish Post
    unpublishPost: (_, { id }) => {
      const post = posts.find(p => p.id === id);
      if (!post) {
        throw new Error('Post not found');
      }
      
      post.published = false;
      return post;
    },
    
    // Create User with Custom Response
    createUserWithResponse: (_, { input }) => {
      const errors = [];
      
      // Validation
      if (!input.name || input.name.length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      
      if (!input.email || !input.email.includes('@')) {
        errors.push('Invalid email format');
      }
      
      if (errors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          user: null,
          errors,
        };
      }
      
      // Check if email exists
      const existingUser = users.find(u => u.email === input.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists',
          user: null,
          errors: ['Email already in use'],
        };
      }
      
      const newUser = {
        id: String(nextUserId++),
        name: input.name,
        email: input.email,
        age: input.age || null,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      
      return {
        success: true,
        message: 'User created successfully',
        user: newUser,
        errors: [],
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

// Example Mutations to Test

/*
# Create User
mutation {
  createUser(input: {
    name: "Alice Johnson"
    email: "alice@example.com"
    age: 28
  }) {
    id
    name
    email
    age
  }
}

# Update User
mutation {
  updateUser(id: "1", input: {
    name: "John Updated"
    age: 31
  }) {
    id
    name
    age
  }
}

# Delete User
mutation {
  deleteUser(id: "1")
}

# Create Post
mutation {
  createPost(input: {
    title: "New Post"
    content: "Post content here"
    authorId: "1"
  }) {
    id
    title
    author {
      name
    }
  }
}

# Publish Post
mutation {
  publishPost(id: "1") {
    id
    published
  }
}

# Mutation with Variables
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# Mutation with Custom Response
mutation {
  createUserWithResponse(input: {
    name: "Bob"
    email: "bob@example.com"
  }) {
    success
    message
    user {
      id
      name
    }
    errors
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
    listen: { port: 4003 },
  });

  console.log(`🚀 Mutations Server ready at: ${url}`);
  console.log(`\nTry these mutations:`);
  console.log(`1. mutation { createUser(input: { name: "Test", email: "test@example.com" }) { id name } }`);
  console.log(`2. mutation { updateUser(id: "1", input: { name: "Updated" }) { id name } }`);
}

startServer().catch(console.error);

