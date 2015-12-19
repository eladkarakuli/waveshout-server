/*****************************************************************************/
/* Server Only Methods */
/*****************************************************************************/
function checkUserLoggedIn() {
	if (!Meteor.userId()) {
		throw new Meteor.Error(401, 'Error 401: Unauthorized Submit Report', 'user is not logged');
	}
}

Meteor.methods({
	'submitReport': function (report) {
		checkUserLoggedIn();
		Reports.insert(report, function(error, result) {
			if (error) {
				throw new Meteor.Error(400, 'Error 400: Submit Report', error.message);
			}

			Meteor.CurrentForecastManager.updateLatestReports();
			return true;
		});
	}
});