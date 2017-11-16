/**
 * Created by harsh on 12/3/14.
 */

var logging = require('./logging');

exports.parameterMissingResponse = function (res) {
    var response = {
        "message": constants.responseMessages.PARAMETER_MISSING,
        "status": constants.responseFlags.PARAMETER_MISSING,
        "data" : {}
    };
    res.send(JSON.stringify(response));
};

exports.authenticationErrorResponse = function (res) {
    var response = {
        "message": constants.responseMessages.INVALID_ACCESS_TOKEN,
        "status": constants.responseFlags.INVALID_ACCESS_TOKEN,
        "data" : {}
    };
    res.send(JSON.stringify(response));
};

exports.sendError = function (res) {
    var response = {
        "message": constants.responseMessages.ERROR_IN_EXECUTION,
        "status": constants.responseFlags.ERROR_IN_EXECUTION,
        "data" : {}
    };
    res.send(JSON.stringify(response));
};