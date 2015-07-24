'use strict';

// Move this into a environment file. Credentials should never be hardcoded or checked into repos
Parse.initialize("siTMH1dC5Qk84JvfZ3U5xfRfKwqb5jQv4CnCQGZn", "qRJjuASPvnp9BULGIqGOeBwcsZB0j3dV65VaoKJg");

angular.module('analytics-app.login', ['ui.router'])

	//declared ngRoute
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider
			.state('login', {
				url: "/login",
				templateUrl: './app/login/login.html',
				controller: 'LoginCtrl'
			});
	}])

	//login controller
	.controller('LoginCtrl', ['$rootScope', '$state', function($scope, $state) {
		$scope.invalidLogin = false;
		$scope.passwordResetForm = false;
		$scope.emailSent = false;

		$scope.user = {
			username: "",
			password: ""
		};

		$scope.scenario = 'Log in';
		$scope.currentUser = Parse.User.current();
		
		$scope.logIn = function(form) {
			Parse.User.logIn(form.username, form.password, {
				success: function(user) {
					$scope.currentUser = user;
					$scope.$apply();
					$state.go('dashboard.home');
				},
				error: function(user, error) {
					$scope.invalidLogin = true;
					$scope.$apply();
					console.log("unable to log in: " + error.code + " " + error.message); 
				}
			});
		};

		$scope.sendPassword = function(form) {
			Parse.User.requestPasswordReset(form.username , {
            	success: function () {
					$scope.emailSent = true;
					$scope.$apply();
            	},
            	error: function (error) {
               		// Show the error message somewhere
                	$scope.invalidLogin = true;
                	$scope.$apply();
            	}
        	});
		};

		$scope.togglePasswordReset = function() {
			//empty the fields
			$scope.invalidLogin = false;
			$scope.emailSent = false;
			$scope.passwordResetForm = !$scope.passwordResetForm;

			//clear password, leave username
			$scope.user = {
				username: $scope.user.username,
				password: ""
			};
		};

}]);