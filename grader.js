#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://morning-tundra-1838.herokuapp.com";

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(inurl) {
	var urlStr = inurl.toString();
	rest.get(urlStr).on('complete', function(result) {
		if (result instanceof Error) {
			console.log('Error connecting to URL: ' . result.message);
			process.exit(1);
		}
		return urlStr;
	});
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkUrlContent = function(url, checksfile) {
	rest.get(url).on('complete', function(result) {
        if (result instanceof Error) {
            console.log('Error connecting to URL: ' . result.message);
            process.exit(1);
        } else {
			fs.writeFileSync("url.html", result);
    		$ = cheerioHtmlFile("url.html");
    		var checks = loadChecks(checksfile).sort();
    		var out = {};
    		for(var ii in checks) {
        		var present = $(checks[ii]).length > 0;
        		out[checks[ii]] = present;
    		}
			var outJson = JSON.stringify(out, null, 4);
            console.log(outJson);
		}
	});
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
	if (process.argv.length == 0) {
		console.log("Specify arguments for processing");
	} else {
		if (contains(process.argv, "--checks") && contains(process.argv, "--url") && !contains(process.argv, "--file")) {
    		program
        		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists))
        		.option('-u, --url <web_url>', 'URL of web page', URL_DEFAULT)
        		.parse(process.argv);
    			checkUrlContent(program.url, program.checks);
		} else if (contains(process.argv, "--checks") && !contains(process.argv, "--url") && contains(process.argv, "--file")) {
    		program
        		//.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists))
        		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        		.parse(process.argv);
    			var checkJson = checkHtmlFile(program.file, program.checks);
    			var outJson = JSON.stringify(checkJson, null, 4);
    			console.log(outJson);
		} else {
			console.log("Incorrect arguments specified");
		}
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrlContent = checkUrlContent;
}
