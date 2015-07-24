'use strict';

angular.module('analytics-app.dashboard.reporting.sales.data-table', [
	'angularUtils.directives.dirPagination', 'ngSanitize', 'ngCsv'])

	//dashboard controller
	.controller('DashboardReportingSalesDataTableCtrl', ['$rootScope', 'restaurantService', '$filter', function($scope, restaurantService, $filter) {
		$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
		$scope.payments = [];

		$scope.sortType		= 'createdAt';	//default sort type
		$scope.sortReverse	= false;		//default order   					

		$scope.selectedAll = false;			//select all checkbox

		//csv
		$scope.separator 	= ","; 
		$scope.filename 	= "sales-report";
	    $scope.filteredPayments = [];		//may or may not be filtered
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

	   		getPayments();
	    };

	    $scope.endDateChange = function(endDate) {
	    	$scope.endDate = endDate;
	    	$scope.endDate.setHours(23,59,59,59);

	    	getPayments();
	    };

	    var getPayments = function() {
	    	$scope.payments.length = 0;

			// get parties for current restaurant
			var Party = Parse.Object.extend("Party");
			var partyQuery = new Parse.Query(Party);
			partyQuery.equalTo("restaurant", $scope.currentRestaurant);
			partyQuery.greaterThanOrEqualTo("createdAt", $scope.startDate);
			partyQuery.lessThanOrEqualTo("createdAt", $scope.endDate);

			partyQuery.find().then(function(parties) {
				//payment
				var Payment = Parse.Object.extend("Payment");
				var paymentQuery = new Parse.Query(Payment);

				//getters
				Payment.prototype.__defineGetter__("cardLastFour", function() {
					return this.get("cardLastFour");
				});
				Payment.prototype.__defineGetter__("cardName", function() {
					return this.get("cardName");
				});
				Payment.prototype.__defineGetter__("party", function() {
					return this.get("party");
				});
				Payment.prototype.__defineGetter__("subtotal", function() {
					return this.get("subtotal");
				});
				Payment.prototype.__defineGetter__("tax", function() {
					return this.get("tax");
				});
				Payment.prototype.__defineGetter__("tip", function() {
					return this.get("tip");
				});
				Payment.prototype.__defineGetter__("total", function() {
					return this.get("total");
				});
				Payment.prototype.__defineGetter__("paymentType", function() {
					return this.get("type");
				});

				for(var i = 0; i < parties.length; i++) {
					paymentQuery.equalTo("party", parties[i]);

					paymentQuery.find().then(function(payments) {
						for (var j = 0; j < payments.length; j++) {
		    				if(payments[j].attributes.subtotal !== null) {
		    					payments[j].attributes.subtotal = payments[j].attributes.subtotal.toFixed(2);
							} else {
								payments[j].attributes.subtotal = "0.00";
							}

							if(payments[j].attributes.tax !== null) {
		    					payments[j].attributes.tax = payments[j].attributes.tax.toFixed(2);
							} else {
								payments[j].attributes.tax = "0.00";
							}

							if(payments[j].attributes.tip !== null) {
		    					payments[j].attributes.tip = payments[j].attributes.tip.toFixed(2);
							} else {
								payments[j].attributes.tip = "0.00";
							}

							if(payments[j].attributes.total !== null) {
		    					payments[j].attributes.total = payments[j].attributes.total.toFixed(2);
							} else {
								payments[j].attributes.total = "0.00";
							}

							$scope.payments.push(payments[j]);
							$scope.filteredPayments = $scope.payments;
							$scope.$digest();
						}
					});
				}
			});
		};

		getPayments();

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
			getPayments();
		});

		this.getHeaders = function() { return ["Payment Number", "Party", "Subtotal", "Tax", "Tip", "Total", "Method", "Card Last Four", "Date", "Filter", "Search Query"] };

	    //export
	    this.getTableArray = function() {
	    	var exportArray = [];
	    	angular.forEach($scope.filteredPayments, function(value, index) {
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

	    	if(newFilter === 'Payment') {
	    		$scope.search.filter.type = 'id';
	    	} else if(newFilter === 'Total') {
	    		$scope.search.filter.type = 'total';
	    	} else if(newFilter === 'Tax') {
	    		$scope.search.filter.type = 'tax';
	    	} else if(newFilter === 'Tip') {
	    		$scope.search.filter.type = 'tip';
	    	} else if(newFilter === 'Subtotal') {
	    		$scope.search.filter.type = 'subtotal';
	    	} else if(newFilter === 'Card Last Four') {
	    		$scope.search.filter.type = 'cardLastFour';
	    	} else if(newFilter === 'Payment Method') {
	    		$scope.search.filter.type = 'paymentType';
	    	} else if(newFilter === 'Party') {
	    		$scope.search.filter.type = 'party';
	    	} else {
	    		$scope.search.filter.type = '';
	    	}
	    };

	    $scope.$watch('search.value', function() {
	    	$scope.filteredPayments = $filter('filter')($scope.payments, $scope.searchFilter);
	    }, true);

	    $scope.$watch('filteredPayments', function(newValues) {
	    	$scope.selectedArray.length = 0;

	    	angular.forEach(newValues, function(entry) {
	    		if (entry.value === true) {
	    			$scope.selectedArray.push({id:entry.id, party:entry.party.id, subtotal:entry.subtotal, tax:entry.tax, tip:entry.tip, total:entry.total,
	    				paymentType:entry.paymentType, cardLastFour:entry.cardLastFour, createdAt:entry.createdAt, filter:$scope.search.filter.name,
	    				query:($scope.search.value == "") ? "none" : $scope.search.value});
	    		}
	    	});

	    	if($scope.selectedArray.length === $scope.filteredPayments.length && $scope.filteredPayments.length > 0) {
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

	    	angular.forEach($scope.filteredPayments, function (item) {
	    		item.value = $scope.selectedAll;
	    	});
	    };

	    $scope.searchFilter = function(item) {
	    	var searchTerm = $scope.search.value.toLowerCase();

	    	var id = item.id.toString().toLowerCase();
	    	var total = item.total.toString().toLowerCase();
	    	var subtotal = item.subtotal.toString().toLowerCase();
	    	var tax = item.tax.toString().toLowerCase();
	    	var tip = item.tip.toString().toLowerCase();
	    	var paymentType = item.paymentType.toString().toLowerCase();
	    	var cardLastFour = item.cardLastFour.toString().toLowerCase();
	    	var party = item.party.id.toString().toLowerCase();

	    	//less than
	    	if($scope.search.equivalencyType === 'Less than') {
	    		if($scope.search.filter.name === 'Total') {
	    			if(parseFloat(item.total) < parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Tax') {
	    			if(parseFloat(item.tax) < parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Tip') {
	    			if(parseFloat(item.tip) < parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Subtotal') {
	    			if(parseFloat(item.subtotal) < parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		}
	    		//greater than
	    	} else if($scope.search.equivalencyType === 'Greater than') {
	    		if($scope.search.filter.name === 'Total') {
	    			if(parseFloat(item.total) > parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Tax') {
	    			if(parseFloat(item.tax) > parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Tip') {
	    			if(parseFloat(item.tip) > parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Subtotal') {
	    			if(parseFloat(item.subtotal) > parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		}
	    		//equal to
	    	} else {
	    		if($scope.search.filter.name === 'Anything') {
		    		if(id.indexOf(searchTerm) === 0 || total.indexOf(searchTerm) === 0 || tip.indexOf(searchTerm) === 0  || subtotal.indexOf(searchTerm) === 0  || tax.indexOf(searchTerm) === 0 || paymentType.indexOf(searchTerm) === 0 || party.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Payment') {
		    		if(id.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Total') {
		    		if(total.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Tax') {
		    		if(tax.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Payment Method') {
		    		if(paymentType.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Tip') {
		    		if(tip.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Subtotal') {
		    		if(subtotal.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Card Last Four') {
		    		if(cardLastFour.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Party') {
		    		if(party.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	}
	    	}

	    	return false;
	    };

	    this.validEquivalencyType = function() {
	    	if($scope.search.filter.name === 'Anything' || $scope.search.filter.name === 'Payment' || $scope.search.filter.name === 'Payment Method' || $scope.search.filter.name === 'Card Last Four' || $scope.search.filter.name === 'Party') {
	    		$scope.search.equivalencyType = 'Equal to';
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };
	}]);