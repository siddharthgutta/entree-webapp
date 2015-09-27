'use strict';

angular.module('analytics-app.dashboard.business.add-menu', [
	'ui.bootstrap', 'ui.router'])

	//dashboard controller
	.controller('DashboardBusinessAddMenuCtrl', ['$rootScope', '$state', 'restaurantService', function($scope, $state, restaurantService) {
	    $scope.currentRestaurant = restaurantService.getCurrentRestaurant();

	    $scope.formSubmit = false;
	    $scope.formSuccess = false;

		$scope.menuCategories = [];

	   	$scope.addMenuForm = {
	   		menuName: ''   		
	   	};

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
		});

		$scope.cancelMenu = function() {
	    	$state.go('dashboard.business.menu');
	    };

	    $scope.createMenu = function() {
	    	var Menu = Parse.Object.extend("Menu");
	    	var menu = new Menu();
	    	menu.set("name", $scope.addMenuForm.menuName);

	    	menu.save(null, {				
	    		success: function(menu) {
	    			var relation = $scope.currentRestaurant.relation("menus");
	    			relation.add(menu)

	    			$scope.currentRestaurant.save(null, {
	    				success: function(restaurant) {
			    			resetForm();
	    					$scope.formSubmit = true;
	    					$scope.formSuccess = true;  
	    					$scope.$apply();
	    				},
	    				error: function(restaurant, error) {
	    					resetForm();
	    					$scope.formSubmit = true;
	    					$scope.formSuccess = false;
	    					$scope.$apply();
	    				}
	    			});
	    		},
	    		error: function(menu, error) {
	    			resetForm();
	    			$scope.formSubmit = true;
	    			$scope.formSuccess = false;
	    			$scope.$apply();
	    		}
	    	});
	    };

	    var resetForm = function() {
	    	$scope.addMenuForm = {
	   			menuName: ''
	   		};
	    };
	}]);
