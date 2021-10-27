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
    // Comment out secure and samesite for local environment testing. Change 'trainingappserver.uk' to 'localhost'.
    name: 'trainingApp',
    secure: true,
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
  });
}

//Connect to database and set the Ride model from databse.js
connection.connect;

const Ride = connection.Ride;
const User = connection.User;

async function uploadDBCompletedRide(req, res, next) {
  req.parsedFiles.forEach(async (file) => {
    const nPwr = fit.getNP(file);
    const duration = file.sessions[0].total_timer_time;
    const completedTss = fit.getTss(req.user.ftp, nPwr, duration);
    let d1 = new Date(file.sessions[0].timestamp);
    let d2 = new Date(file.sessions[0].timestamp);

    d1.setHours(0,0,0);
    d2.setHours(23,59,59, 999);
    const filter = {
      date: {
        $gt: d1,
        $lt: d2,
      },
      user: req.user.username
    };

    let plannedRide;

    try{
      const pRide = await Ride.findOne(filter);
      console.log(pRide)
      if(pRide != undefined){

      const completion = pRide.plannedTss/completedTss;
      // console.log(completion)
      let update = {
        completion: completion,
        data: JSON.stringify(file.sessions[0]),
        date: file.sessions[0].timestamp,
        completedDistance: file.sessions[0].total_distance,
        completedDuration: duration,
        completednPwr: nPwr,
        completedTss: completedTss,
      };
      const cRide = await Ride.findOneAndUpdate({_id: pRide.id}, update, {
        new: true,
      })
    } else {
      const cRide = new Ride({
        completion: -1,
        data: JSON.stringify(file.sessions[0]),
        date: file.sessions[0].timestamp,
        completedDistance: file.sessions[0].total_distance,
        completedDuration: duration,
        completednPwr: nPwr,
        completedTss: completedTss,
        plannedDistance: 0,
        plannedDuration: 0,
        // plannednPwr:req.body.nPwr,
        plannedTss: 0,
        user: req.user.username,
      });
      cRide.save();
    }
      // console.log(cRide);

    } catch (err){
      console.log(err)
    }
});
next();
}

function uploadDBPlannedRide(req, res, next) {
  // Set Date to 12:00 pm so that it gets added to the Weeks array in calendar.vue,
  // at the "attachRidesToWeeks()" method.
  let d = new Date(req.body.date);
  d.setHours(15, 0, 0);
  // console.log(d);
    const dbRide = new Ride({
      completion: 0,
      date: d,
      plannedDistance:req.body.distance,
      plannedDuration:req.body.time,
      // plannednPwr:req.body.nPwr,
      plannedTss: req.body.tss,
      completedDistance: null,
      completedDuration: null,
      completednPwr: null,
      completedTss: null,
      user: req.user.username,
    });
    dbRide.save(function(err) {
      if (err) console.log(err);
    });
  next();
}

app.get('/showRides/:dateOne.:dateTwo', ensureAuthenticated, async (req, res, next) => {
  console.log();

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
        rideObj.completion = docs[i].completion;
        rideObj.date = docs[i].date;
        rideObj.completedDistance = docs[i].completedDistance;
        rideObj.completedDuration = docs[i].completedDuration;
        rideObj.completednPwr = docs[i].completednPwr;
        rideObj.completedTss = docs[i].completedTss;
        rideObj.plannedDistance = docs[i].plannedDistance;
        rideObj.plannedDuration = docs[i].plannedDuration;
        // rideObj.np = docs[i].completednPwr;
        rideObj.plannedTss = docs[i].plannedTss;
        rideObj.id = docs[i]._id;
        rideArr.push(rideObj);
    }
    // console.log(rideArr);
    res.locals.rideArray = rideArr;
    res.send(rideArr);

  });
});

app.get('/showRide/:id', async function(req, res) {
  try {
  let rides = await Ride.find({
    _id: req.params.id
  }, function(err, docs) {
    if (err) {
      console.log(err);
    }
    var rideObj = new Object();
        rideObj.data = docs[0].data;
        rideObj.completion = docs[0].completion;
        rideObj.date = docs[0].date;
        rideObj.completedDistance = docs[0].completedDistance;
        rideObj.completedDuration = docs[0].completedDuration;
        rideObj.completednPwr = docs[0].completednPwr;
        rideObj.completedTss = docs[0].completedTss;
        rideObj.plannedDistance = docs[0].plannedDistance;
        rideObj.plannedDuration = docs[0].plannedDuration;
        // rideObj.np = docs[0].completednPwr;
        rideObj.plannedTss = docs[0].plannedTss;
        rideObj.id = docs[0]._id;


    res.locals.rideObj = rideObj;

  });
  res.send(res.locals.rideObj);
} catch (err) {
  console.log(err)
}
});

app.post('/fileUpload', ensureAuthenticated, upload.any('multi-files'), fit.parseFIT, uploadDBCompletedRide, function(req, res) {

  console.log('Ride saved to DB');
  res.sendStatus(200);
  //  uploadDB,
});

app.post('/adHocUpload', ensureAuthenticated, uploadDBPlannedRide, function(req, res) {

  console.log('Ride saved to DB');
  res.sendStatus(200);

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



app.get('/logout', async function(req, res) {

  req.session.destroy(function (err) {
    console.log("Signed out successfully")
    res.status(200).json({
      msg: "Signed out successfully"
    });
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

app.get('/pmc/:user.:projection', ensureAuthenticated, async function(req, res) {
  try {
    var rides = await Ride.find({
      user: req.user.username
    }).sort({
      date: 'asc'
    });

      const projection = req.params.projection;
      var data = fit.pmc(rides, projection);
      console.log(data)
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
