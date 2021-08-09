//csv to object library used
//https://github.com/evanplaice/jquery-csv/

var baseUrl = "/metrics/data/in/csv/";
var baseUrltest = "/metrics/data/in/csv/2021/32/primary_api.csv";

var metaData;
var primaryApiErrorStatsChartObj = [];


$(document).ready(function() {

	$.get("/metrics/data/in/meta.json", saveMetaData);

	
	

});

function saveMetaData(data) {
	metaData = data;
	processAllWeeksPrimaryApiErrorStats(data);
	processAllWeeksNonPrimaryApiErrorStats(data);
	processAllWeeksBulkApiErrorStats(data);

	displayChart(primaryApiErrorStatsChartObj);
}

function processAllWeeksPrimaryApiErrorStats(data) {
	for(i in data) {
		var weekData = data[i];
		
		if(typeof primaryApiErrorStatsChartObj["labels"] === "undefined") {
			primaryApiErrorStatsChartObj["labels"] = [];
		}
		label = weekData.year + "-" + weekData.week;
		primaryApiErrorStatsChartObj["labels"].push(label);

		var url = baseUrl + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		$.get(url, processPrimaryApiErrorStatsSingleFile);
	}
}

function processPrimaryApiErrorStatsSingleFile(data) {
	var csv = $.csv.toObjects(data);
	
	for(i in data) {
		metric = data[i];
		if(typeof primaryApiErrorStatsChartObj[metric.NAME]) === "undefined") {
			primaryApiErrorStatsChartObj[metric.NAME] = [];
			primaryApiErrorStatsChartObj[metric.NAME]["count"] = [];
		}
		primaryApiErrorStatsChartObj[metric.NAME]["count"].push(metric.COUNT);
	}
	
}

function displayChart(data) {
	console.log(data);
	var labels = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
	];

	var data = {
	labels: labels,
	datasets: [{
  			label: 'My First dataset',
	  		backgroundColor: 'rgb(255, 99, 132)',
  			borderColor: 'rgb(255, 99, 132)',
  			data: [0, 10, 5, 2, 20, 30, 45],
		}]
	};

	var config = {
  		type: 'line',
  		data,
  		options: {}
	};

	var myChart = new Chart(
    	document.getElementById('IN-Chart'),
    	config
  	);
}

function processAllWeeksNonPrimaryApiErrorStats(data) {

}

function processAllWeeksBulkApiErrorStats(data) {

}