// jshint esversion: 6

const mongoose = require('mongoose');

require('dotenv').config();

const conn = process.env.MONGODB_URI;

const connect = mongoose.connect(conn);

const Schema = mongoose.Schema;

// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new Schema({
  name: String,
  ftp: {type:Number, default:300},
  weight: {type:Number, default:70},
  username: String,
  hash: String,
  salt: String,
});

const RideSchema = new Schema({
  completion: Number,
  data: String,
  date: Date,
  completedDistance: Number,
  completedDuration: Number,
  completednPwr: Number,
  completedTss: Number,
  plannedDistance: Number,
  plannedDuration: Number,
  plannedPwr: Number,
  plannedTss: Number,
  user: String,
});

const Ride = mongoose.model("Ride", RideSchema);
const User = mongoose.model("User", UserSchema);


// Expose the connection
exports.connect = connect;
exports.Ride = Ride;
exports.User = User;
