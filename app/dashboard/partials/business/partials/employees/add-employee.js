'use strict';

angular.module('analytics-app.dashboard.business.add-employee', [
	'ui.bootstrap', 'ui.router'])

	//dashboard controller
	.controller('DashboardBusinessAddEmployeeCtrl', ['$rootScope', '$state', '$stateParams', 'restaurantService', function($scope, $state, $stateParams, restaurantService) {
	    $scope.currentRestaurant = restaurantService.getCurrentRestaurant();
	    $scope.currentEmployeeId = $stateParams.employee_id;

	    $scope.formSubmit = false;
	    $scope.formSuccess = false;

	    $scope.addEmployeeForm = {
	    	employeeName: '',
	    	employeeWage: '',
	    	employeeRole: '',
	    	administrator: '',
	    	employeePinCode: '',
	    	employeeStartDate: new Date(),
	    }

	    if($scope.currentEmployeeId !== 0) {
			var Employee = Parse.Object.extend("Employee");
			var employeeQuery = new Parse.Query(Employee);
			employeeQuery.get($scope.currentEmployeeId, {
			  success: function(employeeObject) {
			  	$scope.addEmployeeForm.employeeName = employeeObject.attributes.name;
			  	$scope.addEmployeeForm.employeeWage = employeeObject.attributes.hourlyWage;
			  	$scope.addEmployeeForm.employeeRole = employeeObject.attributes.role;
			  	$scope.addEmployeeForm.administrator = employeeObject.attributes.administrator;
			  	$scope.addEmployeeForm.employeePinCode = employeeObject.attributes.pinCode;
			  	$scope.addEmployeeForm.employeeStartDate = employeeObject.attributes.startDate;

			  	$scope.$apply();
			  },
			  error: function(employeeObject, error) {
			  }
			});
		}

		$scope.$on('newCurrentRestaurant', function() {
			$scope.currentRestaurant = restaurantService.getCurrentRestaurant();
		});

		$scope.cancelEmployee = function() {
	    	$state.go('dashboard.business.employees');
	    };

	    $scope.createEmployee = function() {
	    	if($scope.currentEmployeeId === 0) {
		    	var Employee = Parse.Object.extend("Employee");
				var employee = new Employee();

				employee.set("name", $scope.addEmployeeForm.employeeName);
				employee.set("activePartyCount", 0);
				employee.set("role", $scope.addEmployeeForm.employeeRole);
				employee.set("hourlyWage", parseInt($scope.addEmployeeForm.employeeWage));
				employee.set("administrator", Boolean($scope.addEmployeeForm.administrator));
				employee.set("pinCode", $scope.addEmployeeForm.pinCode);
				employee.set("startDate", $scope.addEmployeeForm.startDate);
				employee.set("restaurant", $scope.currentRestaurant);

				employee.save(null, {				
					success: function(employee) {
						$scope.formSubmit = true;
						$scope.formSuccess = true;  
						$scope.$apply();
					},
					error: function(employee, error) {
						$scope.formSubmit = true;
						$scope.formSuccess = false;
						$scope.$apply();
					}
				});
			} else {
				var Employee = Parse.Object.extend("Employee");
				var employeeQuery = new Parse.Query(Employee);
				employeeQuery.get($scope.currentEmployeeId, {
			  		success: function(employee) {
			  			employee.set("name", $scope.addEmployeeForm.employeeName);
						employee.set("role", $scope.addEmployeeForm.employeeRole);
						employee.set("hourlyWage", parseInt($scope.addEmployeeForm.employeeWage));
						employee.set("administrator", Boolean($scope.addEmployeeForm.administrator));
						employee.set("pinCode", $scope.addEmployeeForm.pinCode);
						employee.set("startDate", $scope.addEmployeeForm.startDate);

						employee.save(null, {				
							success: function(employee) {
								$scope.formSubmit = true;
								$scope.formSuccess = true;  
								$scope.$apply();
							},
							error: function(employee, error) {
								$scope.formSubmit = true;
								$scope.formSuccess = false;
								$scope.$apply();
							}
						});
			  		},
			  		error: function(employeeObject, error) {
			  		}
			  	});
			}
	    };

	    var resetForm = function() {
	    	$scope.addEmployeeForm = {
		   		employeeName: '',
		   		employeeWage: '',
		   		employeeRole: '',
		   		administrator: '',
		   		employeePinCode: '',
		   		employeeStartDate: new Date()
	   		}
	    }
	}]);
