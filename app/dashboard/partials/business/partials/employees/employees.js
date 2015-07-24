'use strict';

angular.module('analytics-app.dashboard.business.employees', [
	'angularUtils.directives.dirPagination', 'ngSanitize', 'ngCsv', 'ui.bootstrap'])

	//dashboard controller
	.controller('DashboardBusinessEmployeesCtrl', ['$rootScope', 'restaurantService', '$filter', '$modal', '$state', function($scope, restaurantService, $filter, $modal, $state) {
		$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
		$scope.employees = [];

		$scope.sortType		= 'startDate';	//default sort type
		$scope.sortReverse	= false;		//default order   					

		$scope.selectedAll = false;			//select all checkbox

		//csv
		$scope.separator 	= ","; 
		$scope.filename 	= "employees-report";
	    $scope.filteredEmployees = [];		//may or may not be filtered
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

	    var getEmployees = function() {
	    	$scope.employees.length = 0;

			// Get employees for current restaurant
			var Employee = Parse.Object.extend("Employee");
			var employeeQuery = new Parse.Query(Employee);
			employeeQuery.equalTo("restaurant", $scope.currentRestaurant);

		   	Employee.prototype.__defineGetter__("name", function() {
		      return this.get("name");
		    });
		   	Employee.prototype.__defineGetter__("activePartyCount", function() {
		      return this.get("activePartyCount");
		    });
		   	Employee.prototype.__defineGetter__("role", function() {
		      return this.get("role");
		    });
		    Employee.prototype.__defineGetter__("hourlyWage", function() {
		      return this.get("hourlyWage");
		    });
		    Employee.prototype.__defineGetter__("startDate", function() {
		      return this.get("startDate");
		    });

			employeeQuery.find().then(function(employees) {
				for(var i = 0; i < employees.length; i++) {
					if(employees[i].attributes.hourlyWage !== null) {
						employees[i].attributes.hourlyWage = employees[i].attributes.hourlyWage.toFixed(2);
					} else {
						employees[i].attributes.hourlyWage = "0.00";
					}

					$scope.employees.push(employees[i]);
					$scope.filteredEmployees = $scope.employees;
					$scope.$digest();
				}
			});
		};

		getEmployees();

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
			getEmployees();
		});

		this.getHeaders = function() { return ["Employee ID", "Name", "Active Party Count", "Role", "Hourly Wage", "Start Date", "Filter", "Search Query"] };

	    //export
	    this.getTableArray = function() {
	    	var exportArray = [];
	    	angular.forEach($scope.filteredEmployees, function(value, index) {
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

	    	if(newFilter === 'Employee') {
	    		$scope.search.filter.type = 'id';
	    	} else if(newFilter === 'Name') {
	    		$scope.search.filter.type = 'name';
	    	} else if(newFilter === 'Active Party Count') {
	    		$scope.search.filter.type = 'activePartyCount';
	    	} else if(newFilter === 'Role') {
	    		$scope.search.filter.type = 'role';
	    	} else if(newFilter === 'Hourly Wage') {
	    		$scope.search.filter.type = 'hourlyWage';
	    	} else if(newFilter === 'Start Date') {
	    		$scope.search.filter.type = 'startDate';
	    	} else {
	    		$scope.search.filter.type = '';
	    	}
	    };

	    $scope.$watch('search.value', function() {
	    	$scope.filteredEmployees = $filter('filter')($scope.employees, $scope.searchFilter);
	    }, true);

	    $scope.$watch('filteredEmployees', function(newValues) {
	    	$scope.selectedArray.length = 0;

	    	angular.forEach(newValues, function(entry) {
	    		if (entry.value === true) {
	    			$scope.selectedArray.push({id:entry.id, name:entry.name, activePartyCount:entry.activePartyCount, role:entry.role, hourlyWage:entry.hourlyWage,
	    				startDate:entry.startDate, filter:$scope.search.filter.name, query:($scope.search.value == "") ? "none" : $scope.search.value});
	    		}
	    	});

	    	if($scope.selectedArray.length === $scope.filteredEmployees.length && $scope.filteredEmployees.length > 0) {
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

	    	angular.forEach($scope.filteredEmployees, function (item) {
	    		item.value = $scope.selectedAll;
	    	});
	    };

	    $scope.searchFilter = function(item) {
	    	var searchTerm = $scope.search.value.toLowerCase();

	    	var id = item.id.toString().toLowerCase();
	    	var name = item.name.toString().toLowerCase();
	    	var activePartyCount = item.activePartyCount.toString().toLowerCase();
	    	var role = item.role.toString().toLowerCase();
	    	var hourlyWage = item.hourlyWage.toString().toLowerCase();
	    	var startDate = item.startDate.toString().toLowerCase();

	    	//less than
	    	if($scope.search.equivalencyType === 'Less than') {
	    		if($scope.search.filter.name === 'Active Party Count') {
	    			if(parseFloat(item.activePartyCount) < parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Hourly Wage') {
	    			if(parseFloat(item.hourlyWage) < parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		}
	    		//greater than
	    	} else if($scope.search.equivalencyType === 'Greater than') {
	    		if($scope.search.filter.name === 'Active Party Count') {
	    			if(parseFloat(item.activePartyCount) > parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		} else if($scope.search.filter.name === 'Hourly Wage') {
	    			if(parseFloat(item.hourlyWage) > parseFloat($scope.search.value) || $scope.search.value === '' || typeof $scope.search.value === undefined) {
	    				return true;
	    			}
	    		}
	    		//equal to
	    	} else {
	    		if($scope.search.filter.name === 'Anything') {
		    		if(id.indexOf(searchTerm) === 0 || name.indexOf(searchTerm) === 0 || activePartyCount.indexOf(searchTerm) === 0 || role.indexOf(searchTerm) === 0 || hourlyWage.indexOf(searchTerm) === 0 || startDate.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Employee') {
		    		if(id.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Name') {
		    		if(name.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Active Party Count') {
		    		if(activePartyCount.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Role') {
		    		if(role.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Hourly Wage') {
		    		if(hourlyWage.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	} else if($scope.search.filter.name === 'Start Date') {
		    		if(startDate.indexOf(searchTerm) === 0) {
		    			return true;
		    		}
		    	}
	    	}

	    	return false;
	    };

	    this.validEquivalencyType = function() {
	    	if($scope.search.filter.name === 'Anything' || $scope.search.filter.name === 'Employee' || $scope.search.filter.name === 'Name' || $scope.search.filter.name === 'Role') {
	    		$scope.search.equivalencyType = 'Equal to';
	    		return false;
	    	} else {
	    		return true;
	    	}
	    };

	    $scope.addEmployee = function() {
	    	$state.go('dashboard.business.add-employee', { 'employee_id': '0' });
	    };

	    $scope.editEmployee = function(employee) {
	    	$state.go('dashboard.business.add-employee', { 'employee_id': employee.id });
	    };

	    $scope.deleteEmployee = function(employee) {
	    	var Employee = Parse.Object.extend("Employee");
			var employeeQuery = new Parse.Query(Employee);
			employeeQuery.get(employee.id, {
			  success: function(employeeObject) {
			    employeeObject.destroy({});
			    $scope.removeRow(employee.id);
			  },
			  error: function(employeeObject, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			  }
			});
	    };

	    $scope.removeRow = function(employeeId) {
	    	var index = -1;		
			var comArr = eval( $scope.filteredEmployees );
			for( var i = 0; i < comArr.length; i++ ) {
				if( comArr[i].id === employeeId ) {
					index = i;
					break;
				}
			}

			$scope.filteredEmployees.splice( index, 1 );
			$scope.$digest();
	    };
	}]);