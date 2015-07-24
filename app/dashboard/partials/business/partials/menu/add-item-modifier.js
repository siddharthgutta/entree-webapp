'use strict';

angular.module('analytics-app.dashboard.business.add-item-modifier', [
	'ui.bootstrap', 'ui.router'])

	//dashboard controller
	.controller('DashboardBusinessAddItemModifierCtrl', ['$rootScope', '$state', '$stateParams', 'restaurantService', function($scope, $state, $stateParams, restaurantService) {
	    $scope.currentRestaurant = restaurantService.getCurrentRestaurant();
	    $scope.currentMenuItemId = $stateParams.menu_item_id;

	    $scope.formSubmit = false;
	    $scope.formSuccess = false;

		$scope.menuItems = [];

	   	$scope.addItemModifierForm = {
	   		modifierName: '',
	   		modifierPrice: '',
	   		modifierItems: []
	   	}

	   	var getMenuItems = function() {
	    	$scope.menuItems.length = 0;

	    	// Get menu for current restaurant
			var menuRelation = $scope.currentRestaurant.relation("menus");
    		var menuQuery = menuRelation.query();

			menuQuery.find().then(function(menus) {
				for(var i = 0; i < menus.length; i++) {
					var MenuCategory = Parse.Object.extend("MenuCategory");
					var menuCategoryQuery = new Parse.Query(MenuCategory);

					MenuCategory.prototype.__defineGetter__("name", function() {
						return this.get("name");
					});

		    		menuCategoryQuery.find().then(function(menuCategories) {
		    			for(var j = 0; j < menuCategories.length; j++) {
		    				var MenuItem = Parse.Object.extend("MenuItem");
							var menuItemQuery = new Parse.Query(MenuItem);
		    				menuItemQuery.equalTo("menuCategory", menuCategories[j]);
							menuItemQuery.include("menuCategory");

		    				//getters
						   	MenuItem.prototype.__defineGetter__("name", function() {
						      return this.get("name");
						    });
						   	MenuItem.prototype.__defineGetter__("menuCategory", function() {
						      return this.get("menuCategory");
						    });
						   	MenuItem.prototype.__defineGetter__("itemDescription", function() {
						      return this.get("itemDescription");
						    });
						    MenuItem.prototype.__defineGetter__("price", function() {
						      return this.get("price");
						    });

		    				menuItemQuery.find().then(function(menuItems) {
		    					for(var k = 0; k < menuItems.length; k++) {
			    					$scope.menuItems.push(menuItems[k]);
			    					$scope.$digest();
			    				}
		    				});
		    			}
		    		});
				}
			});
		};

		getMenuItems();

		$scope.cancelModifier = function() {
	    	$state.go('dashboard.business.menu');
	    };

	    $scope.createModifier = function() {
		   	var MenuItemModifier = Parse.Object.extend("MenuItemModifier");
			var menuItemModifier = new MenuItemModifier();

			menuItemModifier.set("name", $scope.addItemModifierForm.modifierName);
			menuItemModifier.set("price", parseInt($scope.addItemModifierForm.modifierPrice));

			menuItemModifier.save(null, {				
				success: function(menuItemModifier) {
					var menuItemsRelation = menuItemModifier.relation("menuItems");
			
					for(var i = 0; i < $scope.menuItems.length; i++) {
						if($scope.menuItems[i].checked === true) {
	    					menuItemsRelation.add($scope.menuItems[i]);
						}
					}

					menuItemModifier.save(null, {
	    				success: function(menuItemModifier) {
			    			resetForm();
	    					$scope.formSubmit = true;
	    					$scope.formSuccess = true;  
	    					$scope.$apply();
	    				},
	    				error: function(MenuItemModifier, error) {
	    					resetForm();
	    					$scope.formSubmit = true;
	    					$scope.formSuccess = false;
	    					$scope.$apply();
	    				}
	    			});
				},
				error: function(menuItemModifier, error) {
					$scope.formSubmit = true;
					$scope.formSuccess = false;
					$scope.$apply();
				}
			});
	    };

	    var resetForm = function() {
	    	$scope.addItemModifierForm = {
		   		modifierName: '',
		   		modifierPrice: '',
		   		modifierItems: []
		   	};
	    }
	}]);
