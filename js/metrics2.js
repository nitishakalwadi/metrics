//csv to object library used
//https://github.com/evanplaice/jquery-csv/

var baseUrl = "/metrics/data/in/csv/";
var baseUrltest = "/metrics/data/in/csv/2021/32/primary_api.csv";

var metaData = [];
var fileData = [];
var primaryApiErrorStatsChartObj = [];

var myChart;
var myMultiSelect;


$(document).ready(function() {
	init();
});

function init() {
	initMetaData();
	
}

function initMetaData() {
	$.get("/metrics/data/in/meta.json", function(resp) {
		saveMetaData(resp);
		fetchFiles(0);
	});
}

function clearGlobals() {
	if(typeof myChart !== 'undefined') {
		myChart.destroy();
	}

	metaData = [];
	primaryApiErrorStatsChartObj = [];
}

function saveMetaData(data) {
	metaData = data;
}

function fetchFiles(metaDataIndex) {
	if(typeof metaData[metaDataIndex] !== 'undefined') {
		var weekData = metaData[metaDataIndex];

		// var url = baseUrl + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		// $.get(url, function(data) {
		// 	if(typeof fileData[metaDataIndex] === 'undefined')
		// 		fileData[metaDataIndex] = [];

		// 	fileData[metaDataIndex]["primary_api_error_stats"] = data;

		// 	if(typeof metaData[metaDataIndex+1] !== 'undefined') {
		// 		fetchFiles(metaDataIndex+1);
		// 	}
		// });


		if(typeof fileData[metaDataIndex] === 'undefined')
			fileData[metaDataIndex] = [];

		var primaryApiErrorStatsUrl = baseUrl + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		var nonPrimaryApiErrorStatsUrl = baseUrl + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		$.when(
			$.get(primaryApiErrorStatsUrl),
			$.get(nonPrimaryApiErrorStatsUrl)
		).done(function(primaryApiErrorStatsData, nonPrimaryApiErrorStatsData) {
			fileData[metaDataIndex]["primary_api_error_stats"] = primaryApiErrorStatsData[0];
			fileData[metaDataIndex]["non_primary_api_error_stats"] = nonPrimaryApiErrorStatsData[0];

			if(typeof metaData[metaDataIndex+1] !== 'undefined') {
				fetchFiles(metaDataIndex+1);
			}
		});
	}
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
				initFilters(primaryApiErrorStatsChartObj);
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

		for(i=0; i<primaryApiErrorStatsChartObj["data"][metric.Name]["count"].length; i++) {
			if(typeof primaryApiErrorStatsChartObj["data"][metric.Name]["count"][i] === 'undefined') {
				primaryApiErrorStatsChartObj["data"][metric.Name]["count"][i] = 0;
			}
		}

		if(typeof primaryApiErrorStatsChartObj["metric_names"] === 'undefined') {
			primaryApiErrorStatsChartObj["metric_names"] = [];
		}
		if(!primaryApiErrorStatsChartObj["metric_names"].includes(metric.Name)) {
			primaryApiErrorStatsChartObj["metric_names"].push(metric.Name);
		}
		
	}
	
}

function displayChart(data) {

	var labels = data["labels"];
	var datasets = [];
	for(metric in data["data"]) {
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

function initFilters(data) {
	initMultiSelect(data["metric_names"]);
}

function initMultiSelect(data) {
	// if(typeof myMultiSelect !== 'undefined') {
	// 	myMultiSelect.destroy();
	// }

	$("#IN-select").html("");
	for(i in data) {
		var option = $('<option/>');
		option.val(data[i]).html(data[i]);
		$("#IN-select").append(option);
	}

	$("#IN-select").multiselect({
		click: function(event, ui) {
			init(0);
		}
	}).multiselectfilter();
	$("#IN-select").multiselect("refresh");

}

function processAllWeeksNonPrimaryApiErrorStats(data) {

}

function processAllWeeksBulkApiErrorStats(data) {

}


function getColor() {
	return Math.floor(Math.random()*1000%255);
}