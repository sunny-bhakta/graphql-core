const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema with Enums
const typeDefs = gql`
  # Enums
  enum Role {
    USER
    ADMIN
    MODERATOR
  }

  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
    DELETED @deprecated(reason: "Posts are soft-deleted now")
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    PENDING
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum NotificationType {
    EMAIL
    PUSH
    SMS
    IN_APP
  }

  type Query {
    users(role: Role, status: UserStatus): [User!]!
    posts(status: PostStatus): [Post!]!
    notifications(type: NotificationType): [Notification!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUserStatus(id: ID!, status: UserStatus!): User!
    createPost(input: CreatePostInput!): Post!
    updatePostStatus(id: ID!, status: PostStatus!): Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    status: UserStatus!
    createdAt: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    status: PostStatus!
    author: User!
    createdAt: String!
  }

  type Notification {
    id: ID!
    message: String!
    type: NotificationType!
    user: User!
    read: Boolean!
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: Role = USER
    status: UserStatus = PENDING
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
    status: PostStatus = DRAFT
  }
`;

// Sample Data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'MODERATOR',
    status: 'INACTIVE',
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'USER',
    status: 'PENDING',
    createdAt: '2024-01-04',
  },
];

const posts = [
  {
    id: '1',
    title: 'Post 1',
    content: 'Content 1',
    status: 'PUBLISHED',
    authorId: '1',
    createdAt: '2024-01-05',
  },
  {
    id: '2',
    title: 'Post 2',
    content: 'Content 2',
    status: 'DRAFT',
    authorId: '1',
    createdAt: '2024-01-06',
  },
  {
    id: '3',
    title: 'Post 3',
    content: 'Content 3',
    status: 'ARCHIVED',
    authorId: '2',
    createdAt: '2024-01-07',
  },
];

const notifications = [
  {
    id: '1',
    message: 'Welcome!',
    type: 'EMAIL',
    userId: '1',
    read: false,
  },
  {
    id: '2',
    message: 'New comment',
    type: 'PUSH',
    userId: '1',
    read: true,
  },
  {
    id: '3',
    message: 'Account verified',
    type: 'IN_APP',
    userId: '2',
    read: false,
  },
];

// Resolvers
const resolvers = {
  Query: {
    users: (_, { role, status }) => {
      let result = users;
      if (role) {
        result = result.filter(u => u.role === role);
      }
      if (status) {
        result = result.filter(u => u.status === status);
      }
      return result;
    },
    
    posts: (_, { status }) => {
      if (status) {
        return posts.filter(p => p.status === status);
      }
      return posts;
    },
    
    notifications: (_, { type }) => {
      if (type) {
        return notifications.filter(n => n.type === type);
      }
      return notifications;
    },
  },
  
  Mutation: {
    createUser: (_, { input }) => {
      const newUser = {
        id: String(users.length + 1),
        name: input.name,
        email: input.email,
        role: input.role || 'USER',
        status: input.status || 'PENDING',
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      return newUser;
    },
    
    updateUserStatus: (_, { id, status }) => {
      const user = users.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      user.status = status;
      return user;
    },
    
    createPost: (_, { input }) => {
      const newPost = {
        id: String(posts.length + 1),
        title: input.title,
        content: input.content,
        status: input.status || 'DRAFT',
        authorId: input.authorId,
        createdAt: new Date().toISOString(),
      };
      posts.push(newPost);
      return newPost;
    },
    
    updatePostStatus: (_, { id, status }) => {
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      post.status = status;
      return post;
    },
  },
  
  User: {
    // Enum fields are automatically resolved from data
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
  
  Notification: {
    user: (notification) => users.find(u => u.id === notification.userId),
  },
};

// Example Queries and Mutations

/*
# Query with Enum Filter
query {
  users(role: ADMIN) {
    id
    name
    role
    status
  }
}

# Query with Multiple Enum Filters
query {
  users(role: USER, status: ACTIVE) {
    id
    name
    email
    role
    status
  }
}

# Query Posts by Status
query {
  posts(status: PUBLISHED) {
    id
    title
    status
    author {
      name
    }
  }
}

# Query Notifications by Type
query {
  notifications(type: PUSH) {
    id
    message
    type
    read
  }
}

# Mutation with Enum Input
mutation {
  createUser(input: {
    name: "New User"
    email: "new@example.com"
    role: USER
    status: PENDING
  }) {
    id
    name
    role
    status
  }
}

# Mutation to Update Enum Field
mutation {
  updateUserStatus(id: "4", status: ACTIVE) {
    id
    name
    status
  }
}

# Mutation with Enum Variables
mutation UpdatePostStatus($id: ID!, $status: PostStatus!) {
  updatePostStatus(id: $id, status: $status) {
    id
    title
    status
  }
}

Variables:
{
  "id": "2",
  "status": "PUBLISHED"
}

# Query All Enum Values
query {
  users {
    id
    name
    role
    status
  }
  posts {
    id
    title
    status
  }
  notifications {
    id
    type
    message
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
    listen: { port: 4012 },
  });

  console.log(`🚀 Enums Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { users(role: ADMIN) { id name role } }`);
  console.log(`2. { posts(status: PUBLISHED) { id title status } }`);
  console.log(`3. mutation { createUser(input: { name: "Test", email: "test@example.com", role: USER }) { id role } }`);
}

startServer().catch(console.error);

