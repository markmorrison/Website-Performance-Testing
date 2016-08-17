var socket = io();
var iterations = 1;

Chart.defaults.global.defaultFontColor = "#fff";
Chart.defaults.global.legend.display = false;

function buildResults(times) {
	$("#raw").html("");
	times.forEach(function(time, i){
		$("#raw").append("<div>Test " + (i + 1) + ": <span class='text-info'>" + time + "ms</span></div>");
	});
}

function buildStats(min, max, average) {
	$("#stats .min").html(" ").html(min + "ms");
	$("#stats .max").html(" ").html(max + "ms");
	$("#stats .average").html(" ").html(average.toFixed(0) + "ms");
}

function buildChart(data) {
	var ctx = document.getElementById("chart").getContext("2d");
	var labels = data.map(function(p, i){
		return "Test " + (i + 1);
	});
	var myLineChart = new Chart(ctx, {
		type: "bar",
	    data: {
			labels: labels,
			datasets: [
				{
					data: data,
					borderWidth: 0,
					backgroundColor: "rgba(255,255,255,0.6)"
				}
			]
		},
	    options: {
			scales: {
				xAxes:[{
			      gridLines:{
			        color:"rgba(255,255,255,0.2)",
					zeroLineColor:"rgba(255,255,255,0.5)"
			      }
			    }],
	            yAxes: [{
					gridLines:{
						color:"rgba(255,255,255,0.2)",
						zeroLineColor:"rgba(255,255,255,0.5)"
					},
	                ticks: {
	                    beginAtZero:true
	                }
	            }]
			}
		}
	});
}

function showHomeView() {
	$(".view.active").removeClass("active");
	$("#homeView").addClass("active");

}

function showTestingView() {
	$(".view.active").removeClass("active");
	$("#testingView").addClass("active");
}

function showResultsView() {
	$(".view.active").removeClass("active");
	$("#resultsView").addClass("active");
}

function runTest(url, iterations) {
	var settings = {
		url : url || $("#new_test_url").val(),
		iterations : iterations || $("#new_test_count").val(),
	};
	iterations = settings.iterations;
	showTestingView();
	$(".site").html(new URL(settings.url).hostname);
	$(".date").html(moment().format("LL") + " at " + moment().format("HH:MMa"));
	$("#feedback .total").html(iterations);
	$("#feedback .current").html("1");
	socket.emit("runNewTest",settings);
}

function initEvents() {
	$("#new_test").on("click", function() {
		socket.emit("runNewTest",{iterations: iterations, url:url});
	});

	$("#cancel_test").on("click", function(){
		socket.emit("cancelTest");
	});

	$("#start_test").on("click", function (event) {
		event.preventDefault();
		runTest();
	});

	socket.on("returnTimes", function(data){
		$("#feedback .current").html(data.length + 1);
	});

	socket.on("testComplete", function(data){
		showResultsView();
		var total = data.reduce(function(a, b) {
			return a + b;
		});
		var average = total / data.length;
		var max = Math.max.apply(null, data);
		var min = Math.min.apply(null, data);
		console.log(min, max);
		buildResults(data);
		buildChart(data, average);
		buildStats(min, max, average);
	});

}

initEvents();
