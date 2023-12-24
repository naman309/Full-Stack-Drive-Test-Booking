const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
// const appointment = require('./appointments')

const userSchema = new Schema({
  FirstName: {
    type : String,
    default: "default"
  },
  LastName: {
    type : String,
    default: "default"
  },
  Age: {
    type : Number,
    default: 0
  },
  LicenseNumber: {
    type : String,
    default: "default"
  },
  DateOfBirth: {
    type : String,
    default: "default"
  },
  Username: String,
  Password: String,
  UserType: String,
  AppointmentId: String,
  CarDetails : {
    Make: {
      type : String,
      default: "default"
    },
    Model: {
      type : String,
      default: "default"
    },
    Year: {
      type : Number,
      default: 0
    },
    NumberPlate: {
      type : String,
      default: "default"
    }
  }

});


userSchema.plugin(uniqueValidator);
const user = mongoose.model("user", userSchema);
module.exports = user;