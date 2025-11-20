const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema with Interfaces
const typeDefs = gql`
  # Basic Interface
  interface Node {
    id: ID!
  }

  # Interface with fields
  interface Timestamped {
    createdAt: String!
    updatedAt: String!
  }

  # Interface for searchable items
  interface Searchable {
    title: String!
    description: String
  }

  type Query {
    nodes: [Node!]!
    timestampedItems: [Timestamped!]!
    searchableItems: [Searchable!]!
    search(query: String!): [Searchable!]!
  }

  # Types implementing interfaces
  type User implements Node & Timestamped {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String!
    posts: [Post!]!
  }

  type Post implements Node & Timestamped & Searchable {
    id: ID!
    title: String!
    content: String!
    description: String
    author: User!
    createdAt: String!
    updatedAt: String!
    published: Boolean!
  }

  type Comment implements Node & Timestamped {
    id: ID!
    content: String!
    post: Post!
    author: User!
    createdAt: String!
    updatedAt: String!
  }

  type Article implements Node & Timestamped & Searchable {
    id: ID!
    title: String!
    content: String!
    description: String
    author: User!
    createdAt: String!
    updatedAt: String!
    published: Boolean!
    tags: [String!]!
  }
`;

// Sample Data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

const posts = [
  {
    id: '1',
    title: 'GraphQL Interfaces',
    content: 'Learning about interfaces...',
    description: 'A post about GraphQL interfaces',
    authorId: '1',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
    published: true,
  },
  {
    id: '2',
    title: 'Advanced GraphQL',
    content: 'Advanced concepts...',
    description: 'Advanced GraphQL topics',
    authorId: '2',
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04',
    published: false,
  },
];

const comments = [
  {
    id: '1',
    content: 'Great post!',
    postId: '1',
    authorId: '2',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
];

const articles = [
  {
    id: '1',
    title: 'GraphQL Best Practices',
    content: 'Best practices article...',
    description: 'A comprehensive guide to GraphQL best practices',
    authorId: '1',
    createdAt: '2024-01-06',
    updatedAt: '2024-01-06',
    published: true,
    tags: ['graphql', 'best-practices'],
  },
];

// Resolvers
const resolvers = {
  Query: {
    nodes: () => {
      return [...users, ...posts, ...comments, ...articles];
    },
    
    timestampedItems: () => {
      return [...users, ...posts, ...comments, ...articles];
    },
    
    searchableItems: () => {
      return [...posts, ...articles];
    },
    
    search: (_, { query }) => {
      const q = query.toLowerCase();
      const results = [];
      
      posts.forEach(post => {
        if (post.title.toLowerCase().includes(q) || 
            post.description?.toLowerCase().includes(q)) {
          results.push(post);
        }
      });
      
      articles.forEach(article => {
        if (article.title.toLowerCase().includes(q) || 
            article.description?.toLowerCase().includes(q)) {
          results.push(article);
        }
      });
      
      return results;
    },
  },
  
  // Type resolvers for interfaces
  Node: {
    __resolveType(obj) {
      if (obj.email) return 'User';
      if (obj.content && obj.postId) return 'Comment';
      if (obj.tags) return 'Article';
      if (obj.title && obj.authorId) return 'Post';
      return null;
    },
  },
  
  Timestamped: {
    __resolveType(obj) {
      if (obj.email) return 'User';
      if (obj.content && obj.postId) return 'Comment';
      if (obj.tags) return 'Article';
      if (obj.title && obj.authorId) return 'Post';
      return null;
    },
  },
  
  Searchable: {
    __resolveType(obj) {
      if (obj.tags) return 'Article';
      if (obj.title && obj.authorId) return 'Post';
      return null;
    },
  },
  
  User: {
    posts: (user) => posts.filter(p => p.authorId === user.id),
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
  },
  
  Comment: {
    post: (comment) => posts.find(p => p.id === comment.postId),
    author: (comment) => users.find(u => u.id === comment.authorId),
  },
  
  Article: {
    author: (article) => users.find(u => u.id === article.authorId),
  },
};

// Example Queries

/*
# Query Interface Fields
query {
  nodes {
    id
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
    ... on Comment {
      content
    }
    ... on Article {
      title
      tags
    }
  }
}

# Query Timestamped Interface
query {
  timestampedItems {
    createdAt
    updatedAt
    ... on User {
      id
      name
    }
    ... on Post {
      id
      title
    }
  }
}

# Query Searchable Interface
query {
  searchableItems {
    title
    description
    ... on Post {
      id
      published
    }
    ... on Article {
      id
      tags
    }
  }
}

# Search Query
query {
  search(query: "GraphQL") {
    title
    description
    ... on Post {
      id
      author {
        name
      }
    }
    ... on Article {
      id
      tags
    }
  }
}

# Complex Query with Multiple Interfaces
query {
  nodes {
    id
    ... on Timestamped {
      createdAt
      updatedAt
    }
    ... on User {
      name
      email
      posts {
        id
        title
      }
    }
    ... on Post {
      title
      content
      author {
        name
      }
    }
    ... on Searchable {
      title
      description
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
    listen: { port: 4010 },
  });

  console.log(`🚀 Interfaces Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { nodes { id ... on User { name } ... on Post { title } } }`);
  console.log(`2. { search(query: "GraphQL") { title ... on Post { id } } }`);
}

startServer().catch(console.error);

