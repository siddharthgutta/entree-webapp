'use strict';

angular.module('analytics-app.dashboard.reporting.orders', [
	'ui.router', 'ui.bootstrap'
	])

	//declared ngRoute
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider
		.state('dashboard.reporting.orders.data-table', {
			url: "/data-table",
			templateUrl: './app/dashboard/partials/reporting/partials/orders/partials/data-table/data-table.html',
			controller: 'DashboardReportingOrdersDataTableCtrl',
			controllerAs: 'OrdersDataTableCtrl'
		});
	}])

	//dashboard controller
	.controller('DashboardReportingOrdersCtrl', function() {
	});
