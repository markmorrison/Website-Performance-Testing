var express  = require("express"),
    path     = require("path"),
    app      = express(),
    server   = require("http").Server(app),
    io       = require("socket.io")(server),
    views    = __dirname + "/views/",
	webspeed = require('webspeed');

app.initRouting = function() {
    app.use(express.static(path.join(__dirname, '/static')));
    app.set('views', './views');

    app.get("/", function(req,res,next){
        res.sendFile(views + "index.html");
    });
}

app.speedTest = function(socket, iterations, url) {
	console.log("Started New Speed Test For " + url);
	var times = [];
    var count = 0;
    var iterations = parseInt(iterations) || 10;
    var cancelled = false;
	var options = { timeout: 30000 }  // 30 second timeout is the default

	function runSpeedTest() {
        if (count < iterations && !cancelled) {
            count++;
			webspeed.run(url, options, function(err, results) {
				if (!!err) console.log(err);
				console.log("Test " + count + " - " + results.loadEventEnd + "ms - " + url);
				times.push(results.loadEventEnd);
				socket.emit("returnTimes", times);
				runSpeedTest();
			});
        } else if (!cancelled) {
            socket.emit("testComplete", times);
            console.log("Test Complete");
        } else {
            console.log("Canceled Test By Client");
        }
    }

	socket.on("disconnect", function(){
        cancelled = true;
    });

    runSpeedTest();
}

app.initSockets = function() {
    io.on("connection", function(socket){
        socket.on("runNewTest", function(settings){
            console.log("Requested New Speed Test");
            app.speedTest(socket, settings.iterations, settings.url);
        });
    });
}

app.init = function() {
    app.initRouting();
    app.initSockets();

    var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
    var port = process.env.OPENSHIFT_NODEJS_PORT || 3333;

    server.listen(port, ipaddress);

    console.log("Listening on port "+ ipaddress + ":" + port);
}

app.init();
