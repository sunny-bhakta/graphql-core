const { ApolloServer, gql } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver } = require('graphql');

// Schema with directives
const typeDefs = gql`
  directive @upper on FIELD_DEFINITION
  directive @lower on FIELD_DEFINITION
  directive @deprecated(reason: String = "No longer supported") on FIELD_DEFINITION | ENUM_VALUE
  directive @auth(requires: Role = USER) on FIELD_DEFINITION | OBJECT
  directive @cache(maxAge: Int) on FIELD_DEFINITION
  directive @formatDate(format: String = "YYYY-MM-DD") on FIELD_DEFINITION

  enum Role {
    USER
    ADMIN
    MODERATOR
  }

  type Query {
    # Using built-in @skip and @include in queries
    user(id: ID!): User
    users: [User!]!
    
    # Protected query
    adminData: String @auth(requires: ADMIN)
    
    # Cached query
    cachedData: String @cache(maxAge: 3600)
  }

  type User {
    id: ID!
    name: String! @upper
    email: String! @lower
    role: Role!
    createdAt: String! @formatDate(format: "MM/DD/YYYY")
    oldField: String @deprecated(reason: "Use newField instead")
    newField: String!
    
    # Protected field
    secretData: String @auth(requires: ADMIN)
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: Role = USER
  }
`;

// Sample Data
const users = [
  {
    id: '1',
    name: 'john doe',
    email: 'JOHN@EXAMPLE.COM',
    role: 'USER',
    createdAt: '2024-01-01T00:00:00Z',
    newField: 'New value',
    secretData: 'Secret admin data',
  },
  {
    id: '2',
    name: 'jane smith',
    email: 'JANE@EXAMPLE.COM',
    role: 'ADMIN',
    createdAt: '2024-01-02T00:00:00Z',
    newField: 'Another value',
    secretData: 'More secret data',
  },
];

// Helper function to format dates
function formatDate(dateString, format) {
  const date = new Date(dateString);
  if (format === 'MM/DD/YYYY') {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  return date.toISOString().split('T')[0];
}

// Transform schema to apply directives
function upperDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(schema, fieldConfig, 'upper')?.[0];
      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === 'string') {
            return result.toUpperCase();
          }
          return result;
        };
      }
    },
  });
}

function lowerDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const lowerDirective = getDirective(schema, fieldConfig, 'lower')?.[0];
      if (lowerDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === 'string') {
            return result.toLowerCase();
          }
          return result;
        };
      }
    },
  });
}

function formatDateDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const formatDateDirective = getDirective(schema, fieldConfig, 'formatDate')?.[0];
      if (formatDateDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (result && formatDateDirective.format) {
            return formatDate(result, formatDateDirective.format);
          }
          return result;
        };
      }
    },
  });
}

function authDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];
      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          // Check authentication
          if (!context.user) {
            throw new Error('Authentication required');
          }
          
          // Check authorization
          const requiredRole = authDirective.requires || 'USER';
          const userRole = context.user.role || 'USER';
          
          const roleHierarchy = { USER: 1, MODERATOR: 2, ADMIN: 3 };
          if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
            throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
          }
          
          return resolve(source, args, context, info);
        };
      }
    },
  });
}

// Resolvers
const resolvers = {
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
    users: () => users,
    adminData: () => 'This is admin-only data',
    cachedData: () => {
      console.log('Cache miss - fetching data');
      return 'This data is cached';
    },
  },
  Mutation: {
    createUser: (_, { input }) => {
      const newUser = {
        id: String(users.length + 1),
        name: input.name,
        email: input.email,
        role: input.role || 'USER',
        createdAt: new Date().toISOString(),
        newField: 'New user',
        secretData: 'Secret',
      };
      users.push(newUser);
      return newUser;
    },
  },
};

// Context with user (simulated)
const context = async ({ req }) => {
  // In real app, extract from JWT token
  // For demo, simulate different users
  const authHeader = req.headers.authorization;
  
  if (authHeader === 'Bearer admin-token') {
    return { user: { id: '1', role: 'ADMIN' } };
  } else if (authHeader === 'Bearer user-token') {
    return { user: { id: '2', role: 'USER' } };
  }
  
  return { user: null };
};

// Example Queries and Mutations

/*
# Using @skip and @include directives
query GetUser($id: ID!, $hideEmail: Boolean!, $showRole: Boolean!) {
  user(id: $id) {
    id
    name
    email @skip(if: $hideEmail)
    role @include(if: $showRole)
  }
}

# Query with deprecated field (will show warning)
query {
  user(id: "1") {
    id
    name
    oldField
    newField
  }
}

# Query protected field (requires auth)
query {
  user(id: "1") {
    id
    name
    secretData
  }
}

# Query admin data (requires ADMIN role)
query {
  adminData
}

# Query with cached data
query {
  cachedData
}
*/

// Server Setup
async function startServer() {
  const { makeExecutableSchema } = require('@graphql-tools/schema');
  
  let schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  
  // Apply directive transformers
  schema = upperDirectiveTransformer(schema);
  schema = lowerDirectiveTransformer(schema);
  schema = formatDateDirectiveTransformer(schema);
  schema = authDirectiveTransformer(schema);
  
  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4006 },
    context,
  });

  console.log(`🚀 Directives Server ready at: ${url}`);
  console.log(`\nTry these queries:`);
  console.log(`1. { user(id: "1") { id name email createdAt } }`);
  console.log(`2. { user(id: "1") { id name secretData } } (requires auth header: Authorization: Bearer admin-token)`);
  console.log(`3. { adminData } (requires admin role)`);
}

startServer().catch(console.error);

