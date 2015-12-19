Meteor.publish('currentForecasts', function() {
    return CurrentForecast.find();
});

Meteor.publish('spots', function() {
    return Spots.find();
});

Meteor.publish('reports', function() {
	return Reports.find();
});

Meteor.publish('likes', function() {
	return Likes.find({userId: this.userId});
});


/*Meteor.publish('reports-by-spot', function(spotName) {
	return Reports.find({spotName: spotName});
});*/