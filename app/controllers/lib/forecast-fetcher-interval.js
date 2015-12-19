"use strict";

import * as forecastFetcher from './forecast-fetcher';
import * as forecastApiUrlGenerator from './forecast-url-generator';
import { check } from './utils';
import { Spots, Forecasts } from './db';

var Promise = require('promise'),
		config = require('config'),
		sugar = require('sugar');

let getFormatedDate = () => new Date().format("{yyyy}-{MM}-{dd}");
let getHourAgo = () => Date.create('1 hour ago').toString();

var managerProto = {
	fetchList: [],
	apiBaseUrl: "",
	apiKey: "",
	interval: 0,

	findForecastByRequestDate(spotName, date, requestDate) {
		return new Promise((resolve, reject) => {
			Forecasts.findByRequestDate(date, spotName, requestDate).then((forecasts) => {
				resolve(forecasts);
			}, (err) => {
				reject(err);
			});
		});
	},
	
	fetchForecastHandler(url, spotName) {
		console.log("handle fetch", spotName);
		
		this.findForecastByRequestDate(spotName, getFormatedDate(), getHourAgo()).then((forecast) => {
			//don't handle fetch when spot is alredy up-to-date
			if (!forecast) {
				try {
					console.log("Fetching forecast for ", spotName);
					forecastFetcher.fetch(url).then(
						function(result) {
							forecastFetcher.saveFetch(result, spotName);
						},
						function(error) {
							console.log("Faild to fetch ", url, spotName, error.message);
					});
				}
				catch(error) {
					console.log("Error while fetching forecast", error);
				}
			} else {
				console.log(spotName, "alredy updated, skiped fetch.")
			}
		});
	},

	/*let validateTodayFetch = function() {
		return Forecasts.find({date: new Date().toJSON().slice(0,10)}).count() === 0;
	}*/

	addFetcher(spotName, url) {
			console.log('Setting fetch interval for ', spotName, url);
			this.fetchList.push(() => { this.fetchForecastHandler(url, spotName); });
	},

	generateUrl(spot, baseUrl, apiKey) {
		let params = {
			lat: spot.lat,
			lng: spot.lng,
			key: apiKey
		};

		return forecastApiUrlGenerator.generate(baseUrl, params);
	},

	runFetch() {
		this.fetchList.forEach((handler) => handler());
	},

	generateFetchers(spots) {
		spots.forEach((spot) => {
			try {
				let url = this.generateUrl(spot, this.apiBaseUrl, this.apiKey);
				this.addFetcher(spot.name, url);
			}
			catch(error) {
				throw new Error("Fail generating fetcher for " + spot + " " + error);
			}
		});
	},

	setRunFetchInterval(interval) {
		setInterval(() => { runFetch() } , interval);
	},

	initializeSpotsFetchers(resolve, reject) {
		Spots.find().then((spots) => {
			try {
				this.generateFetchers(spots);
				this.setRunFetchInterval(this.interval);
				resolve(spots.length);
			} 
			catch(err) {
				console.log("Failed initializing fetching inervals!", err);
				reject(err);
			}
		}, (err) => {
			console.log("error finding spots");
			reject(err);
		});
	},

	initializeFetchingIntervals(apiBaseUrl, apiKey, interval = 3600000) { 
		check(apiBaseUrl, String);
		check(apiKey, String);

		this.apiBaseUrl = apiBaseUrl;
		this.apiKey = apiKey;
		this.interval = interval;

		return new Promise((resolve, reject) => {
			this.initializeSpotsFetchers(resolve, reject);
		});
	},


	initializeFetchingIntervalsBasedSettings() {
		return this.initializeFetchingIntervals(config.server.forecastApiUrl, config.server.forecastApiKey, config.server.forecastFetchInterval);
	}
}

let runFetch = ()=> { 
	try {
		return managerProto.runFetch() 
	}
	catch(err) {
		console.log("Faild running a fetch", err);
	}
}

let initializeBasedSettings = ()=> {
	try {
		return managerProto.initializeFetchingIntervalsBasedSettings();
	}
	catch(err) {
		console.log("Faild initializing fetch intervals based settings", err);
	}
}


module.exports = {
 runFetch,
 initializeBasedSettings
}