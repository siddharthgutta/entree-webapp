'use strict';

angular.module('analytics-app.dashboard', [
	'ui.router', 'ui.bootstrap'
	])

	//declared ngRoute
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider
		.state('dashboard', {
			url: '/dashboard',
			templateUrl: './app/dashboard/dashboard.html',
			controller: 'DashboardCtrl',
			resolve: {
				function(restaurantService) { return restaurantService.getCurrentRestaurant(); }
			}
		})
		.state('dashboard.home', {
			url: '/home',
			templateUrl: './app/dashboard/partials/home/home.html',
			controller: 'DashboardHomeCtrl',
			resolve: {
				function(restaurantService) { return restaurantService.getCurrentRestaurant(); }
			}
		})
		.state('dashboard.reporting', {
			url: '/reporting',
			templateUrl: './app/dashboard/partials/reporting/reporting.html',
			controller: 'DashboardReportingCtrl',
			resolve: {
				function(restaurantService) { return restaurantService.getCurrentRestaurant(); }
			}
		})
		.state('dashboard.business', {
			url: '/business',
			templateUrl: './app/dashboard/partials/business/business.html',
			controller: 'DashboardBusinessCtrl',
			resolve: {
				function(restaurantService) { return restaurantService.getCurrentRestaurant(); }
			}
		});
	}])

	// always listen for new current restaurant,
	.factory('restaurantService', ['$rootScope', '$q', function($scope, $q) {
		var currentRestaurant;

		return {
			getCurrentRestaurant: function() {
				$scope.currentUser = Parse.User.current();

				if(typeof currentRestaurant === 'undefined') {
					if(typeof $scope.currentUser.attributes.defaultRestaurant !== 'undefined') {
						currentRestaurant = $scope.currentUser.attributes.defaultRestaurant;

						// Get restaurant for user
						var restaurantsRelation = $scope.currentUser.relation("restaurants");
    					var restaurantQuery = restaurantsRelation.query();

						restaurantQuery.find().then(function(restaurants) {
							$scope.restaurants = restaurants;
						});

						return currentRestaurant;
					} else {
					    var defer = $q.defer(); // Create a deferring object
					    
						// Get restaurant for user
						var restaurantsRelation = $scope.currentUser.relation("restaurants");
    					var restaurantQuery = restaurantsRelation.query();

						restaurantQuery.find().then(function(restaurants) {
							$scope.restaurants = restaurants;
							currentRestaurant = restaurants[0];
							defer.resolve(currentRestaurant);
						});

						return defer.promise; // Create an Angular promise to be resolved
				    }
				} else {
				    return currentRestaurant;
				}
			},

			updateCurrentRestaurant: function(newRestaurant) {
				currentRestaurant = newRestaurant;
				$scope.$broadcast("newCurrentRestaurant");
			}
		};
	}])

	//dashboard controller
	.controller('DashboardCtrl', ['$rootScope', '$state', '$location', 'restaurantService', function($scope, $state, $location, restaurantService) {
		$scope.currentRestaurant = restaurantService.getCurrentRestaurant();

	    $scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
		});

		$scope.logOut = function() {
			Parse.User.logOut();
			$scope.currentUser = null;
			$state.go('login');
		}

		$scope.isActive = function(route) {
			return $location.path().indexOf(route) > -1;
		};

		$scope.getRestaurantName = function(restaurant) {
			return restaurant.attributes['name'];
		};

		$scope.changeRestaurant = function(newRestaurant) {
			restaurantService.updateCurrentRestaurant(newRestaurant);
		}

		$scope.isCurrentRestaurant = function(restaurant) {
			return $scope.currentRestaurant.id === restaurant.id;
		}
	}])

	.directive('usersName', function() {
		return {
			template: '{{currentUser.get(\'name\')}}'
		};
	})

	.directive("restaurantName", function() {
		return {
			template: '{{getRestaurantName(restaurant)}}'
		};
	});
