//csv to object library used
//https://github.com/evanplaice/jquery-csv/

var baseUrl = "/metrics/data/";

var metaData = [];
var fileData = [];
var chartData = [];
var primaryApiErrorStatsChartObj = [];

var myChart;
var myMultiSelect;

$(document).ready(function() {
	init();
});

function init() {
	initMetaData('in');
	
}

function initMetaData(cluster) {
	url = baseUrl + cluster + "/meta.json";
	gMetaDataIndex = 0;
	var idx = 0;
	$.get(url, function(resp) {
		saveMetaData(resp, cluster);
		fetchFiles(cluster, gMetaDataIndex);
	});
}

function clearGlobals() {
	if(typeof myChart !== 'undefined') {
		myChart.destroy();
	}

	metaData = [];
	primaryApiErrorStatsChartObj = [];
}

function saveMetaData(data, cluster) {
	if(typeof metaData[cluster] === 'undefined') {
		metaData[cluster] = [];
	}
	metaData[cluster] = data;
}

function fetchFiles(cluster, metaDataIndex) {
	if(typeof metaData[cluster][metaDataIndex] !== 'undefined') {
		var weekData = metaData[cluster][metaDataIndex];

		if(typeof fileData[cluster] === 'undefined')
			fileData[cluster] = [];
		if(typeof fileData[cluster][metaDataIndex] === 'undefined')
			fileData[cluster][metaDataIndex] = [];

		var primaryApiErrorStatsUrl 		= baseUrl + cluster + "/csv/" + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		var nonPrimaryApiErrorStatsUrl 		= baseUrl + cluster + "/csv/" + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		var bulkApiErrorStatsUrl 			= baseUrl + cluster + "/csv/" + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		var primaryApiResponseTimeUrl 		= baseUrl + cluster + "/csv/" + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		var nonPrimaryApiResponseTimeUrl 	= baseUrl + cluster + "/csv/" + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		var bulkApiResponseTimeUrl 			= baseUrl + cluster + "/csv/" + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;

		$.when(
			$.get(primaryApiErrorStatsUrl),
			$.get(nonPrimaryApiErrorStatsUrl),
			$.get(bulkApiResponseTimeUrl),
			$.get(primaryApiResponseTimeUrl),
			$.get(nonPrimaryApiResponseTimeUrl),
			$.get(bulkApiResponseTimeUrl)
		).done(function(primaryApiErrorStatsData, nonPrimaryApiErrorStatsData, bulkApiErrorStatsData, primaryApiResponseTimeData, nonPrimaryApiResponseTimeData, bulkApiResponseTimeData) {
			fileData[cluster][metaDataIndex]["primary_api_error_stats"] 		= primaryApiErrorStatsData[0];
			fileData[cluster][metaDataIndex]["non_primary_api_error_stats"] 	= nonPrimaryApiErrorStatsData[0];
			fileData[cluster][metaDataIndex]["bulk_api_error_stats"] 			= bulkApiErrorStatsData[0];
			fileData[cluster][metaDataIndex]["primary_api_response_time"] 		= primaryApiResponseTimeData[0];
			fileData[cluster][metaDataIndex]["non_primary_api_response_time"] 	= nonPrimaryApiResponseTimeData[0];
			fileData[cluster][metaDataIndex]["bulk_api_response_time"] 			= bulkApiResponseTimeData[0];

			//process next week files if present
			if(typeof metaData[cluster][metaDataIndex+1] !== 'undefined') {
				fetchFiles(cluster, metaDataIndex+1);
			} else {
				processLabels(cluster);
				processFiles(cluster);
				var filteredChartData = applyFilters(cluster);
				displayChart(filteredChartData, cluster, []);
				initFilters(cluster, []);
			}
		});
	}
}

function processLabels(cluster) {
	for(i in metaData[cluster]) {
		var weekData = metaData[cluster][i];
		if(typeof chartData[cluster] === 'undefined')
			chartData[cluster] = [];
		if(typeof chartData[cluster]["labels"] === 'undefined')
			chartData[cluster]["labels"] = [];

		var label = weekData.year + "-" + weekData.week;
		if(!chartData[cluster]["labels"].includes(label))
			chartData[cluster]["labels"].push(label);

	}
}

function processFiles(cluster, metaDataIndex) {
	var idx = 0;
	for(i in fileData[cluster]) {
		if(typeof fileData[cluster][i] !== 'undefined') {
			processSingleFile(cluster, 'primary_api_error_stats', i, idx);
			i++;
			idx++;
		}
	}
}

function processSingleFile(cluster, file, metaDataIndex, idx) {
	var singleFile = fileData[cluster][metaDataIndex][file];
	var csv = $.csv.toObjects(singleFile);
	for(i in csv) {
		metric = csv[i];
		
		if(typeof chartData[cluster] === 'undefined')
			chartData[cluster] = [];
		if(typeof chartData[cluster][file] === 'undefined')
			chartData[cluster][file] = [];
		
		if(typeof chartData[cluster][file][metric.Name] === 'undefined') {
			chartData[cluster][file][metric.Name] = [];
			chartData[cluster][file][metric.Name]["count"] = [];
			chartData[cluster][file][metric.Name]["500"] = [];
		}
		
		chartData[cluster][file][metric.Name]["count"][idx] = metric.COUNT;
		// chartData[cluster][file][metric.Name]["500"][idx] = metric.COUNT;
		

		var metricNames = ["count", "500"];
		for(i in metricNames) {
			metricName = metricNames[i];
			for(i=0; i<chartData[cluster][file][metric.Name][metricName].length; i++) {
				if(typeof chartData[cluster][file][metric.Name][metricName][i] === 'undefined') {
					chartData[cluster][file][metric.Name][metricName][i] = 0;
				}
			}
		}
		
		if(typeof chartData[cluster]["metric_names"] === 'undefined')
			chartData[cluster]["metric_names"] = [];

		if(!chartData[cluster]["metric_names"].includes(metric.Name))
			chartData[cluster]["metric_names"].push(metric.Name);

		
	}
}


function displayChart(data, cluster, filters) {
	if(typeof myChart !== 'undefined') {
		myChart.destroy();
	}

	var labels = data[cluster]["labels"];
	var datasets = [];
	for(metric in data[cluster]["primary_api_error_stats"]) {
		var bgRGB = "rgb(" + getColor() + "," + getColor() + "," + getColor() + ")";
		
		singleDataset = data[cluster]["primary_api_error_stats"][metric];
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

// function displayChart(cluster, filters) {
// 	if(typeof myChart !== 'undefined') {
// 		myChart.destroy();
// 	}

// 	var labels = chartData[cluster]["labels"];
// 	var datasets = [];
// 	for(metric in chartData[cluster]["primary_api_error_stats"]) {
// 		var bgRGB = "rgb(" + getColor() + "," + getColor() + "," + getColor() + ")";
		
// 		singleDataset = chartData[cluster]["primary_api_error_stats"][metric];
// 		dataset = {
// 			label: metric,
// 			data: singleDataset["count"],
// 			backgroundColor: bgRGB,
// 			borderColor: bgRGB

// 		};
// 		datasets.push(dataset);
// 	}

// 	var data = {
// 		labels: labels,
// 		datasets: datasets
// 	};

// 	var config = {
//   		type: 'line',
//   		data,
//   		options: {}
// 	};

// 	myChart = new Chart(
//     	document.getElementById('IN-Chart'),
//     	config
//   	);
// }

function applyFilters(cluster) {
	var filteredChartData = chartData;
	var selectedOptions = $("#IN-select").val();
	if(selectedOptions !== null) {
		for(metricName in filteredChartData[cluster]["primary_api_error_stats"]) {
			if(!selectedOptions.includes(metricName)) {
				delete filteredChartData[cluster]["primary_api_error_stats"][metricName];
			}
		}
	}

	return filteredChartData;
}

function initFilters(cluster, filters) {
	initMultiSelect(cluster, filters);
}

function initMultiSelect(cluster, filters) {
	// if(typeof myMultiSelect !== 'undefined') {
	// 	myMultiSelect.destroy();
	// }

	var selectOptions = chartData[cluster]["metric_names"]
	$("#IN-select").html("");
	for(i in selectOptions) {
		var selectOption = selectOptions[i];
		var option = $('<option/>');
		option.val(selectOption).html(selectOption);
		$("#IN-select").append(option);
	}

	$("#IN-select").multiselect({
		click: function(event, ui) {
			// init(0);
			var filteredChartData = applyFilters("in");
			displayChart(filteredChartData);
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