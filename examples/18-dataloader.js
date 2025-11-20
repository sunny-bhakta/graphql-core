const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const DataLoader = require('dataloader');

// Schema
const typeDefs = gql`
  type Query {
    users: [User!]!
    posts: [Post!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
    profile: Profile
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
  }

  type Profile {
    id: ID!
    bio: String
    website: String
    userId: ID!
  }
`;

// Simulate Database
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
];

const posts = [
  { id: '1', title: 'Post 1', content: 'Content 1', authorId: '1' },
  { id: '2', title: 'Post 2', content: 'Content 2', authorId: '1' },
  { id: '3', title: 'Post 3', content: 'Content 3', authorId: '2' },
  { id: '4', title: 'Post 4', content: 'Content 4', authorId: '3' },
];

const comments = [
  { id: '1', content: 'Comment 1', authorId: '2', postId: '1' },
  { id: '2', content: 'Comment 2', authorId: '3', postId: '1' },
  { id: '3', content: 'Comment 3', authorId: '1', postId: '2' },
];

const profiles = [
  { id: '1', bio: 'Developer', website: 'https://johndoe.com', userId: '1' },
  { id: '2', bio: 'Designer', website: 'https://janesmith.com', userId: '2' },
];

// Simulate async database calls with logging
let userQueryCount = 0;
let postQueryCount = 0;
let commentQueryCount = 0;
let profileQueryCount = 0;

async function getUsersByIds(userIds) {
  userQueryCount++;
  console.log(`[Database] Fetching users: ${userIds.join(', ')} (Query #${userQueryCount})`);
  await new Promise(resolve => setTimeout(resolve, 10)); // Simulate DB delay
  return userIds.map(id => users.find(u => u.id === id));
}

async function getPostsByUserIds(userIds) {
  postQueryCount++;
  console.log(`[Database] Fetching posts for users: ${userIds.join(', ')} (Query #${postQueryCount})`);
  await new Promise(resolve => setTimeout(resolve, 10));
  const userPostsMap = {};
  userIds.forEach(userId => {
    userPostsMap[userId] = posts.filter(p => p.authorId === userId);
  });
  return userIds.map(userId => userPostsMap[userId] || []);
}

async function getCommentsByPostIds(postIds) {
  commentQueryCount++;
  console.log(`[Database] Fetching comments for posts: ${postIds.join(', ')} (Query #${commentQueryCount})`);
  await new Promise(resolve => setTimeout(resolve, 10));
  const postCommentsMap = {};
  postIds.forEach(postId => {
    postCommentsMap[postId] = comments.filter(c => c.postId === postId);
  });
  return postIds.map(postId => postCommentsMap[postId] || []);
}

async function getProfilesByUserIds(userIds) {
  profileQueryCount++;
  console.log(`[Database] Fetching profiles for users: ${userIds.join(', ')} (Query #${profileQueryCount})`);
  await new Promise(resolve => setTimeout(resolve, 10));
  return userIds.map(userId => profiles.find(p => p.userId === userId) || null);
}

// Create DataLoaders
function createDataLoaders() {
  return {
    userLoader: new DataLoader(getUsersByIds),
    userPostsLoader: new DataLoader(getPostsByUserIds),
    postCommentsLoader: new DataLoader(getCommentsByPostIds),
    userProfileLoader: new DataLoader(getProfilesByUserIds),
  };
}

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
    posts: () => posts,
  },
  
  User: {
    // Using DataLoader to batch post queries
    posts: async (user, _, { dataLoaders }) => {
      return await dataLoaders.userPostsLoader.load(user.id);
    },
    
    // Using DataLoader to batch profile queries
    profile: async (user, _, { dataLoaders }) => {
      return await dataLoaders.userProfileLoader.load(user.id);
    },
  },
  
  Post: {
    // Using DataLoader to batch user queries
    author: async (post, _, { dataLoaders }) => {
      return await dataLoaders.userLoader.load(post.authorId);
    },
    
    // Using DataLoader to batch comment queries
    comments: async (post, _, { dataLoaders }) => {
      return await dataLoaders.postCommentsLoader.load(post.id);
    },
  },
  
  Comment: {
    // Using DataLoader to batch user queries
    author: async (comment, _, { dataLoaders }) => {
      return await dataLoaders.userLoader.load(comment.authorId);
    },
    
    // Using DataLoader to batch post queries
    post: async (comment, _, { dataLoaders }) => {
      const post = posts.find(p => p.id === comment.postId);
      return post;
    },
  },
};

// Context with DataLoaders
const context = async ({ req }) => {
  // Create new DataLoaders for each request
  // This ensures caching is scoped to a single request
  return {
    dataLoaders: createDataLoaders(),
  };
};

// Example Queries

/*
# Query that demonstrates DataLoader batching
query {
  users {
    id
    name
    posts {
      id
      title
      comments {
        id
        content
        author {
          name
        }
      }
    }
    profile {
      bio
    }
  }
}

# This query would trigger:
# - 1 query to get all users
# - 1 batched query to get all posts for all users
# - 1 batched query to get all comments for all posts
# - 1 batched query to get all profiles for all users
# - 1 batched query to get all authors for all comments
#
# Without DataLoader, this would be many more queries!
*/

// Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4017 },
    context,
  });

  console.log(`🚀 DataLoader Server ready at: ${url}`);
  console.log(`\nTry this query to see DataLoader batching:`);
  console.log(`{ users { id name posts { id title comments { id author { name } } } profile { bio } } }`);
  console.log(`\nWatch the console to see how queries are batched!`);
}

startServer().catch(console.error);

