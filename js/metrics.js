$(document).ready(function() {
	
	$.get("/metrics/data/in/csv/2021/32/primary_api.csv", function(data) {
		console.log(data);
		var csv = $.csv.toObjects(data);
	});

});