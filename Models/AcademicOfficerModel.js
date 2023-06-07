const mongoose = require('mongoose');


const AcademicOfficerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: Number,
    required: true,
    unique: true
    },
  role: {
    type: String,
    default: "AcademicOfficer",
    required: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  password: {
    type: String,
    required: true
  }
});

const AcademicOfficer = mongoose.model('AcademicOfficer', AcademicOfficerSchema);
module.exports = AcademicOfficer;
