'use strict';

Meteor.populateDb = (function() {
	var fs = Meteor.npmRequire('fs');

	let addSpot = function(spot) {
		Spots.upsert({ name: spot.name }, { $set: {
			'lat': spot.lat,
			'lng': spot.lng,
			'name': spot.name
		}});
	}

	let LoadSpotsGithubFallback = function() {
		let result = Meteor.http.get('https://raw.githubusercontent.com/eladkarakuli/friend-surf/test-githubpopulation/static/spots.json');
		if (result !== undefined && result.statusCode === 200) {
	  		let spots = JSON.parse(result.content);
	  		_.each(spots, addSpot);
	  		return _.size(spots);
	  	}

	  	return undefined;
	}

	let isFileFound = function(path) {
		return fs.existsSync(path);
	}

	let getSpotsCsvPath = function() {
		// Get base path based on OS
		var isWin = /^win/.test(process.platform);
		var appBasePath = isWin ? process.cwd() : process.env.PWD;
		var rootFolderPath = isWin ? '..\\..\\..\\..\\..\\..\\' : '../';
		return path.join(appBasePath, rootFolderPath, '/static/spots.csv'); 
	}

	let loadData = function () {
	  var spotsCsvPath = getSpotsCsvPath();
	  var found = isFileFound(spotsCsvPath);

	  if (!found) {
	  	console.log('failed to find spots.csv file, using github as fallback...');
	  	var count = LoadSpotsGithubFallback();	  	
	  	console.log(count ? count + 'spots read and update DB' : 'failed to use github as a fallback!');
	  	return;
	  }

	  CSV().from.stream(
	    fs.createReadStream(spotsCsvPath),
	      {'escape': '\\'})
	    .on('record', Meteor.bindEnvironment(function(row, index) {
	    	Spots.upsert({ name: row[2] }, { $set: {
	    		'lat': row[0],
	    		'lng': row[1],
	    		'name': row[2]
	    	}});
	      }, function(error) {
	          console.log('Error in bindEnvironment:', error);
	      }
	    ))
	    .on('error', function(err) {
	      console.log('Error reading CSV:', err);
	    })
	    .on('end', function(count) {
	      console.log(count, 'spots read and update DB');
	    });
	}

	return Object.freeze({ loadData });
})();