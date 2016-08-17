var page = require('webpage').create(),
    system = require('system'),
    t, address;

t = Date.now();
address = system.args[1];
page.open(address, function (status) {
    if (status !== 'success') {
 	   	system.stderr.writeLine('FAIL to load the address');
    } else {
        t = Date.now() - t;
 	   	system.stdout.writeLine(t.toString());
    }
    phantom.exit();
});