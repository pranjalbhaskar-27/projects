// Import GraphQL types - these define the structure of our API
// In REST, we would use JSON directly without type definitions
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList
} = require('graphql');

// Import User model - similar to REST APIs
const User = require('../models/User');

// DIFFERENCE FROM REST: Define a GraphQL Type
// In REST, we would simply return JSON without explicit type definitions
// GraphQL requires explicit type definitions for all data
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

// DIFFERENCE FROM REST: Define all queries (GET operations) in one place
// In REST, each endpoint would be defined separately in route files
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Equivalent to GET /api/users in REST
    users: {
      type: new GraphQLList(UserType),
      // The resolver function is like a controller in REST
      resolve: async () => {
        try {
          return await User.find();
        } catch (error) {
          throw new Error(`Error fetching users: ${error.message}`);
        }
      }
    },
    // Equivalent to GET /api/users/:id in REST
    user: {
      type: UserType,
      // DIFFERENCE FROM REST: Arguments are defined in the schema
      // In REST, they would come from the URL params or query string
      args: { id: { type: GraphQLID } },
      resolve: async (_, args) => {
        try {
          const user = await User.findById(args.id);
          if (!user) {
            throw new Error(`User with ID ${args.id} not found`);
          }
          return user;
        } catch (error) {
          throw new Error(`Error fetching user: ${error.message}`);
        }
      }
    }
  }
});

// DIFFERENCE FROM REST: Define all mutations (POST/PUT/DELETE operations) in one place
// In REST, these would be separate routes with different HTTP methods
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Equivalent to POST /api/users in REST
    createUser: {
      type: UserType,
      // DIFFERENCE FROM REST: Required fields are defined in the schema
      // In REST, validation would be done in middleware or the controller
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: async (_, args) => {
        try {
          // Check if user with the same email already exists
          const existingUser = await User.findOne({ email: args.email });
          if (existingUser) {
            throw new Error(`User with email ${args.email} already exists`);
          }
          
          // Create new user - similar to REST controller logic
          const newUser = new User({
            name: args.name,
            email: args.email,
            age: args.age
          });
          
          // Save user to database
          return await newUser.save();
        } catch (error) {
          throw new Error(`Error creating user: ${error.message}`);
        }
      }
    },
    // Equivalent to PUT /api/users/:id in REST
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        // DIFFERENCE FROM REST: Optional fields in GraphQL are simply not marked as required
        // In REST, all fields in the request body would be optional by default
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        age: { type: GraphQLInt }
      },
      resolve: async (_, args) => {
        try {
          // Find user by ID
          const user = await User.findById(args.id);
          if (!user) {
            throw new Error(`User with ID ${args.id} not found`);
          }
          
          // Update user fields if provided - similar to REST controller logic
          if (args.name) user.name = args.name;
          if (args.email) user.email = args.email;
          if (args.age !== undefined) user.age = args.age;
          
          // Save updated user
          return await user.save();
        } catch (error) {
          throw new Error(`Error updating user: ${error.message}`);
        }
      }
    },
    // Equivalent to DELETE /api/users/:id in REST
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, args) => {
        try {
          // Find and delete user - similar to REST controller logic
          const deletedUser = await User.findByIdAndDelete(args.id);
          if (!deletedUser) {
            throw new Error(`User with ID ${args.id} not found`);
          }
          return deletedUser;
        } catch (error) {
          throw new Error(`Error deleting user: ${error.message}`);
        }
      }
    }
  }
});

// DIFFERENCE FROM REST: All operations are defined in a single schema
// In REST, routes would be spread across multiple files and routers
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
}); 