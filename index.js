// jshint esversion: 8

// app imports
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

// configure multer for file storage (needed to process the uploaded files)
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

// CORS configuration
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

app.use(cookieParser()); // to allow cookie parsing
app.enable("trust proxy"); // seemed to be necessary to get cookies setting

// Node Session configuration
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
    // secure: true,
    maxAge: 100 * 60 * 60 * 24,
    // sameSite: 'none',
    domain: 'localhost',
    httpOnly: false
  },
  unset: 'destroy',
}));

//use Passport.js 
app.use(passport.initialize());
app.use(passport.session());

// check to see if user is authenticated, property set by Passport middleware
function ensureAuthenticated(req, res, next) {
  console.log(`Is logged in: ${req.isAuthenticated()}`);
  if (req.isAuthenticated()) {

    return next();
  }
  res.status(401).json({
    msg: "Not logged in"
  });
}

// connect to database and set the Ride model from databse.js
connection.connect;

// set Ride and User models from the database.js module
const Activity = connection.Activity;
const User = connection.User;


/* Upload a completed (manual or fit file) or planned activity to the database, same middleware for all scenarios. Real files will 
have a req.files array following upload and parse by fit.js (converts to a JSON). Manual and planned ad hoc uploads will just be on the 
req.body as form data.
*/
async function uploadDBActivity(req, res, next) {
  try{
    // planned activity
  if (req.body.planned){
    let d = new Date(req.body.date);
    d.setHours(15, 0, 0);
      const dbRide = new Activity({
        completion: 0,
        date: d,
        description: req.body.description,
        plannedDistance:req.body.distance,
        plannedDuration:req.body.time,
        plannedTss: req.body.tss,
        sport: req.body.sport,
        title: req.body.title,
        user: req.user.username,
      });
      dbRide.save(function(err) {
        if (err) console.log(err);
      });
    return next();
  }
  // manual activity
  if (req.body.manual){
    let d = new Date(req.body.date);
    d.setHours(15, 0, 0);

    const cRide = new Activity({
      completion: -1,
      date: d,
      description: req.body.description,
      completedDistance: req.body.distance,
      completedDuration: req.body.time,
      completedTss: req.body.tss,
      sport: req.body.sport,
      // still sending to Vue front end to render 0 in the planned section
      plannedDistance: 0,
      plannedDuration: 0,
      plannedTss: 0,
      title: req.body.title,
      user: req.user.username,
      });
      cRide.save();
      return next();
    
  } else if (req.parsedFiles) { // if uploading a file

  // process multiple files
  req.parsedFiles.forEach(async (parsedFile) => {
    
    // determine sport type and how to process based on that
    const sport = parsedFile.sessions[0].sport || req.body.sport;
    console.log(sport)
    // needed at function scope 
    let duration;
    let completedTss;
    let nPwr;
    
    switch (sport){
      case "cycling":
             
        // determine if the parsedFile includes power data
        let hasPower;
        if(parsedFile.sessions[0].avg_power == undefined){
          hasPower=false
        } else {
          hasPower = true;
        }

        // if ride has power data then calculate normalised power and tss from it
        if(hasPower){
          // calculate normalised power from the fit.js module "getNP" method
          nPwr = fit.getNP(parsedFile);

          // get duration from parsed file
          duration = parsedFile.sessions[0].total_timer_time;

          // calculate training stress score using the user's ftp, normalised power, and duration
          completedTss = fit.getTss(req.user.ftp, nPwr, duration);
        }
        break;
      case "run":
        //add any running-specific processing here
        break;
    }
        // set two dates between which to check if there is a planned activity already in the database 
        let d1 = new Date(parsedFile.sessions[0].timestamp);
        let d2 = new Date(parsedFile.sessions[0].timestamp);
        d1.setHours(0,0,0);
        d2.setHours(23,59,59, 999);

        const filter = {
          date: {
            $gt: d1,
            $lt: d2,
          },
          user: req.user.username
        };

        let plannedActivity;

        // search the DB for a ride between d1 and d2
        try{
          const pRide = await Activity.findOne(filter);

          // if ride found the search is successful update that document with the completed information
          if(pRide != undefined){

          const completion = pRide.plannedTss/completedTss;
          
          let update = {
            completion: completion,
            data: JSON.stringify(parsedFile.sessions[0]),
            date: parsedFile.sessions[0].timestamp,
            
            completedDistance: parsedFile.sessions[0].total_distance,
            completedDuration: duration,
            completednPwr: nPwr,
            completedTss: completedTss,
          };
          const cRide = await Activity.findOneAndUpdate({_id: pRide.id}, update, {
            new: true,
          })
          } else { //else add as new activity
          const cRide = new Activity({
            sport: sport,
            date: parsedFile.sessions[0].timestamp,
            title: `${sport} - ${new Date(parsedFile.sessions[0].timestamp).toDateString()}`,
            completion: -1,
            data: JSON.stringify(parsedFile.sessions[0]),
            
            completedDistance: parsedFile.sessions[0].total_distance,
            completedDuration: duration,
            completednPwr: nPwr,
            completedTss: completedTss,
            // still sending to Vue front end to render 0 in the planned section
            plannedDistance: 0,
            plannedDuration: 0,
            plannedTss: 0,
            user: req.user.username,
            });
            cRide.save();
          }
        } catch (err){
          console.log(err)
        }
  });
    next();
    } else {
      throw new Error("Upload failed - not a planned, manual or .fit file")
    }
  } catch (err){
    
    next(err);
  }
}

// BEGINNING OF APP ROUTES //
app.get('/showRides/:dateOne.:dateTwo', ensureAuthenticated, async (req, res, next) => {
  console.log();

  var rideArr = [];
  let rides = await Activity.find({
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
        rideObj.sport = docs[i].sport;
        rideObj.completion = docs[i].completion;
        rideObj.date = docs[i].date;
        rideObj.completedDistance = docs[i].completedDistance;
        rideObj.completedDuration = docs[i].completedDuration;
        rideObj.completednPwr = docs[i].completednPwr;
        rideObj.completedTss = docs[i].completedTss;
        rideObj.plannedDistance = docs[i].plannedDistance;
        rideObj.plannedDuration = docs[i].plannedDuration;
        rideObj.plannedTss = docs[i].plannedTss;
        rideObj.id = docs[i]._id;
        rideArr.push(rideObj);
    }
    res.locals.rideArray = rideArr;
    res.send(rideArr);

  });
});

app.get('/showRide/:id', async function(req, res) {
  try {
  let rides = await Activity.find({
    _id: req.params.id
  }, function(err, docs) {
    if (err) {
      console.log(err);
    }
    // console.log(docs[0].data[0])
    var rideObj = new Object();
    var latLngArr = [];
    if(docs[0].data){
      // Need to construct array for the lat lng data for google map polyline
        const rideData = JSON.parse(docs[0].data);
        // console.log(rideData)

        latLngArr.push({lat: rideData.start_position_lat, lng: rideData.start_position_long});
        rideData.laps.forEach(lap => {
          lap.records.forEach( record => {
            latLngArr.push({lat: record.position_lat, lng: record.position_long});
          });
        });
      }
        rideObj.latLngArr = latLngArr;
        rideObj.sport = docs[0].sport;
        rideObj.completion = docs[0].completion;
        rideObj.date = docs[0].date;
        rideObj.description = docs[0].description;
        rideObj.completedDistance = docs[0].completedDistance;
        rideObj.completedDuration = docs[0].completedDuration;
        rideObj.completednPwr = docs[0].completednPwr;
        rideObj.completedTss = docs[0].completedTss;
        rideObj.plannedDistance = docs[0].plannedDistance;
        rideObj.plannedDuration = docs[0].plannedDuration;
        rideObj.plannedTss = docs[0].plannedTss;
        rideObj.title = docs[0].title;
        rideObj.id = docs[0]._id;
    res.locals.rideObj = rideObj;

  });
  res.send(res.locals.rideObj);
} catch (err) {
  console.log(err)
}
});

app.post('/fileUpload', ensureAuthenticated, upload.any('multi-files'), fit.parseFIT, uploadDBActivity, function(req, res) {

  console.log('Ride saved to DB');
  res.sendStatus(200);
  
});

app.post('/adHocUpload', ensureAuthenticated, uploadDBActivity, function(req, res) {

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
    var deletedRide = await Activity.deleteOne({
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
    var rides = await Activity.find({
      user: req.user.username
    }).sort({
      date: 'asc'
    });

      const projection = req.params.projection;
      let data = fit.pmc(rides, projection);
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
