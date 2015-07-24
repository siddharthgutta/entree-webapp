'use strict';

angular.module('analytics-app.dashboard.business.add-menu-category', [
	'ui.bootstrap', 'ui.router'])

	//dashboard controller
	.controller('DashboardBusinessAddMenuCategoryCtrl', ['$rootScope', '$state', '$stateParams', 'restaurantService', function($scope, $state, $stateParams, restaurantService) {
	    $scope.currentRestaurant = restaurantService.getCurrentRestaurant();

	    $scope.formSubmit = false;
	    $scope.formSuccess = false;

		$scope.menus = [];

	   	$scope.addMenuCategoryForm = {
	   		categoryName: '',
	   		categoryMenu: ''
	   	}

	   	var getMenus = function() {
	    	$scope.menus.length = 0;

	    	// Get menu for current restaurant
			var menuRelation = $scope.currentRestaurant.relation("menus");
    		var menuQuery = menuRelation.query();

			menuQuery.find().then(function(menus) {
				for(var i = 0; i < menus.length; i++) {
					$scope.menus.push(menus[i]);
					$scope.$apply();
				}
			});
		};

		getMenus();

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
			getMenuCategories();
		});

		$scope.cancelMenuCategory = function() {
	    	$state.go('dashboard.business.menu');
	    };

	    $scope.createMenuCategory = function() {
	    	var MenuCategory = Parse.Object.extend("MenuCategory");
	    	var menuCategory = new MenuCategory();

	    	menuCategory.set("name", $scope.addMenuCategoryForm.categoryName);

	    	var Menu = Parse.Object.extend("Menu");
			var menu = new Menu();
			menu.id = $scope.addMenuCategoryForm.categoryMenu;

	    	menuCategory.set("menu", menu);

	    	menuCategory.save(null, {				
	    		success: function(menuCategory) {
	    			resetForm();
	    			$scope.formSubmit = true;
	    			$scope.formSuccess = true;  
	    			$scope.$apply();
	    			resetForm();
	    		},
	    		error: function(menuCategory, error) {
	    			resetForm();
	    			$scope.formSubmit = true;
	    			$scope.formSuccess = false;
	    			$scope.$apply();
	    		}
	    	});
	    };

	    var resetForm = function() {
	    	$scope.addMenuCategoryForm = {
		   		categoryName: '',
		   		categoryMenu: ''
		   	};
		   	$scope.$apply();
	    };
	}]);
