"use strict";

import { Spots, Reports, CurrentForecast, Forecasts } from './db';

var currentForecast = new Map();
var currentForecastJSON = () => JSON.stringify(Array.from(currentForecast.values()));
var appendToCurrentForecastBySpotName = (name, obj) => {
  !currentForecast.get(name) ? currentForecast.set(name, obj) :
  Object.assign(currentForecast.get(name), obj);
}
var clearCurrentForecast = () => currentForecast = new Map();

let setLastUpdate = function(){
//set the global update time
}

let checkLastUpdate = function() {
 // throw error if last update less then an hour
}

let getReportsAverageSwellHeight = function(reports) {
  if (!reports || !reports.count) {
    return null;
  }

  var count = reports.count();
  var sum = 0;

  if (count == 0) {
    return null;
  }

  reports.forEach(function(report) {
    sum += report.height.toNumber();
  });

  return sum/count;
}

let getLastHoureReportBySpotName = function(spotName) {
  var lastHour = Date.create('3 hours ago').format("{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}");
  return Reports.find({ spotName: spotName, 
    date: { $gt: new Date(lastHour) }});
}

let registerCurrentForecastByTime = function (forecasts, time) {
  let swellHeightByTime = (report) => report.time === time;

  try {
    debugger;
    forecasts.forEach((forecast) => {
      var report = forecast.reports.find(swellHeightByTime);
      if (report) {
        appendToCurrentForecastBySpotName(forecast.spotName,
          {
            forecastSwellHeight: report.swellHeight 
          }
        );
      }
    });
  } catch (err) {
    console.log("fail to register current forecast: " + err.message);
  }
}

let registerLatestReport = function (spots) {
  try {
    spots.forEach(function (spot) {
      var recentReports = getLastHoureReportBySpotName(spot.name);
      var avgSwellHeight = getReportsAverageSwellHeight(recentReports);

      if (avgSwellHeight) {
        appendToCurrentForecastBySpotName(spot.name,
          { 
            avgSwellHeight: avgSwellHeight,
            hourlyReportCount: recentReports.count() 
          }
        );
      }
    });
  } catch (err) {
    console.log("fail to register current reports: " + err.message);
  }
}

let appendForecasts = function(forecasts, date, time) {
  if (Array.isArray(forecasts) && forecasts.length > 0) {
    registerCurrentForecastByTime(forecasts, time);
    return;
  }

  console.log("Error! could not find forecast to set for :" + date + " " + time);
}

let appendLatestReports = function(spots) {
  if(spots.length > 0) {
    registerLatestReport(spots);
  }
}

let appendCurrentSpots = function(spots) {
  try {
    spots.forEach(function (spot) {
      currentForecast.set(spot.name);
      console.log(currentForecast, spot.name);
    });
  } catch (err) {
    console.log("fail to register current forecast: " + err);
  }
}

let calcDate = () => Date.create().format("{yyyy}-{MM}-{dd}");
let calcTime = () => (Math.floor(Date.create().format('{HH}')/3)*300).toString();
let appleyDB = () => {
  console.log("update current forecast:!", currentForecast);
  return CurrentForecast.update(currentForecast);
}

let update = (spots, forecasts, date, time) => {
    checkLastUpdate();
    clearCurrentForecast();
    /*appendCurrentSpots(spots);*/
    appendForecasts(forecasts, date, time);
    appendLatestReports(spots);
    console.log("appleying to db");
    appleyDB();
    setLastUpdate();
}

/*
date - "YYYY-MM-DD"
time - 0 as midnight, 0300 as 3am, 1200 as 12pm, 2100 as 9pm ect.
*/
let updateCurrentForecastAndLatestReport = function(date = calcDate(), time = calcTime()) {
  Spots.find().then((spots) => {
    Forecasts.findByDate(date).then((forecasts) => {
      try {
        update(spots, forecasts, date, time);
      }
      catch (err) {
        console.log("fail updating current forecast", err);
      }
    }, (err) => {
      console.log("current forecast mannager fail getting forecasts", err);
    });
  }, (err) => {
    console.log("current forecast mannager fail getting spots", err);
  });
}

let initializeIntervalBasedSettings = () => {
  //TODO: get from config.server.currentForecastManagerInterval
  let interval =  3600000;

  // Initialize once befor setting interval
  updateCurrentForecastAndLatestReport();

  setInterval(() => { updateCurrentForecastAndLatestReport(); }, interval);
}

module.exports = {
  updateCurrentForecastAndLatestReport,
  initializeIntervalBasedSettings
};