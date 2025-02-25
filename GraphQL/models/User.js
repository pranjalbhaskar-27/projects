const mongoose = require('mongoose');

// SIMILARITY TO REST: Models are defined the same way in both REST and GraphQL
// The database layer is identical - GraphQL is just a different API layer

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  age: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true // Creates createdAt and updatedAt fields automatically
});

// DIFFERENCE FROM REST: In GraphQL, this model will be used by resolvers
// In REST, it would be used by route controllers
// The model itself is the same, but how it's accessed differs

// Create and export the User model
module.exports = mongoose.model('User', userSchema); 