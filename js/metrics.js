//csv to object library used
//https://github.com/evanplaice/jquery-csv/

var baseUrl = "/metrics/data/in/csv/";
var baseUrltest = "/metrics/data/in/csv/2021/32/primary_api.csv";

var metaData;
var primaryApiErrorStatsChartObj = [];

var myChart;


$(document).ready(function() {
	clearGlobals();
	init(0);
});

function init(metaDataIndex) {
	$.get("/metrics/data/in/meta.json", function(resp) {
		saveMetaData(resp, metaDataIndex);
	});
}

function clearGlobals() {
	if(typeof myChart !== 'undefined') {
		myChart.destroy();
	}

	metaData = [];
	primaryApiErrorStatsChartObj = [];
}

function saveMetaData(data, metaDataIndex) {
	metaData = data;
	processAllWeeksPrimaryApiErrorStats(metaDataIndex, 0);
	processAllWeeksNonPrimaryApiErrorStats(data);
	processAllWeeksBulkApiErrorStats(data);


	
	
	
}

function processAllWeeksPrimaryApiErrorStats(metaDataIndex, idx) {
	if(typeof metaData[metaDataIndex] !== 'undefined') {
		var weekData = metaData[metaDataIndex];

		if(typeof primaryApiErrorStatsChartObj["labels"] === "undefined") {
			primaryApiErrorStatsChartObj["labels"] = [];
		}
		label = weekData.year + "-" + weekData.week;
		primaryApiErrorStatsChartObj["labels"].push(label);

		var url = baseUrl + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		$.get(url, function(resp) {
			
			processPrimaryApiErrorStatsSingleFile(resp, idx)

			if(typeof metaData[metaDataIndex+1] !== 'undefined') {
				processAllWeeksPrimaryApiErrorStats(metaDataIndex+1, idx+1);
			} else {
				displayChart(primaryApiErrorStatsChartObj);	
			}
		});
	}
}

// function processAllWeeksPrimaryApiErrorStats(data) {
// 	for(i in data) {
// 		var weekData = data[i];
		
// 		if(typeof primaryApiErrorStatsChartObj["labels"] === "undefined") {
// 			primaryApiErrorStatsChartObj["labels"] = [];
// 		}
// 		label = weekData.year + "-" + weekData.week;
// 		primaryApiErrorStatsChartObj["labels"].push(label);

// 		var url = baseUrl + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
// 		$.get(url, processPrimaryApiErrorStatsSingleFile);
// 	}
// }

function processPrimaryApiErrorStatsSingleFile(data, idx) {
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
		
		//primaryApiErrorStatsChartObj["data"][metric.Name]["count"].push(metric.COUNT);
		primaryApiErrorStatsChartObj["data"][metric.Name]["count"][idx] = metric.COUNT;

		for(i in primaryApiErrorStatsChartObj["data"][metric.Name]["count"]) {
			if(typeof primaryApiErrorStatsChartObj["data"][metric.Name]["count"][i] === 'undefined') {
				primaryApiErrorStatsChartObj["data"][metric.Name]["count"][i] = 0;
			}
		}
	}
	
}

function displayChart(data) {

	var labels = data["labels"];
	var datasets = [];
	for(metric in data["data"]) {
		console.log("here man");
		var bgRGB = "rgb(" + getColor() + "," + getColor() + "," + getColor() + ")";
		
		singleDataset = data["data"][metric];
		dataset = {
			label: metric,
			data: singleDataset["count"],
			backgroundColor: bgRGB,
			borderColor: bgRGB

		};
		datasets.push(dataset);
	}
	
	var data = {
		labels: labels,
		datasets: datasets
	};

	var config = {
  		type: 'line',
  		data,
  		options: {}
	};

	myChart = new Chart(
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