'use strict';

angular.module('analytics-app', [
	'analytics-app.login', //login
	'analytics-app.dashboard', //dashboard
	'analytics-app.dashboard.home', //dashboard home
	'analytics-app.dashboard.reporting', //dashboard reporting
	'analytics-app.dashboard.reporting.sales', //dashboard reporting sales
	'analytics-app.dashboard.reporting.sales.overview', //dashboard reporting sales overview
	'analytics-app.dashboard.reporting.sales.data-table', //dashboard reporting sales data table
	'analytics-app.dashboard.reporting.orders', //dashboard reporting orders
	'analytics-app.dashboard.reporting.orders.data-table', //dashboard reporting orders data table
	'analytics-app.dashboard.business', //dashboard business
	'analytics-app.dashboard.business.employees', //dashboard business employees
	'analytics-app.dashboard.business.add-employee', //dashboard business add employee
	'analytics-app.dashboard.business.menu', //dashboard business menu
	'analytics-app.dashboard.business.add-menu', //dashboard business add menu
	'analytics-app.dashboard.business.add-menu-category', //dashboard business add menu category
	'analytics-app.dashboard.business.add-menu-item', //dashboard business add menu item
	'analytics-app.dashboard.business.add-item-modifier', //dashboard business add item modifier
	'ui.router'
])

.config(['$urlRouterProvider', '$locationProvider', function($urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise('login');
}]);