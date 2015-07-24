'use strict';

angular.module('analytics-app.dashboard.business', [
	'ui.router', 'ui.bootstrap'
	])

	//declared ngRoute
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider
		.state('dashboard.business.employees', {
			url: "/employees",
			templateUrl: './app/dashboard/partials/business/partials/employees/employees.html',
			controller: 'DashboardBusinessEmployeesCtrl',
			controllerAs: 'EmployeesCtrl'
		})
		.state('dashboard.business.menu', {
			url: "/menu",
			templateUrl: './app/dashboard/partials/business/partials/menu/menu.html',
			controller: 'DashboardBusinessMenuCtrl',
			controllerAs: 'MenuItemsCtrl'
		})
		.state('dashboard.business.add-menu', {
			url: "/menu/add-menu",
			templateUrl: './app/dashboard/partials/business/partials/menu/add-menu.html',
			controller: 'DashboardBusinessAddMenuCtrl',
			controllerAs: 'AddMenuCtrl'
		})
		.state('dashboard.business.add-menu-category', {
			url: "/menu/add-category",
			templateUrl: './app/dashboard/partials/business/partials/menu/add-category.html',
			controller: 'DashboardBusinessAddMenuCategoryCtrl',
			controllerAs: 'AddMenuCategoryCtrl'
		})
		.state('dashboard.business.add-menu-item', {
			url: "/menu/add-item",
			templateUrl: './app/dashboard/partials/business/partials/menu/add-item.html',
			controller: 'DashboardBusinessAddMenuItemCtrl',
			controllerAs: 'AddMenuItemCtrl',
			params: { menu_item_id: 0 }
		})
		.state('dashboard.business.add-item-modifier', {
			url: "/menu/add-item-modifier",
			templateUrl: './app/dashboard/partials/business/partials/menu/add-item-modifier.html',
			controller: 'DashboardBusinessAddItemModifierCtrl',
			controllerAs: 'AddItemModifierCtrl'
		})
		.state('dashboard.business.add-employee', {
			url: "/employees/add-employee",
			templateUrl: './app/dashboard/partials/business/partials/employees/add-employee.html',
			controller: 'DashboardBusinessAddEmployeeCtrl',
			controllerAs: 'AddEmployeeCtrl',
			params: { employee_id: 0 }
		});
	}])

	//dashboard controller
	.controller('DashboardBusinessCtrl', ['$rootScope', function($scope) {
	}]);
