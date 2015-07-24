'use strict';

angular.module('analytics-app.dashboard.reporting.sales.overview', [
	'ui.router', 'ui.bootstrap', 'chart.js'
	])

	.run(['$rootScope', function($scope) {
		$scope.labels = ["January", "February", "March", "April"];
		$scope.series = ['This year'];
		$scope.data = [[34000, 40000, 38000, 41000, 42000]];

		$scope.options = {
			responsive: true,
			scaleLabel: "<%= '$' + Number(value)%>",
			scaleBeginAtZero : true,
			scaleFontFamily: "'Open Sans', \"Helvetica Neue\", Helvetica, Arial, sans-serif",
			tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= '$' + Number(value)%>"
		};

	}])

	//dashboard controller
	.controller('DashboardReportingSalesOverviewCtrl', ['$rootScope', '$location', function($scope, $location) {
	}]);
