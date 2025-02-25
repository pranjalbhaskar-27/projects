// Load environment variables
require('dotenv').config();

const express = require('express');
// Import graphqlHTTP middleware - this is the core difference from REST APIs
// In REST, we would use express.Router() or similar to define routes
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
// Import the GraphQL schema - in REST, we would import route handlers instead
const schema = require('./graphql/schema');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/graphql-poc';

const app = express();

// MongoDB connection - similar to REST APIs
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// DIFFERENCE FROM REST: Single endpoint for all operations
// In REST, we would have multiple endpoints like:
// - GET /api/users (get all users)
// - GET /api/users/:id (get one user)
// - POST /api/users (create user)
// - PUT /api/users/:id (update user)
// - DELETE /api/users/:id (delete user)
// and so on.
// In GraphQL, we have just 1 endpoint that handles all operations
app.use('/graphql', graphqlHTTP({
  // The schema defines all available operations (queries and mutations)
  schema: schema,
  // Enable GraphiQL - an in-browser IDE for exploring GraphQL
  // REST would typically use Swagger/OpenAPI for documentation instead
  graphiql: true,
  // Custom error formatting - similar to error handling in REST
  customFormatErrorFn: (error) => {
    console.error(error);
    return {
      message: error.message,
      path: error.path
    };
  }
}));

// Start the server - similar to REST APIs
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
}); 