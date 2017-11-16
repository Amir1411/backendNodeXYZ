var constants = require('./constants');
var debugging_enabled = true;

// Logging for the database queries made during execution
exports.logDatabaseQuery = function (eventFired, error, result) {
    if(debugging_enabled) {
        var stream = process.stdout;
        if(error) {
            stream = process.stderr;
        }
        stream.write("Event: " + eventFired + '\n');
        stream.write("\tError: " + JSON.stringify(error) + '\n');
        stream.write("\tResult: " + JSON.stringify(result) + '\n');
    }
};

exports.logDatabaseQueryError = function (eventFired, error, result) { 
    if(debugging_enabled) {
        process.stderr.write("Event: " + eventFired);
        process.stderr.write("\tError: " + JSON.stringify(error));
        process.stderr.write("\tResult: " + JSON.stringify(result));
    }
};

exports.startSection = function(section) {
    if(debugging_enabled) {
        console.log("=============   " + section + "   ==============");
    }
};

exports.logRequest = function(request) {
    if(debugging_enabled) {
        console.log("REQUEST: " + JSON.stringify(request.body));
    }
};

exports.logResponse = function(response) {
    if(debugging_enabled) {
        console.log("RESPONSE: " + JSON.stringify(response, undefined, 2));
    }
};

exports.endSection = function() {
    if(debugging_enabled) {
        console.log("==================================");
    }
};