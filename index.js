var koa = require('koa'),
path = require('path'),
views = require('koa-views'),
config = require('config'),
serve = require('koa-static');

import * as fetchingManager from './app/controllers/lib/forecast-fetcher-interval';
import * as currentForecastManager from './app/controllers/lib/current-forecast-manager';
/*
var initializeCurrentForecastManagerIntervalBasedSettings = () => {
	let interval = settings.server.currentForecastManagerInterval || 3600000;

	// Initialize once befor setting interval
	Meteor.CurrentForecastManager.updateCurrentForecastAndLatestReport();

	Meteor.setInterval(() => { Meteor.CurrentForecastManager.updateCurrentForecastAndLatestReport(); }, interval);
}

Meteor.startup(() => {
	console.log("get spots from FB");
    Meteor.populateDb.loadData(); 
 
    console.log("Initializing forecast fetcher interval based settings.");
    Meteor.fetchingPoolManager.initializeFetchingIntervalsBasedSettings();

    // don't wait for first interval and run immediate: 
    console.log("Running fetch...");
    Meteor.fetchingPoolManager.runFetch();

    console.log("Initializing current forecast manager based settings.");
    Meteor.initializeCurrentForecastManagerIntervalBasedSettings();

	console.log("Finish server startup!");
});
*/

console.log("Start server...");

console.log("Initializing forecast fetcher interval based settings...");
debugger;
fetchingManager.initializeBasedSettings().then((count) => {
  console.log(`Initialized ${count} fetching intervals.`);
  
  console.log("Running fetch...");
  fetchingManager.runFetch();

  console.log("Initializing current forecast manager based settings.");
  currentForecastManager.initializeIntervalBasedSettings();
  
  console.log("Finish server startup!");
},
(err) => {
  console.log(err);
  console.log("Abort startup!");
  return;
});

var app = module.exports = koa();

// initialize render helper
app.use(views(config.template.path, config.template.options));

require('./app/routes')(app);
if (!module.parent) app.listen(3000);