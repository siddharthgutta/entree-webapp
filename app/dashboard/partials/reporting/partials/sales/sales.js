'use strict';

angular.module('analytics-app.dashboard.reporting.sales', [
	'ui.router', 'ui.bootstrap'
	])

	//declared ngRoute
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider
		.state('dashboard.reporting.sales.overview', {
			url: "/overview",
			templateUrl: './app/dashboard/partials/reporting/partials/sales/partials/overview/overview.html'
		})
		.state('dashboard.reporting.sales.data-table', {
			url: "/data-table",
			templateUrl: './app/dashboard/partials/reporting/partials/sales/partials/data-table/data-table.html',
			controller: 'DashboardReportingSalesDataTableCtrl',
			controllerAs: 'SalesDataTableCtrl'
		});
	}])

	.controller('DashboardReportingSalesCtrl', function() {
	});