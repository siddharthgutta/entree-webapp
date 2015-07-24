'use strict';

angular.module('analytics-app.dashboard.reporting.orders.data-table', [
	'angularUtils.directives.dirPagination', 'ngSanitize', 'ngCsv'])

	//dashboard controller
	.controller('DashboardReportingOrdersDataTableCtrl', ['$rootScope', 'restaurantService', '$filter', function($scope, restaurantService, $filter) {
		$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
		$scope.orders = [];

		$scope.sortType		= 'createdAt';	//default sort type
		$scope.sortReverse	= false;		//default order   					

		$scope.selectedAll = false;			//select all checkbox

		//csv
		$scope.separator 	= ","; 
		$scope.filename 	= "orders-report";
	    $scope.filteredOrders = [];		//may or may not be filtered
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

	   	$scope.startDate = new Date();
	   	$scope.startDate.setHours(0,0,0,0);
	   	$scope.endDate = new Date();
	   	$scope.endDate.setHours(23,59,59,59);
	   	$scope.maxDate = new Date();
	   	$scope.maxDate.setHours(23,59,59,59);

	    //table entries
	    $scope.numEntries = 10;

	    $scope.startDateChange = function(startDate) {
	    	$scope.startDate = startDate;
	   		$scope.startDate.setHours(0,0,0,0);

	   		getOrders();
	    };

	    $scope.endDateChange = function(endDate) {
	    	$scope.endDate = endDate;
	    	$scope.endDate.setHours(23,59,59,59);

	    	getOrders();
	    };

	    var getOrders = function() {
	    	$scope.orders.length = 0;

			// get parties for current restaurant
			var Party = Parse.Object.extend("Party");
			var partyQuery = new Parse.Query(Party);
			partyQuery.equalTo("restaurant", $scope.currentRestaurant);
			partyQuery.greaterThanOrEqualTo("createdAt", $scope.startDate);
			partyQuery.lessThanOrEqualTo("createdAt", $scope.endDate);
			
			partyQuery.find().then(function(parties) {
				for(var i = 0; i < parties.length; i++) {
					var Order = Parse.Object.extend("Order");
					var orderQuery = new Parse.Query(Order);
		    		orderQuery.equalTo("party", parties[i]);
					orderQuery.include("menuItem");

		    		//getters
					var MenuItem = Parse.Object.extend("MenuItem");
					MenuItem.prototype.__defineGetter__("name", function() {
						return this.get("name");
					});

					Order.prototype.__defineGetter__("menuItem", function() {
						return this.get("menuItem");
					});
					Order.prototype.__defineGetter__("menuItemModifiers", function() {
						return this.get("menuItemModifiers");
					});
					Order.prototype.__defineGetter__("party", function() {
						return this.get("party");
					});
					Order.prototype.__defineGetter__("seat", function() {
						return this.get("seat");
					});
					Order.prototype.__defineGetter__("notes", function() {
						return this.get("notes");
					});

		    		orderQuery.find().then(function(orders) {
		    			for(var j = 0; j < orders.length; j++) {
		    				$scope.orders.push(orders[j]);
							$scope.filteredOrders = $scope.orders;
							$scope.$digest();
		    			}
					});
		    	}
		    });
		};

		getOrders();

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
			getPayments();
		});

		this.getHeaders = function() { return ["Order", "Menu Item", "Modifiers", "Party", "Seat", "Notes", "Date", "Filter", "Search Query"] };

	    //export
	    this.getTableArray = function() {
	    	var exportArray = [];
	    	angular.forEach($scope.filteredOrders, function(value, index) {
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

	    	if(newFilter === 'Order') {
	    		$scope.search.filter.type = 'id';
	    	} else if(newFilter === 'Menu Item') {
	    		$scope.search.filter.type = 'menuItem';
	    	} else if(newFilter === 'Modifiers') {
	    		$scope.search.filter.type = 'menuItemModifiers';
	    	} else if(newFilter === 'Party') {
	    		$scope.search.filter.type = 'party';
	    	} else if(newFilter === 'Seat') {
	    		$scope.search.filter.type = 'seat';
	    	} else if(newFilter === 'Notes') {
	    		$scope.search.filter.type = 'notes';
	    	} else {
	    		$scope.search.filter.type = '';
	    	}
	    };

	    $scope.$watch('search.value', function() {
	    	$scope.filteredOrders = $filter('filter')($scope.orders, $scope.searchFilter);
	    }, true);

	    $scope.$watch('filteredOrders', function(newValues) {
	    	$scope.selectedArray.length = 0;

	    	angular.forEach(newValues, function(entry) {
	    		if (entry.value === true) {
	    			$scope.selectedArray.push({id:entry.id, menuItem:entry.menuItem, menuItemModifiers:entry.menuItemModifiers, party:entry.party,
	    				seat:entry.seat, notes:entry.notes, createdAt:entry.createdAt, filter:$scope.search.filter.name, query:($scope.search.value == "") ? "none" : $scope.search.value});
	    		}
	    	});

	    	if($scope.selectedArray.length === $scope.filteredOrders.length && $scope.filteredOrders.length > 0) {
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

	    	angular.forEach($scope.filteredOrders, function(item) {
	    		item.value = $scope.selectedAll;
	    	});
	    };

	    $scope.searchFilter = function(item) {
	    	var searchTerm = $scope.search.value.toLowerCase();

	    	var id = item.id.toString().toLowerCase();
	    	var menuItem = item.menuItem.name.toString().toLowerCase();
	    	var menuItemModifiers = item.menuItemModifiers.toString().toLowerCase();
	    	var party = item.party.id.toString().toLowerCase();
	    	var seat = item.seat.toString().toLowerCase();
	    	var notes = item.notes.toString().toLowerCase();

	    	if($scope.search.filter.name === 'Anything') {
	    		if(id.indexOf(searchTerm) === 0 || menuItem.indexOf(searchTerm) === 0 || menuItemModifiers.indexOf(searchTerm) === 0
	    			|| party.indexOf(searchTerm) === 0 || seat.indexOf(searchTerm) === 0 || notes.indexOf(searchTerm) === 0) {
	    			return true;
	    		}
	    	} else if($scope.search.filter.name === 'Order') {
	    		if(id.indexOf(searchTerm) === 0) {
	    			return true;
	    		}
	    	} else if($scope.search.filter.name === 'Menu Item') {
	    		if(menuItem.indexOf(searchTerm) === 0) {
	    			return true;
	    		}
	    	} else if($scope.search.filter.name === 'Modifiers') {
	    		if(menuItemModifiers.indexOf(searchTerm) === 0) {
	    			return true;
	    		}
	    	} else if($scope.search.filter.name === 'Party') {
	    		if(party.indexOf(searchTerm) === 0) {
	    			return true;
	    		}
	    	} else if($scope.search.filter.name === 'Seat') {
	    		if(seat.indexOf(searchTerm) === 0) {
	    			return true;
	    		}
	    	} else if($scope.search.filter.name === 'Notes') {
	    		if(notes.indexOf(searchTerm) === 0) {
	    			return true;
	    		}
	    	}

	    	return false;
	    };

	    this.validEquivalencyType = function() {
	    	if($scope.search.filter.name === 'Anything' || $scope.search.filter.name === 'Order' || $scope.search.filter.name === 'Menu Item' || $scope.search.filter.name === 'Modifiers'
	    		|| $scope.search.filter.name === 'Party' || $scope.search.filter.name === 'Seat' || $scope.search.filter.name === 'Notes') {
	    		$scope.search.equivalencyType = 'Equal to';
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };
	}]);