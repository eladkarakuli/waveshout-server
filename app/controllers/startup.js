Meteor.initializeCurrentForecastManagerIntervalBasedSettings = function() {
	let interval = Meteor.settings.currentForecastManagerInterval || 3600000;

	// Initialize once befor setting interval
	Meteor.CurrentForecastManager.updateCurrentForecastAndLatestReport();

	Meteor.setInterval(() => { Meteor.CurrentForecastManager.updateCurrentForecastAndLatestReport(); }, interval);
}

Meteor.startup(() => {
	console.log("populating Data Base with the static data.")
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
