const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: "SuperAdmin",
    required: true
  }
});

const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

module.exports = SuperAdmin;
