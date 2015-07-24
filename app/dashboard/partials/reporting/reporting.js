'use strict';

angular.module('analytics-app.dashboard.reporting', [
	'ui.router', 'ui.bootstrap'
	])

	//declared ngRoute
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider
		.state('dashboard.reporting.sales', {
			url: "/sales",
			templateUrl: './app/dashboard/partials/reporting/partials/sales/sales.html'
		})
		.state('dashboard.reporting.orders', {
			url: "/orders",
			templateUrl: './app/dashboard/partials/reporting/partials/orders/orders.html'
		});
	}])

	.controller('DashboardReportingCtrl', function() {
	});