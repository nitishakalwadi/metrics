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
	for(i in csv) {
		metric = csv[i];
		if(typeof primaryApiErrorStatsChartObj["data"] === "undefined") {
			primaryApiErrorStatsChartObj["data"] = [];
		}
		if(typeof primaryApiErrorStatsChartObj["data"][metric.Name] === "undefined") {
			primaryApiErrorStatsChartObj["data"][metric.Name] = [];
			primaryApiErrorStatsChartObj["data"][metric.Name]["count"] = [];
		}
		primaryApiErrorStatsChartObj["data"][metric.Name]["count"].push(metric.COUNT);
	}
	
}

function displayChart(data) {
	console.log(data);
	// var labels = [
	// 	'January',
	// 	'February',
	// 	'March',
	// 	'April',
	// 	'May',
	// 	'June',
	// ];
	var labels = data["labels"];
	var datasets = [];
	for(metric in data["data"]) {
		var bgRGB = "rgb(" + getColor() + "," + getColor() + "," + getColor() + ")";
		var borderRGB = "rgb(" + getColor() + "," + getColor() + "," + getColor() + ")";

		singleDataset = data["data"][metric];
		dataset = {
			label: metric,
			data: singleDataset["count"],
			backgroundColor: bgRGB,
			borderColor: borderRGB

		};
		datasets.push(dataset);
	}
	console.log(datasets);

	// var data = {
	// labels: labels,
	// datasets: [{
 //  			label: 'My First dataset',
	//   		backgroundColor: 'rgb(255, 99, 132)',
 //  			borderColor: 'rgb(255, 99, 132)',
 //  			data: [0, 10, 5, 2, 20, 30, 45],
	// 	}]
	// };

	var data = {
		labels: labels,
		datasets: datasets
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


function getColor() {
	return Math.floor(Math.random()*1000%255);
}