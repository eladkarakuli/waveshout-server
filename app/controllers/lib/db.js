'use strict';

var config = require('config'),
		Firebase = require('firebase'),
		Fireproof = require('fireproof'),
		Promise = require('promise');
		/*sync = require('sync');*/
		/*Fiber = require('fibers'),*/


var SPOTS = "spots";
var REPORTS = "reports";
var FORECASTS = "forecasts";
var CURRENT_FORECAST = "currents";

/*var fireBaseApi = { eq: x(n) => x.equalTo(n),
										gt: x(n) => x.startAt(n),
										lt: x(n) => x.endAt(n)
									};*/

let decorateRefQuery = function(query) {
	Object.keys(query).forEach((key) => {
		if (typeof(query[key]) === 'object') {
			fbAPIKey = Object.key(query[key]);
		}
		else{

		} 
	});
}


/*
  [forecast,Bat-Yam,2015-12-18] -> "forecast/Bat-Yam/2015-12-18"
*/
let childListToFBPath = function childListToFBPath(childs, root) {
	return childs.reduce((path, childName) => {
		return path += `/${childName}`; 
	}, root || "");	
}

var firebaseRef = function firebaseRef(path) {	
	let fullP = `${config.app.firebaseUrl}${path}`;
	return new Firebase(fullP);
}

var fireproofRef = function fireproofRef(path) {
	return new Fireproof(firebaseRef(path));
}

var spotsRef = fireproofRef(SPOTS);
var reportsRef = fireproofRef(REPORTS);
var forecastsRef = fireproofRef(FORECASTS);
var currentForecastRef = fireproofRef(CURRENT_FORECAST);

var jsonToArray = (obj) => obj && Object.keys(obj).map(function(k) { return obj[k] });
var mapToJson = (map) => {
        let obj = Object.create(null);
        for (let [k,v] of map) {
            // We don’t escape the key '__proto__'
            // which can cause problems on older engines
            obj[k] = v;
        }
        return obj;
};

var promiseValRequest = (request) => {
	return new Promise((resolve, reject) => {
		var result = request.then((snap) => {
			try {
				var arrResult = jsonToArray(snap.val());
				resolve(arrResult);
			} catch(err) {
				reject(err);
			}
		}, (err) => {
			console.log("weh?", err);
			reject(err);
		});
	});
}


let Spots = {
	find() {
		return promiseValRequest(spotsRef.once('value'));
	}
}

let Reports = {
	find() {
		return promiseValRequest(reportsRef.once('value'));
	}
}

let Forecasts = {
	find(query) {
		return promiseValRequest(forecastsRef.once('value'));
	},
	findByDate(date) {
		var path = childListToFBPath([date], FORECASTS);
		return promiseValRequest(fireproofRef(path).once('value'));
	},
	findByRequestDate(date, spotName, requestDate) {
		var path = childListToFBPath([date, spotName], FORECASTS);
		return promiseValRequest(fireproofRef(path).child('requestDate')
														 								.startAt(requestDate)
														 								.once('value'));
	},
	update(forecast) {
		var childPath = [forecast.date, forecast.spotName];
		var forecastRef = fireproofRef(childListToFBPath(childPath, FORECASTS));
		
		forecastRef.update(forecast).then((success) => {}, 
			(err)=> {
				console.log("fail updating forecast", err);
		});
	}
}

let CurrentForecast = {
	update(map) {
		let json = mapToJson(map);
		currentForecastRef.set(json).then((success) => {}, 
			(err)=> {
				console.log("fail updating current forecast", err);
		});
	}
}

module.exports ={
	Spots,
	Reports,
	CurrentForecast,
	Forecasts
} 