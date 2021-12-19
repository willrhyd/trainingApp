// jshint esversion:8

const EasyFit = require('./node_modules/easy-fit/dist/easy-fit.js').default;
const fs = require('fs');

function parseFIT(req, res, next) {
  req.parsedFiles = [];
  fs.readdir(`./temp/${req.user.username}`, (err, files) => {

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      console.log(`./temp/${req.user.username}/${file}`);
      fs.readFile(`./temp/${req.user.username}/${file}`, function(err, content) {
        // Create a EasyFit instance (options argument is optional)
        let easyFit = new EasyFit({
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
  let np = rideNormalisedPower(activity);
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
  let block_power = [];
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
  let power_array = de_Lap_power(activity);
  let total_rolling_power = 0;
  let rolling_average = 0;
  let rolling_average_array = [];
  let rolling_average_powered_array = [];
  let total_rolling_average_powered = 0;
  let avg_powered_values = 0;
  let normalized_power;
  let j = 0;
  let i;

  // console.log(power_array)
  for (i = 0; i < power_array.length; i++) {
    if (i >= 29) {
      // console.log(i);
      for (j = i; j >= i - 29; j--) {
        total_rolling_power += power_array[j];
      }
      rolling_average = total_rolling_power / 30;
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
  };

  const today = new Date();
  today.setHours(0, 0, 0);

  for (let j = 0; j < rides.length; j++) {
    rideDate = new Date(Date.parse(rides[j].date));
    rideDate.setHours(0, 0, 0);


    if( checkDate >= today){
      if (rideDate.toDateString() == checkDate.toDateString()) {
        // If there's a matched ride then return match as 1 and use "completedTss" as the ctl builder
          check.match = 1;
          check.tss += rides[j].plannedTss;
      }
    }
    if( checkDate < today){
      if (rideDate.toDateString() == checkDate.toDateString()) {
        // If there's a matched ride then return match as 1 and use "completedTss" as the ctl builder
        if(rides[j].completedTss){
          check.match = 1;
          check.tss += rides[j].completedTss;
        }
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

  // comparison function for array sort
  function dynamicSort(property) {
    var sortOrder = 1;
    
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
  rides.sort(dynamicSort("date"));



  // Normal execution if at least one ride saved
  let chartStart = new Date(Date.parse(rides[0].date));
  let chartEnd = new Date();

  const forecast = Number(projection);
  chartEnd.setDate(chartEnd.getDate() + (forecast));

  
  let data = [];
  let ctlToday = 0;
  let ctlYesterday = 0;
  let tssArray = [];
  let atlToday = 0;
  let atlYesterday = 0;
  let sumOfPreviousSevenDaysTSS = 0;
  let tsb;

  let dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric"
  };

  for (let d = new Date(chartStart); d <= chartEnd; d.setDate(d.getDate() + 1)) {
    d.setHours(0, 0, 0);

    // For each day, check whether there's a ride that matches that day
    const rideCheck = checkForRide(rides, d);
    
    // Build the data array with date, atl, tsb, and ctl values.
    if (rideCheck.match == 1) {
      ctlToday = ctlYesterday + ((rideCheck.tss - ctlYesterday) / (42));
      tssArray.push(rideCheck.tss)
    }
    if (rideCheck.match == 0) {
      ctlToday = ctlYesterday + ((0 - ctlYesterday) / (42));
      tssArray.push(0)
    }

    for (let i = 1; i <= 7; i++){
      if(i > tssArray.length){break;}
      sumOfPreviousSevenDaysTSS += tssArray[tssArray.length - i]
    } 

    atlToday = atlYesterday + (tssArray[tssArray.length-1] - atlYesterday ) / 7
    tsb = ctlYesterday-atlYesterday
    
    data.push({
      date: d.toLocaleDateString("en-gb", dateOptions),
      ctl: ctlToday,
      atl: atlToday,
      tsb: tsb,
    });

    ctlYesterday = ctlToday;
    atlYesterday = atlToday;
    sumOfPreviousSevenDaysTSS = 0;
  }
  console.log(tssArray)
  return data;
}

exports.pmc = buildPmcArray;
exports.getTss = getTss;
exports.parseFIT = parseFIT;
exports.getNP = getNP;
