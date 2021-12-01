// jshint esversion: 6

const mongoose = require('mongoose');

require('dotenv').config();

const conn = process.env.MONGODB_URI;

const connect = mongoose.connect(conn);

const Schema = mongoose.Schema;

// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register.
const UserSchema = new Schema({
  name: String,
  ftp: {type:Number, default:300},
  weight: {type:Number, default:70},
  username: String,
  hash: String,
  salt: String,
});

const ActivitySchema = new Schema({
  completion: Number,
  data: String,
  date: Date,
  completedDistance: Number,
  completedDuration: Number,
  completednPwr: Number,
  completedTss: Number,
  description: String,
  plannedDistance: Number,
  plannedDuration: Number,
  plannedPwr: Number,
  plannedTss: Number,
  sport: String,
  title: String,
  user: String,
});

const Activity = mongoose.model("Ride", ActivitySchema);
const User = mongoose.model("User", UserSchema);


// Expose the connection and models
exports.connect = connect;
exports.Activity = Activity;
exports.User = User;
