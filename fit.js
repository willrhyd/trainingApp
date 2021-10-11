// jshint esversion:8

const EasyFit = require('./node_modules/easy-fit/dist/easy-fit.js').default;
const fs = require('fs');

function parseFIT(req, res, next) {
  req.parsedFiles = [];
  fs.readdir(`./temp/${req.user.username}`, (err, files) => {

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      console.log(`./temp/${req.user.username}/${file}`);
      fs.readFile(`./temp/${req.user.username}/${file}`, function(err, content) {
        // Create a EasyFit instance (options argument is optional)
        var easyFit = new EasyFit({
          force: true,
          speedUnit: 'km/h',
          lengthUnit: 'km',
          temperatureUnit: 'kelvin',
          elapsedRecordField: true,
          mode: 'cascade',
        });

        // Parse your file
        easyFit.parse(content, function(error, data) {
          // Handle result of parse method
          if (error) {
            console.log(error);
          } else {
            // Difficulties building the array because callbacks only returning once the for loop has completed,
            // maybe a promise would work better?
            req.parsedFiles.push(data.activity)
            if (req.parsedFiles.length == files.length) {
              next();
            }
          }
          // console.log(req.parsedFiles[0]);
        });
      });
      fs.unlink(`./temp/${req.user.username}/${file}`, (err) => {
        if (err) {
          console.error(err)
          return
        }
      });
    } // console.log(req.parsedFiles[0]);
    // console.log(parsedArray);
  });
  // console.log(req.parsedFiles);
  // next();
}

function getNP(activity) {
  remove_stops(activity);
  var np = rideNormalisedPower(activity);
  return np;
}

function remove_stops(activity) {
  activity.sessions[0].laps.forEach((lap) => {
    for (i = 0; i < lap.records.length; i++) {
      if (lap.records[i].speed < 1) {
        lap.records.splice(i, 1);
      }
    }
  });
  activity.sessions[0].normalized_power = 999
}

function de_Lap_power(activity) {
  // console.log(activity);
  var block_power = [];
  // console.log(activity.sessions.laps[i].records)
  // console.log(activity.sessions[0]);
  for (i in activity.sessions[0].laps) {
    for (j in activity.sessions[0].laps[i].records) {
      block_power.push(activity.sessions[0].laps[i].records[j].power);
    }
  }
  // console.log(block_power);
  for (x in block_power) {
    if (block_power[x] > 2000) {
      block_power[x] = 0;
    }
  }
  return block_power;
}

function rideNormalisedPower(activity) {
  var power_array = de_Lap_power(activity);
  var total_rolling_power = 0;
  var rolling_average = 0;
  var rolling_average_array = [];
  var rolling_average_powered_array = [];
  var total_rolling_average_powered = 0;
  var avg_powered_values = 0;
  var normalized_power;
  var j = 0;
  var i;

  // console.log(power_array)
  for (i = 0; i < power_array.length; i++) {
    if (i >= 29) {
      // console.log(i);
      for (j = i; j >= i - 29; j--) {
        total_rolling_power += power_array[j];
      }
      rolling_average = total_rolling_power / 30;
      //
      // if(i=28){
      //   console.log(rolling_average);
      // }
      rolling_average_array.push(rolling_average);
      total_rolling_power = 0;
    }
  }
  for (x in rolling_average_array) {
    rolling_average_powered_array.push(Math.pow(rolling_average_array[x], 4));
  }
  for (z in rolling_average_powered_array) {
    if (isNaN(rolling_average_powered_array[z]) === false) {
      total_rolling_average_powered += rolling_average_powered_array[z];
    }
  }
  console.log("Total of rolling averages raised ^4:" + total_rolling_average_powered);
  avg_powered_values = total_rolling_average_powered / rolling_average_powered_array.length;
  console.log("Average of values raised to ^4:" + avg_powered_values);
  normalized_power = Math.pow(avg_powered_values, 0.25);
  console.log("Normalized Power:" + normalized_power);
  activity.sessions[0].normalized_power = normalized_power;
  return normalized_power;
}


function getTss(ftp, np, duration) {
  // TSS = (sec x NP® x IF®)/(FTP x 3600) x 100
  // console.log(ftp, np, duration);
  return ((duration * np * (np / ftp)) / (ftp * 3600)) * 100;
}

function checkForRide(rides, checkDate) {
  let check = {
    match: 0,
    tss: 0
  }

  for (var j = 0; j < rides.length; j++) {
    rideDate = new Date(Date.parse(rides[j].date));
    rideDate.setHours(0, 0, 0);

    // console.log("Ride Date: " + rideDate);
    // console.log("Check Date: " + checkDate);
    // console.log("Ride TSS: " + rides[j].tss);
    console.log(`Ride Date: ${rideDate}  Check Date: ${checkDate}`)


    if (rideDate.toDateString() == checkDate.toDateString()) {
      // If there's a matched ride then return match as 1 and use "completedTss" as the ctl builder
      check.match = 1;
      console.log(rides[j].plannedTss || rides[j].completedTss);
      if (rides[j].completedTss != 0) {
        check.tss = rides[j].completedTss;
      }
      if (rides[j].plannedTss) {
        check.tss = rides[j].plannedTss;
      }

    } 



  }
  return check;
}

// Doesn't handle multiple rides on one day yet
function buildPmcArray(rides, projection) {

  // If function to cover edge case of no rides saved
  if (rides == 0) {
    let data = [];
    for (let i = 150; i > 0; i--) {
      let d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString("en-gb", dateOptions),
        ctl: 0
      });
    }
    return data;
  }

  // Normal execution if at least one ride saved
  var chartStart = new Date(Date.parse(rides[0].date));
  var chartEnd = new Date();

  const forecast = Number(projection);
  chartEnd.setDate(chartEnd.getDate() + (forecast));

  var dates = [];
  var data = [];
  var ctlToday = 0;
  var ctlYesterday = 0;

  var dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric"
  };

  for (var d = new Date(chartStart); d <= chartEnd; d.setDate(d.getDate() + 1)) {
    d.setHours(0, 0, 0);


    // For each day, check whether there's a ride that matches that day
    const rideCheck = checkForRide(rides, d);
    console.log(rideCheck)


    // Build the data array with date and ctl value.
    if (rideCheck.match == 1) {
      ctlToday = ctlYesterday + ((rideCheck.tss - ctlYesterday) / (42));
      data.push({
        date: d.toLocaleDateString("en-gb", dateOptions),
        ctl: ctlToday
      });

      ctlYesterday = ctlToday;
    }

    if (rideCheck.match == 0) {
      ctlToday = ctlYesterday + ((0 - ctlYesterday) / (42));
      data.push({
        date: d.toLocaleDateString("en-gb", dateOptions),
        ctl: ctlToday
      });
      ctlYesterday = ctlToday;
    }

  }

  return data;
}

exports.pmc = buildPmcArray;
exports.getTss = getTss;
exports.parseFIT = parseFIT;
exports.getNP = getNP;
