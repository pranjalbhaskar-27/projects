# GraphQL API for MERN Stack Application

This is a proof of concept (POC) for a GraphQL API built with Node.js, Express, express-graphql, and MongoDB. It is a simple implementation of a GraphQL API for a MERN stack application, created to demonstrate the differences between GraphQL and REST APIs. I personally have tested this implementation on my local machine using Postman, and it works fine(Create and Get operations at least! :p).
-Pranjal

## Features

- GraphQL API with express-graphql
- MongoDB integration with Mongoose
- User CRUD operations
- Error handling
- Modular project structure

## Prerequisites

- Node.js (v12 or higher)
- MongoDB (local or remote instance)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd graphql-poc
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/graphql-poc
   NODE_ENV=development
   ```

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

The server will start on the specified port (default: 4000) and connect to the MongoDB instance.
- GraphQL Playground: http://localhost:4000/graphql

## API Documentation

### GraphQL Schema

#### Types
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int!
  createdAt: String
  updatedAt: String
}
```

#### Queries
```graphql
# Get all users
query {
  users {
    id
    name
    email
    age
    createdAt
    updatedAt
  }
}

# Get a single user by ID
query {
  user(id: "user_id_here") {
    id
    name
    email
    age
    createdAt
    updatedAt
  }
}
```

#### Mutations
```graphql
# Create a new user
mutation {
  createUser(name: "John Doe", email: "john@example.com", age: 30) {
    id
    name
    email
    age
    createdAt
    updatedAt
  }
}

# Update an existing user
mutation {
  updateUser(id: "user_id_here", name: "Jane Doe", email: "jane@example.com", age: 25) {
    id
    name
    email
    age
    createdAt
    updatedAt
  }
}

# Delete a user
mutation {
  deleteUser(id: "user_id_here") {
    id
    name
    email
  }
}
```

## Project Structure

```
graphql-poc/
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── package.json          # Project dependencies and scripts
├── server.js             # Express and GraphQL setup
├── models/
│   └── User.js           # Mongoose schema for User
└── graphql/
    └── schema.js         # GraphQL schema with type definitions and resolvers
```

## Error Handling

The API includes error handling for:
- Database connection issues
- Invalid user inputs
- Resource not found errors
- Duplicate email addresses

## GraphQL vs REST API Comparison

### Key Differences

1. **Single Endpoint vs Multiple Endpoints**
   - REST: Multiple endpoints (e.g., `/users`, `/users/:id`, etc.)
   - GraphQL: Single endpoint (`/graphql`) handling all operations

2. **Data Fetching**
   - REST: Often requires multiple requests to fetch related data
   - GraphQL: Can fetch all needed data in a single request

3. **Over/Under-Fetching**
   - REST: Returns fixed data structures that may include unused data
   - GraphQL: Client specifies exactly what data it needs

4. **Operations**
   - REST: HTTP methods define operations (GET, POST, PUT, DELETE)
   - GraphQL: Operations defined as queries and mutations

5. **Schema & Types**
   - REST: No built-in schema definition (often uses OpenAPI/Swagger)
   - GraphQL: Strong typing with a schema that serves as a contract

### Project Structure Comparison

**REST API Structure:**
```
api/
├── routes/
│   └── users.js         # Define GET/POST/PUT/DELETE endpoints
├── controllers/
│   └── userController.js # Handle request/response logic
├── models/
│   └── User.js          # Database model
└── middleware/
    └── validation.js    # Request validation
```

**GraphQL API Structure:**
```
graphql-poc/
├── graphql/
│   └── schema.js        # Define types, queries, and mutations
├── models/
│   └── User.js          # Database model (same as REST)
└── server.js            # Single endpoint setup
```

### How This Implementation Differs from Traditional MVC

1. **Controller Layer Replaced by Resolvers**
   - MVC: Controllers handle HTTP requests and responses
   - GraphQL: Resolvers handle data fetching for specific fields

2. **View Layer Becomes Client-Determined**
   - MVC: Server determines the structure of the response
   - GraphQL: Client determines what data it receives

3. **Routing Simplified**
   - MVC: Complex routing with many endpoints
   - GraphQL: Single endpoint with operations defined in the schema

4. **Validation Approach**
   - MVC: Validation often in middleware or controllers
   - GraphQL: Type definitions provide built-in validation

## License

ISC 