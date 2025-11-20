const { ApolloServer, gql } = require('@apollo/server');
const { createServer } = require('http');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const express = require('express');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

// Schema
const typeDefs = gql`
  type Query {
    users: [User!]!
    posts: [Post!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
  }

  type Subscription {
    userCreated: User!
    postCreated: Post!
    postUpdated: Post!
    postDeleted: ID!
    userPosts(userId: ID!): Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }
`;

// Sample Data
let users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

let posts = [
  { id: '1', title: 'First Post', content: 'Content', authorId: '1', published: true },
];

let nextUserId = 3;
let nextPostId = 2;

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
    posts: () => posts,
  },
  
  Mutation: {
    createUser: (_, { input }) => {
      const newUser = {
        id: String(nextUserId++),
        name: input.name,
        email: input.email,
      };
      users.push(newUser);
      
      // Publish subscription event
      pubsub.publish('USER_CREATED', { userCreated: newUser });
      
      return newUser;
    },
    
    createPost: (_, { input }) => {
      const newPost = {
        id: String(nextPostId++),
        title: input.title,
        content: input.content,
        authorId: input.authorId,
        published: false,
      };
      posts.push(newPost);
      
      // Publish subscription event
      pubsub.publish('POST_CREATED', { postCreated: newPost });
      
      // Publish to user-specific subscription if needed
      pubsub.publish(`USER_POSTS_${input.authorId}`, {
        userPosts: newPost,
      });
      
      return newPost;
    },
    
    updatePost: (_, { id, input }) => {
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      
      if (input.title !== undefined) post.title = input.title;
      if (input.content !== undefined) post.content = input.content;
      if (input.published !== undefined) post.published = input.published;
      
      // Publish subscription event
      pubsub.publish('POST_UPDATED', { postUpdated: post });
      
      return post;
    },
  },
  
  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(['USER_CREATED']),
    },
    
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED']),
    },
    
    postUpdated: {
      subscribe: () => pubsub.asyncIterator(['POST_UPDATED']),
    },
    
    postDeleted: {
      subscribe: () => pubsub.asyncIterator(['POST_DELETED']),
    },
    
    userPosts: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator([`USER_POSTS_${userId}`]);
      },
    },
  },
  
  User: {
    posts: (user) => posts.filter(p => p.authorId === user.id),
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
};

// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Setup Express server
const app = express();
const httpServer = createServer(app);

// Create Apollo Server
const server = new ApolloServer({
  schema,
});

// Start server
async function startServer() {
  await server.start();
  
  app.use('/graphql', express.json(), expressMiddleware(server));
  
  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  
  const serverCleanup = useServer({ schema }, wsServer);
  
  httpServer.listen(4004, () => {
    console.log(`🚀 Subscriptions Server ready at: http://localhost:4004/graphql`);
    console.log(`📡 WebSocket server ready for subscriptions`);
    console.log(`\nTry these subscriptions:`);
    console.log(`1. subscription { userCreated { id name email } }`);
    console.log(`2. subscription { postCreated { id title author { name } } }`);
    console.log(`3. subscription { postUpdated { id title published } }`);
  });
}

startServer().catch(console.error);

