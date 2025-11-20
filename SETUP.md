# Setup Guide

This guide will help you set up and run the GraphQL concepts examples.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

## Running Examples

Each example is a standalone GraphQL server. You can run them individually:

### Individual Examples

```bash
# Schema Definition
node examples/01-schema-definition.js

# Types
node examples/02-types.js

# Queries
node examples/03-queries.js

# Mutations
node examples/04-mutations.js

# Subscriptions (requires additional setup)
node examples/05-subscriptions.js

# Resolvers
node examples/06-resolvers.js

# Directives
node examples/07-directives.js

# Fragments
node examples/08-fragments.js

# Variables
node examples/09-variables.js

# Aliases
node examples/10-aliases.js

# Interfaces
node examples/11-interfaces.js

# Unions
node examples/12-unions.js

# Enums
node examples/13-enums.js

# Input Types
node examples/14-input-types.js

# Scalar Types
node examples/15-scalar-types.js

# Pagination
node examples/16-pagination.js

# Error Handling
node examples/17-error-handling.js

# DataLoader
node examples/18-dataloader.js

# Authentication & Authorization
node examples/19-authentication-authorization.js
```

## Using GraphQL Playground

Once a server is running, open your browser and navigate to the server URL (usually `http://localhost:4000` or similar). Apollo Server provides a built-in GraphQL Playground where you can:

1. Write and test queries
2. Explore the schema
3. View documentation
4. Test mutations

## Example Queries

Each example file contains commented example queries at the bottom. Copy and paste them into the GraphQL Playground to test.

## Development

For development with auto-reload, you can use nodemon:

```bash
npm run dev
```

Make sure to update the script in `package.json` to point to the example you want to run.

## Project Structure

```
graphql-core/
├── docs/                 # Documentation files
│   ├── 01-schema-definition.md
│   ├── 02-types.md
│   └── ...
├── examples/             # Example implementations
│   ├── 01-schema-definition.js
│   ├── 02-types.js
│   └── ...
├── package.json          # Dependencies
├── README.md            # Main README
└── SETUP.md             # This file
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error, either:
1. Stop the process using that port
2. Change the port number in the example file

### Module Not Found

If you get "module not found" errors:
1. Make sure you've run `npm install`
2. Check that all dependencies are listed in `package.json`

### Subscription Issues

Subscriptions require WebSocket support. Make sure you have the necessary packages installed:
- `graphql-ws`
- `ws`

## Next Steps

1. Read the documentation in the `docs/` directory
2. Run the examples and experiment with queries
3. Modify the examples to understand how they work
4. Build your own GraphQL API using these concepts

## Resources

- [GraphQL Official Documentation](https://graphql.org/learn/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Tools](https://www.graphql-tools.com/)

