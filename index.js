// jshint esversion: 8

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const connection = require('./config/database');
const passport = require('passport');
const password = require('./lib/passwordUtils');
require('./config/passport');
const session = require('express-session');
const crypto = require('crypto');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const formidable = require('formidable');
const multer = require('multer');
const path = require('path');
const shortid = require('shortid');
const fit = require('./fit');
const fs = require('fs');
require('dotenv').config();
const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const user = req.user.username;
    const path = `./temp/${user}`;
    fs.mkdirSync(path, {
      recursive: true
    });
    return cb(null, path);
  },
  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
    cb(null, file.fieldname + path.parse(file.originalname).ext);

    console.log("File uploaded successfully");
  }
});

const upload = multer({
  storage: storage
});

app.use((req, res, next) => {
  console.log(req.hostname);
  next();
});
app.use(cookieParser());
app.use(cors({
  origin: [
    'https://willrhyd.github.io/trainingapp-prod/#/',
    'https://willrhyd.github.io',
    'http://willrhyd.github.io/trainingapp-prod/#/',
    'http://localhost:8080',
    'https://rides.trainingappserver.uk'
  ],
  credentials: true,
  exposedHeaders: ['set-cookie']

}));

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.enable("trust proxy");
app.use(session({
  name: "trainingApp",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions' // See below for details
  }),
  cookie: {
    name: 'trainingApp',
    // secure: true, - Not needed for test environment
    maxAge: 100 * 60 * 60 * 24,
    sameSite: 'none',
    domain: 'trainingappserver.uk', 
    httpOnly: false
  },
  unset: 'destroy',
}));
app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  console.log(`Is logged in: ${req.isAuthenticated()}`);
  if (req.isAuthenticated()) {

    return next();
  }
  res.status(401).json({
    msg: "Not logged in"
  })
}

//Connect to database and set the Ride model from databse.js
connection.connect;

const Ride = connection.Ride;
const User = connection.User;

function uploadDB(req, res, next) {
  req.parsedFiles.forEach(file => {
    const nPwr = fit.getNP(file);
    const duration = file.sessions[0].total_timer_time;
    console.log(file);
    // console.log(req.user.ftp)
    const dbRide = new Ride({
      data: JSON.stringify(file.sessions[0]),
      date: file.sessions[0].timestamp,
      distance: file.sessions[0].total_distance,
      duration: duration,
      nPwr: nPwr,
      tss: fit.getTss(req.user.ftp, nPwr, duration),
      user: req.user.username
    });
    dbRide.save(function(err) {
      if (err) console.log(err);
    });
  });

  next();
}
//
// app.get('/', (req,res) => {
//   res.send("<h1>Hello World of Sessions</h1>")
// });

app.get('/showRides/:dateOne.:dateTwo', ensureAuthenticated, async (req, res, next) => {
  console.log(req.session.cookie);

  var rideArr = [];
  let rides = await Ride.find({
    date: {
      $gt: req.params.dateOne,
      $lt: req.params.dateTwo
    },
    user: req.user.username
  }, function(err, docs) {
    if (err) {
      console.log(err);
    }
    for (var i = 0; i < docs.length; i++) {
      var rideObj = new Object();
      rideObj.date = docs[i].date;
      rideObj.distance = docs[i].distance;
      rideObj.duration = docs[i].duration;
      rideObj.np = docs[i].nPwr;
      rideObj.tss = docs[i].tss;
      rideObj.id = docs[i]._id;
      rideArr.push(rideObj);
    }
    console.log(rideArr);
    res.locals.rideArray = rideArr;
    res.send(rideArr);

  });
});

app.get('/showRide/:id', async function(req, res) {
  try {
  let rides = await Ride.find({
    _id: req.params.id
  }, function(err, docs) {
    // console.log(docs[0])
    if (err) {
      console.log(err);
    }
    let rideObj = {
      date: docs[0].date,
      distance: docs[0].distance,
      duration: docs[0].duration,
      np: docs[0].nPwr,
      id: docs[0]._id,
    };
    res.locals.rideObj = rideObj;

  });
  res.send(res.locals.rideObj);
} catch (err) {
  console.log(err)
}
});

app.post('/fileUpload', ensureAuthenticated, upload.any('multi-files'), fit.parseFIT, uploadDB, function(req, res) {

  console.log('Ride saved to DB');
  res.sendStatus(200);
  //  uploadDB,
});

app.post('/register', function(req, res) {


  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(500).json({
      msg: "Passwords do not match"
    })
  }
  const hashSalt = password.genPassword(req.body.password);
  const regUser = new User({
    name: `${req.body.firstName} ${req.body.lastName}`,
    ftp: 300,
    username: req.body.username,
    hash: hashSalt.hash,
    salt: hashSalt.salt,
  });
  regUser.save()
    .then((user) => {
      console.log("User registered")
      res.status(200).json({
        msg: "Sign up successful"
      });
    })
    .catch((err) => {
      console.log(err)
      res.status(401)
    });
  res.sendStatus;
});

app.post('/login', passport.authenticate('local'), ensureAuthenticated, function(req, res) {

  res.status(200).json({
    msg: "Signed in successfully",
    // Return user settings such as ftp so that they are available for saving in the Vuex Store
    ftp: req.user.ftp,
    weight: req.user.weight
  });

});

app.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    msg: "Signed out successfully"
  });
});

app.delete('/file_delete/:id', ensureAuthenticated, async function(req, res) {
  console.log(req.params.id)
  try {
    var deletedRide = await Ride.deleteOne({
      _id: req.params.id
    }).exec()
    console.log(deletedRide)
    if(deletedRide.deletedCount > 0) {
      res.sendStatus(200);
    } else { err = new Error()}
  } catch (err) {
    console.log(err);
  }
});

app.get('/pmc/:user', ensureAuthenticated, async function(req, res) {
  try {
    var rides = await Ride.find({
      user: req.user.username
    }).sort({
      date: 'asc'
    });
      var data = fit.pmc(rides);
      res.send(data);

  } catch (err) {
    console.log(err);
  }
});

app.put('/userupdate/:user', ensureAuthenticated, async function(req, res){
  console.log( req.body.weight)
var filter = {username: req.user.username};
var update = {
  ftp: req.body.ftp,
  weight: req.body.weight,
};
  try {
    var updatedUser = await User.findOneAndUpdate(filter, update, {
      new: true
    });
    res.send({
      // Choose which fields to send back for the Vuex Store
      username:updatedUser.username,
      ftp:updatedUser.ftp,
      weight: updatedUser.weight,
    });
  } catch (err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
