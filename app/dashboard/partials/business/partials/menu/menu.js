'use strict';

angular.module('analytics-app.dashboard.business.menu', [
	'angularUtils.directives.dirPagination', 'ngSanitize', 'ngCsv', 'ui.bootstrap', 'ui.router'])

	//dashboard controller
	.controller('DashboardBusinessMenuCtrl', ['$rootScope', 'restaurantService', '$filter', '$q', '$state', function($scope, restaurantService, $filter, $q, $state) {
		$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
		$scope.menuItems = [];

		$scope.sortType		= 'name';		//default sort type
		$scope.sortReverse	= false;		//default order   					

		$scope.selectedAll = false;			//select all checkbox

		//csv
		$scope.separator 	= ","; 
		$scope.filename 	= "menu-report";
	    $scope.filteredMenuItems = [];		//may or may not be filtered
	    $scope.selectedArray = [];			//checked items

	    //search
	   	$scope.search = {					//set the default search/filter term
	   		value: '',
	   		filter: {
	   			name: 'Anything',
	   			type: ''
	   		},
	   		equivalencyType: 'Equal to'
	   	};  

	    //table entries
	    $scope.numEntries = 10;

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
		    						if(menuItems[k].attributes.price !== null) {
		    							menuItems[k].attributes.price = menuItems[k].attributes.price.toFixed(2);
									} else {
										menuItems[k].attributes.price = "0.00";
									}
									
			    					$scope.menuItems.push(menuItems[k]);
			    					$scope.filteredMenuItems = $scope.menuItems;
			    					$scope.$digest();
			    				}
		    				});
		    			}
		    		});
				}
			});
		};

		getMenuItems();

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
			getPayments();
		});

		this.getHeaders = function() { return ["Menu Item", "Name", "Category", "Description", "Price", "Filter", "Search Query"] };

	    //export
	    this.getTableArray = function() {
	    	var exportArray = [];
	    	angular.forEach($scope.filteredMenuItems, function(value, index) {
	    		angular.forEach($scope.selectedArray, function(object, index1) {
	    			if(value.id === object.id) {
	    				exportArray.push(object)
	    			}
	    		});
	    	});

	    	return exportArray;
	    };

	    this.setNewFilter = function(newFilter) {
	    	//reset search
	    	$scope.search.value = '';
	    	//change filter name
	    	$scope.search.filter.name = newFilter;

	    	if(newFilter === 'Menu Item') {
	    		$scope.search.filter.type = 'id';
	    	} else if(newFilter === 'Name') {
	    		$scope.search.filter.type = 'name';
	    	} else if(newFilter === 'Category') {
	    		$scope.search.filter.type = 'menuCategory';
	    	} else if(newFilter === 'Description') {
	    		$scope.search.filter.type = 'itemDescription';
	    	} else if(newFilter === 'Price') {
	    		$scope.search.filter.type = 'price';
	    	} else {
	    		$scope.search.filter.type = '';
	    	}
	    };

	    $scope.$watch('search.value', function() {
	    	$scope.filteredMenuItems = $filter('filter')($scope.menuItems, $scope.searchFilter);
	    }, true);

	    $scope.$watch('filteredMenuItems', function(newValues) {
	    	$scope.selectedArray.length = 0;

	    	angular.forEach(newValues, function(entry) {
	    		if (entry.value === true) {
	    			$scope.selectedArray.push({id:entry.id, name:entry.name, menuCategory:entry.menuCategory, itemDescription:entry.itemDescription,
	    				price:entry.price, filter:$scope.search.filter.name, query:($scope.search.value == "") ? "none" : $scope.search.value});
	    		}
	    	});

	    	if($scope.selectedArray.length === $scope.filteredMenuItems.length && $scope.filteredMenuItems.length > 0) {
	    		$scope.selectedAll = true;
	    	} else {
	    		$scope.selectedAll = false;
	    	}

	    }, true);

	    this.sortChange = function(sortColumn) {
	    	if($scope.sortType === sortColumn) {
	    		$scope.sortReverse = !$scope.sortReverse;
	    	} else {
	    		$scope.sortType = sortColumn;
	    		$scope.sortReverse = false;
	    	}
	    };

	    this.checkAll = function() {
	    	$scope.selectedAll = !$scope.selectedAll;

	    	if ($scope.selectedAll) {
	    		$scope.selectedAll = true;
	    	} else {
	    		$scope.selectedAll = false;
	    	}

	    	angular.forEach($scope.filteredMenuItems, function (item) {
	    		item.value = $scope.selectedAll;
	    	});
	    };

	    $scope.searchFilter = function(item) {
	    	var searchTerm = $scope.search.value.toLowerCase();

	    	var id = item.id.toString().toLowerCase();
	    	var name = item.name.toString().toLowerCase();
	    	var menuCategory = item.menuCategory.name.toString().toLowerCase();
	    	var itemDescription = item.itemDescription.toString().toLowerCase();
	    	var price = item.price.toString().toLowerCase();

	    	//less than
	    	if($scope.search.equivalencyType === 'Less than') {
	    		if($scope.search.filter.name === 'Price') {
	    			if(parseFloat(item.price) < parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		}
	    		//greater than
	    	} else if($scope.search.equivalencyType === 'Greater than') {
	    		if($scope.search.filter.name === 'Price') {
	    			if(parseFloat(item.price) > parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		}
	    		//equal to
	    	} else {
	    		if($scope.search.filter.name === 'Anything') {
		    		if(id.indexOf(searchTerm) === 0 || name.indexOf(searchTerm) === 0 || menuCategory.indexOf(searchTerm) === 0 || itemDescription.indexOf(searchTerm) === 0 || price.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Menu Item') {
		    		if(id.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Name') {
		    		if(name.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Category') {
		    		if(menuCategory.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Description') {
		    		if(itemDescription.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Price') {
		    		if(price.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	}
	    	}

	    	return false;
	    };

	    this.validEquivalencyType = function() {
	    	if($scope.search.filter.name === 'Anything' || $scope.search.filter.name === 'Menu Item' || $scope.search.filter.name === 'Name'
	    		|| $scope.search.filter.name === 'Category' || $scope.search.filter.name === 'Description') {
	    		$scope.search.equivalencyType = 'Equal to';
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };

	    $scope.addMenu = function() {
	    	$state.go('dashboard.business.add-menu');
	    };

		$scope.addMenuCategory = function() {
	    	$state.go('dashboard.business.add-menu-category');
	    };

	    $scope.addMenuItem = function() {
	    	$state.go('dashboard.business.add-menu-item', { 'menu_item_id': '0' });
	    };

	    $scope.addItemModifiers = function() {
	    	$state.go('dashboard.business.add-item-modifier');
	    };

	    $scope.editMenuItem = function(menu_item) {
	    	$state.go('dashboard.business.add-menu-item', { 'menu_item_id': menu_item.id });
	    };

	    $scope.deleteMenuItem = function(menu_item) {
	    	var MenuItem = Parse.Object.extend("MenuItem");
			var menuItemQuery = new Parse.Query(MenuItem);
			menuItemQuery.get(menu_item.id, {
			  success: function(menuItemObject) {
			    menuItemObject.destroy({});
			    $scope.removeRow(menu_item.id);
			  },
			  error: function(menuItemObject, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			  }
			});
	    };

	    $scope.removeRow = function(menu_item_id) {
	    	var index = -1;		
			var comArr = eval( $scope.filteredMenuItems );
			for( var i = 0; i < comArr.length; i++ ) {
				if( comArr[i].id === menu_item_id ) {
					index = i;
					break;
				}
			}

			$scope.filteredMenuItems.splice( index, 1 );
			$scope.$digest();
	    };
	}]);