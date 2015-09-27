'use strict';

angular.module('analytics-app.dashboard.business.add-menu-item', [
	'ui.bootstrap', 'ui.router'])

	//dashboard controller
	.controller('DashboardBusinessAddMenuItemCtrl', ['$rootScope', '$state', '$stateParams', 'restaurantService', function($scope, $state, $stateParams, restaurantService) {
	    $scope.currentRestaurant = restaurantService.getCurrentRestaurant();
	    $scope.currentMenuItemId = $stateParams.menu_item_id;

	    $scope.formSubmit = false;
	    $scope.formSuccess = false;

		$scope.menus = [];
		$scope.menuCategories = [];

	   	$scope.addMenuItemForm = {
	   		itemName: '',
	   		itemPrice: '',
	   		itemMenu: '',
	   		itemCategory: '',
	   		itemDescription: ''
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

		var getMenuCategories = function() {
			if($scope.addMenuItemForm.itemMenu !== '') {
				$scope.menuCategories.length = 0;

				var MenuCategory = Parse.Object.extend("MenuCategory");
				var menuCategoryQuery = new Parse.Query(MenuCategory);

				var Menu = Parse.Object.extend("Menu");
				var menu = new Menu();
				menu.id = $scope.addMenuItemForm.itemMenu;

				menuCategoryQuery.equalTo("menu", menu);

			    //getters
			    MenuCategory.prototype.__defineGetter__("name", function() {
			    	return this.get("name");
			    });

			    menuCategoryQuery.find().then(function(menuCategories) {
			    	for(var i = 0; i < menuCategories.length; i++) {
			    		console.log(menuCategories[i]);
			    		$scope.menuCategories.push(menuCategories[i]);
			    		$scope.$digest();
			    	}
			    });
			}
		};

		$scope.$watch('addMenuItemForm.itemMenu', function() {
			getMenuCategories();
	    }, true);

		if($scope.currentMenuItemId !== 0) {
			var MenuItem = Parse.Object.extend("MenuItem");
			var menuItemQuery = new Parse.Query(MenuItem);
			menuItemQuery.get($scope.currentMenuItemId, {
			  success: function(menuItemObject) {
			  	$scope.addMenuItemForm.itemName = menuItemObject.attributes.name;
			  	$scope.addMenuItemForm.itemPrice = menuItemObject.attributes.price;
			  	$scope.addMenuItemForm.itemCategory = menuItemObject.attributes.menuCategory;
			  	$scope.addMenuItemForm.itemDescription = menuItemObject.attributes.itemDescription;

			  	$scope.$apply();
			  },
			  error: function(menuItemObject, error) {
			  }
			});
		}

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
			getMenuCategories();
		});

		$scope.cancelItem = function() {
	    	$state.go('dashboard.business.menu');
	    };

	    $scope.createItem = function() {
	    	if($scope.currentEmployeeId === 0) {
		    	var MenuItem = Parse.Object.extend("MenuItem");
				var menuItem = new MenuItem();

				menuItem.set("name", $scope.addMenuItemForm.itemName);
				menuItem.set("price", parseInt($scope.addMenuItemForm.itemPrice));

				var MenuCategory = Parse.Object.extend("MenuCategory");
				var menuCategory = new MenuCategory();
				menuCategory.id = $scope.addMenuItemForm.itemCategory;

				menuItem.set("menuCategory", menuCategory);
				menuItem.set("itemDescription", $scope.addMenuItemForm.itemDescription);

				menuItem.save(null, {				
					success: function(menuItem) {
						$scope.formSubmit = true;
						$scope.formSuccess = true;  
						$scope.$apply();
					},
					error: function(menuItem, error) {
						$scope.formSubmit = true;
						$scope.formSuccess = false;
						$scope.$apply();
					}
				});
			} else {
				var MenuItem = Parse.Object.extend("MenuItem");
				var menuItemQuery = new Parse.Query(MenuItem);
				menuItemQuery.get($scope.currentMenuItemId, {
			  		success: function(menuItem) {
			  			menuItem.set("name", $scope.addMenuItemForm.itemName);
						menuItem.set("price", parseInt($scope.addMenuItemForm.itemPrice));
						menuItem.set("itemDescription", $scope.addMenuItemForm.itemDescription);

						var MenuCategory = Parse.Object.extend("MenuCategory");
						var menuCategory = new MenuCategory();
						menuCategory.id = $scope.addMenuItemForm.itemCategory;

						menuItem.set("menuCategory", menuCategory);

						menuItem.save(null, {				
							success: function(menuItem) {
				    			resetForm();
								$scope.formSubmit = true;
								$scope.formSuccess = true;  
								$scope.$apply();
							},
							error: function(menuItem, error) {
				    			resetForm();
								$scope.formSubmit = true;
								$scope.formSuccess = false;
								$scope.$apply();
							}
						});
			  		},
			  		error: function(employeeObject, error) {
	    				resetForm();
			  			$scope.formSubmit = true;
						$scope.formSuccess = false;
						$scope.$apply();
			  		}
			  	});
			}
	    };

	    var resetForm = function() {
	    	$scope.addMenuItemForm = {
	   			itemName: '',
	   			itemPrice: 0,
	   			itemCategory: null,
	   			itemDescription: ''
	   		}
	    }
	}]);
