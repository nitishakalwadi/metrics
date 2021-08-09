var baseUrl = "/metrics/data/in/csv/";
var baseUrltest = "/metrics/data/in/csv/2021/32/primary_api.csv";

var primaryApiErrorStatsChartObj = {};


$(document).ready(function() {

	$.get("/metrics/data/in/meta.json", processAllWeeks);

	
	

});

function processAllWeeks(data) {
	for(i in data) {
		var weekData = data[i];
		var url = baseUrl + weekData.year + "/" + weekData.week + "/" + weekData.primary_api_error_stats;
		$.get(url, processPrimaryApiErrorStatsSingleFile);
	}
}

function processPrimaryApiErrorStatsSingleFile(data) {
	console.log(data);
	var csv = $.csv.toObjects(data);
	console.log(csv);
}