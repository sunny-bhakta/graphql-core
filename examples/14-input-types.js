const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema with Input Types
const typeDefs = gql`
  type Query {
    users: [User!]!
    posts: [Post!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    createOrder(input: CreateOrderInput!): Order!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    address: Address
    role: Role!
    preferences: UserPreferences
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    tags: [String!]!
    metadata: PostMetadata
  }

  type Order {
    id: ID!
    items: [OrderItem!]!
    shipping: Address!
    billing: Address!
    total: Float!
    status: OrderStatus!
  }

  type OrderItem {
    productId: ID!
    quantity: Int!
    price: Float!
  }

  type Address {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
  }

  type UserPreferences {
    theme: String!
    notifications: Boolean!
    language: String!
  }

  type PostMetadata {
    views: Int!
    likes: Int!
    shares: Int!
  }

  enum Role {
    USER
    ADMIN
    MODERATOR
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  # Input Types
  input CreateUserInput {
    name: String!
    email: String!
    age: Int
    address: AddressInput
    role: Role = USER
    preferences: UserPreferencesInput
  }

  input UpdateUserInput {
    name: String
    email: String
    age: Int
    address: AddressInput
    preferences: UserPreferencesInput
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String! = "USA"
  }

  input UserPreferencesInput {
    theme: String = "light"
    notifications: Boolean = true
    language: String = "en"
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
    published: Boolean = false
    tags: [String!] = []
    metadata: PostMetadataInput
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
    tags: [String!]
    metadata: PostMetadataInput
  }

  input PostMetadataInput {
    views: Int = 0
    likes: Int = 0
    shares: Int = 0
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shipping: AddressInput!
    billing: AddressInput!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
    price: Float!
  }
`;

// Sample Data
const users = [];
const posts = [];
const orders = [];

let nextUserId = 1;
let nextPostId = 1;
let nextOrderId = 1;

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
        age: input.age || null,
        address: input.address || null,
        role: input.role || 'USER',
        preferences: input.preferences || {
          theme: 'light',
          notifications: true,
          language: 'en',
        },
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
      if (input.address !== undefined) user.address = input.address;
      if (input.preferences !== undefined) {
        user.preferences = { ...user.preferences, ...input.preferences };
      }
      
      return user;
    },
    
    createPost: (_, { input }) => {
      const author = users.find(u => u.id === input.authorId);
      if (!author) throw new Error('Author not found');
      
      const newPost = {
        id: String(nextPostId++),
        title: input.title,
        content: input.content,
        authorId: input.authorId,
        published: input.published || false,
        tags: input.tags || [],
        metadata: input.metadata || {
          views: 0,
          likes: 0,
          shares: 0,
        },
      };
      posts.push(newPost);
      return newPost;
    },
    
    updatePost: (_, { id, input }) => {
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      
      if (input.title !== undefined) post.title = input.title;
      if (input.content !== undefined) post.content = input.content;
      if (input.published !== undefined) post.published = input.published;
      if (input.tags !== undefined) post.tags = input.tags;
      if (input.metadata !== undefined) {
        post.metadata = { ...post.metadata, ...input.metadata };
      }
      
      return post;
    },
    
    createOrder: (_, { input }) => {
      const total = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const newOrder = {
        id: String(nextOrderId++),
        items: input.items,
        shipping: input.shipping,
        billing: input.billing,
        total,
        status: 'PENDING',
      };
      orders.push(newOrder);
      return newOrder;
    },
  },
  
  User: {
    address: (user) => user.address || null,
    preferences: (user) => user.preferences || null,
  },
  
  Post: {
    author: (post) => users.find(u => u.id === post.authorId),
    metadata: (post) => post.metadata || null,
  },
};

// Example Mutations

/*
# Create User with Input Type
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
    age: 30
    role: USER
  }) {
    id
    name
    email
    age
    role
  }
}

# Create User with Nested Input
mutation {
  createUser(input: {
    name: "Jane Smith"
    email: "jane@example.com"
    address: {
      street: "123 Main St"
      city: "New York"
      state: "NY"
      zipCode: "10001"
      country: "USA"
    }
    preferences: {
      theme: "dark"
      notifications: true
      language: "en"
    }
  }) {
    id
    name
    address {
      street
      city
      zipCode
    }
    preferences {
      theme
      language
    }
  }
}

# Create Post with Input Type
mutation {
  createPost(input: {
    title: "New Post"
    content: "Post content here"
    authorId: "1"
    published: true
    tags: ["graphql", "tutorial"]
    metadata: {
      views: 0
      likes: 0
      shares: 0
    }
  }) {
    id
    title
    published
    tags
    metadata {
      views
      likes
    }
  }
}

# Update User with Partial Input
mutation {
  updateUser(id: "1", input: {
    name: "John Updated"
    age: 31
    preferences: {
      theme: "dark"
    }
  }) {
    id
    name
    age
    preferences {
      theme
    }
  }
}

# Create Order with Complex Input
mutation {
  createOrder(input: {
    items: [
      {
        productId: "1"
        quantity: 2
        price: 29.99
      }
      {
        productId: "2"
        quantity: 1
        price: 49.99
      }
    ]
    shipping: {
      street: "123 Main St"
      city: "New York"
      state: "NY"
      zipCode: "10001"
      country: "USA"
    }
    billing: {
      street: "123 Main St"
      city: "New York"
      state: "NY"
      zipCode: "10001"
      country: "USA"
    }
  }) {
    id
    items {
      productId
      quantity
      price
    }
    total
    status
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

Variables:
{
  "input": {
    "name": "Test User",
    "email": "test@example.com",
    "age": 25,
    "role": "USER"
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
    listen: { port: 4013 },
  });

  console.log(`🚀 Input Types Server ready at: ${url}`);
  console.log(`\nTry these mutations:`);
  console.log(`1. mutation { createUser(input: { name: "Test", email: "test@example.com" }) { id name } }`);
  console.log(`2. mutation { createPost(input: { title: "Post", content: "Content", authorId: "1" }) { id title } }`);
}

startServer().catch(console.error);

