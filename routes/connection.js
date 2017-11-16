var mysql = require('mysql');
var sys = require('sys');
var exec = require('child_process').exec;
var config = require('config');

var db_config = {
	host: config.get('databaseSettings.db_host'),
	user: config.get('databaseSettings.db_user'),
	password: config.get('databaseSettings.db_password'),
	database: config.get('databaseSettings.database'),
	port : config.get('databaseSettings.mysqlPORT'),
	multipleStatements: true
};


function restart(callback) {
	console.log("RESTART THE SERVER");
	callback();
}

// function handleDisconnect() {
	var connection = mysql.createConnection(db_config);

	console.log("in the handleDisconnect");
	connection.connect(function(err) {
		if(err) {
			console.log('error when connecting to db:', err);
			setTimeout(handleDisconnect, 2000);
		}
		else {
			console.log("connection variable created ");
		}
	});

	connection.on('error', function(err) {
		console.log('db error', err);
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			// handleDisconnect();
		} else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
			restart();
		} else {
			throw err;
		}
	});
// }

// handleDisconnect();
module.exports = connection;