//
//var mysql = require('mysql');
//
//
//var db_config = {
//   host: config.get('databaseSettings.host'),
//   user: config.get('databaseSettings.user'),
//   password: config.get('databaseSettings.password'),
//   database: config.get('databaseSettings.database'),
//    multipleStatements: true
//};
//var pool = mysql.createPool(db_config);
//
//// function handleDisconnect() {
////   connection = mysql.createConnection(db_config); // Recreate the connection, since
////                                                   // the old one cannot be reused.
//
////   connection.connect(function(err) {              // The server is either down
////     if(err) {                                     // or restarting (takes a while sometimes).
////       console.log('error when connecting to db:', err);
////       setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
////     }                                     // to avoid a hot loop, and to allow our node script to
////   });                                     // process asynchronous requests in the meantime.
////                                           // If you're also serving http, display a 503 error.
////   connection.on('error', function(err) {
////     console.log('db error', err);
////     if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
////       handleDisconnect();                         // lost due to either server restart, or a
////     } else {                                      // connnection idle timeout (the wait_timeout
////       throw err;                                  // server variable configures this)
////     }
////   });
//// }
//
//// handleDisconnect();
//
//
//exports.query = function (query, values, callback) {
//
//
//    if(typeof callback == "undefined")
//    {
//        callback = values;
//         values =[];
//    }
//
//    pool.getConnection(function (err, connection) {
//
//        if (err) {
//            console.log(err);
//            return callback(err,undefined);
//        }
//        else {
//            var sqlQuery = mysql.format(query, values);
//            var time = new Date();
//
//
//
//
//            var options = {
//
//                sql:sqlQuery,
//                 timeout: 60000 // 60s
//
//            };
//
//            connection.query(options , function (err, rows) {
//                // And done with the connection.
//
//                connection.release();
//
//                            console.log(" query to db ----->  "+ sqlQuery + "      time:  "+ (new Date() - time)+" ms" );
//
//                if (err) {
//                    console.log(err);
//                    return callback(err,undefined);
//                }
//                else {
//                    return callback(null,rows);
//                }
//                // Don't use the connection here, it has been returned to the pool.
//            });
//        }
//        // connected! (unless `err` is set)
//    });
//};