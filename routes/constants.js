/**
 * The node-module to hold the constants for the server
 */
var myContext = this;
function define(obj, name, value) {
    Object.defineProperty(obj, name, {
        value: value,
        enumerable: true,
        writable: false,
        configurable: true
    });
}

var debugging = false;
exports.responseFlags = {};
exports.responseMessages = {};

//FOR MESSAGES
define(exports.responseMessages, 'PARAMETER_MISSING',                     'Some parameter missing.');
define(exports.responseMessages, 'INVALID_ACCESS_TOKEN',                  'Invalid access token.');
define(exports.responseMessages, 'INVALID_EMAIL_ID',                      'Invalid email id.');
define(exports.responseMessages, 'INCORRECT_PASSWORD',                    'Incorrect Password.');
define(exports.responseMessages, 'ACTION_COMPLETE',                       'Action complete.');
define(exports.responseMessages, 'LOGIN_SUCCESSFULLY',                    'Logged in successfully.');
define(exports.responseMessages, 'SHOW_ERROR_MESSAGE',                    'Show error message.');
define(exports.responseMessages, 'IMAGE_FILE_MISSING',                    'Image file is missing.');
define(exports.responseMessages, 'ERROR_IN_EXECUTION',                    'Error in execution.');
define(exports.responseMessages, 'UPLOAD_ERROR',                          'Error in uploading.');
define(exports.responseMessages, 'ALREADY_EXIST',                          'Already exist.');

//FOR FLAGS
define(exports.responseFlags, 'PARAMETER_MISSING',                   100);
define(exports.responseFlags, 'INVALID_ACCESS_TOKEN',                101);
define(exports.responseFlags, 'INVALID_EMAIL_ID',                    201);
define(exports.responseFlags, 'WRONG_PASSWORD',                      201);
define(exports.responseFlags, 'ACTION_COMPLETE',                     200);
define(exports.responseFlags, 'LOGIN_SUCCESSFULLY',                  200);
define(exports.responseFlags, 'SHOW_ERROR_MESSAGE',                  201);
define(exports.responseFlags, 'IMAGE_FILE_MISSING',                  102);
define(exports.responseFlags, 'ERROR_IN_EXECUTION',                  404);
define(exports.responseFlags, 'UPLOAD_ERROR',                        201);
define(exports.responseFlags, 'ALREADY_EXIST',                       422);  
