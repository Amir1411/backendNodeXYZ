var commonFunc = require('./commonfunction');
var md5 = require('MD5');
var responses = require('./responses');
var Handlebars = require('handlebars');
var logging = require('./logging');
var constants = require('./constants');
var connection = require('./connection');
var config = require('config');
var async = require('async');

exports.create_account = function(req, res) {
	var user_name = req.body.user_name;
	var user_email = req.body.user_email;
	var user_password = req.body.user_password;

	var manvalues = [user_name, user_email, user_password];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {
		var sql = "SELECT * FROM `user_details` WHERE user_email=? LIMIT 1";
		connection.query(sql, [user_email], function(err, response) {
			if (err) {
				responses.sendError(res);
				return;
			}  else if ( response.length > 0 ) {
				console.log(constants.responseFlags.ACTION_COMPLETE);
				var message_response = "Email Id is already exist";
				var response = {
					status: constants.responseFlags.SHOW_ERROR_MESSAGE,
					flag: 1,
					response: {},
					message: message_response
				};
				// res.send(JSON.stringify(response));
				res.status(constants.responseFlags.SHOW_ERROR_MESSAGE).json(response);
						
			} else {

				var user_id = commonFunc.generateRandomString();
				var user_unique_id = md5(user_id);
				var access_token = md5(commonFunc.generateRandomString());
				var hash = md5(user_password);
				var currentTime = new Date();
				var created_on = Math.round(currentTime.getTime() / 1000);
				
				var sql = "INSERT INTO `user_details`(`user_id`, `access_token`, `user_name`, `user_email`, `user_password`, `created_on`) VALUES (?,?,?,?,?,?)";
				var value = [user_unique_id, access_token, user_name, user_email, hash, created_on];
				connection.query(sql, value, function (err, result) {
					if (err) {
						responses.sendError(res);
						return;
					} else {
						var response = {
							status: constants.responseFlags.ACTION_COMPLETE,
							flag: 1,
							response: {
								"user_id": user_unique_id,
								"access_token": access_token,
								"user_name": user_name,
								"user_email": user_email,
								"created_on": created_on
							},
							message: "Succefully created account"
						};
						res.send(JSON.stringify(response)); 
					}
				});
			}
		});
	}
}

exports.login = function(req, res) {
	var user_email = req.body.user_email;
	var user_password = req.body.user_password;
	console.log(req.body);

	var manvalues = [user_email, user_password];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {

		var encrypted_pass = md5(user_password);;
		var sql = "SELECT * FROM `user_details` WHERE `user_email`=? LIMIT 1";
		connection.query(sql, [user_email], function(err, result_check) {
			if (err) {
				responses.sendError(res);
				return;
			} else {
				if (result_check.length == 0) {
					var response = {
						"status": constants.responseFlags.INVALID_EMAIL_ID,
						"flag": 1,
						"response": {},
						"message": constants.responseMessages.INVALID_EMAIL_ID              
					};
					res.json(response);
					return;
				} else {
					if (result_check[0].user_password != encrypted_pass) {
						var response = {
							"status": constants.responseFlags.WRONG_PASSWORD,
							"flag": 2,
							"response": {},
							"message": constants.responseMessages.INCORRECT_PASSWORD
						};
						res.send(JSON.stringify(response));
						return;
					} else {
						result_check[0]["user_password"] = "";
						var response = {
							"status": constants.responseFlags.LOGIN_SUCCESSFULLY,
							"flag": 1,
							"message": constants.responseMessages.LOGIN_SUCCESSFULLY,
							"response": result_check[0]
						};
						res.send(JSON.stringify(response));
						return;
					}
				}
			}
		});
	}
}

exports.get_user_details = function(req, res) {
	var access_token = req.body.access_token;
	var user_id = req.body.user_id;

	var manvalues = [access_token, user_id];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {
		commonFunc.authenticateAccessToken(access_token, function(result) {
			console.log(result);
			if (result == 0) {
				var response = {
					status: constants.responseFlags.INVALID_ACCESS_TOKEN,
					flag: 1,
					response: {},
					message: "Invalid access token."    
				};
				res.send(JSON.stringify(response));
				return; 
			} else {
				var check_sql = "SELECT * FROM `user_details` WHERE `user_id`=?";
				connection.query(check_sql, [user_id], function(err, result_check) {
					if (err) {
						responses.sendError(res);
						return;
					} else {
						if ( result_check.length > 0 ) {
							result_check[0].user_password = "";
							if ( result_check[0].user_thumbnail == '' ) {
								result_check[0].user_thumbnail = config.get("base_url")+"/user/user_placeholder.jpeg";
							} else {
								result_check[0].user_thumbnail = config.get("base_url")+"/user/"+result_check[0].user_thumbnail;
							}
							
							var response = {
								"status": constants.responseFlags.ACTION_COMPLETE,
								"flag": 1,
								"message": constants.responseMessages.ACTION_COMPLETE,
								"response": result_check[0]
							};
							res.send(JSON.stringify(response));
							return;
						} else {
							var response = {
								"status": constants.responseFlags.ACTION_COMPLETE,
								"flag": 2,
								"response": {},
								"message": "No User Found."
							};
							res.send(JSON.stringify(response));
							return;
						}
					}
				});
			}
		});
	}
}

exports.upload_user_thumbnail = function(req, res) {
	var access_token = req.body.access_token;

	var manvalues = [access_token];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {
		commonFunc.authenticateAccessToken(access_token, function(result) {
			if (result == 0) {
				 var response = {
					status: constants.responseFlags.INVALID_ACCESS_TOKEN,
					flag: 1,
					response: {},
					message: "Invalid access token."    
				};
				res.send(JSON.stringify(response));
				return;
			} else {
				var user_id = result[0].user_id;
 
				if ( req.file != undefined ) {
					var user_thumbnail = req.file.filename;
				} else {
					var user_thumbnail = "";
				}

				var update_otp = "UPDATE `user_details` SET `user_thumbnail`=? WHERE `user_id`=?";
				connection.query(update_otp, [user_thumbnail, user_id], function(err, result){
					console.log(err);
					if (err) {
						responses.sendError(res);
						return;
					} else {
						console.log(user_thumbnail);
						console.log(req.file.filename);
						var user_thumbnails = config.get("base_url")+'/user/'+req.file.filename;
						var response = {
							"status": constants.responseFlags.ACTION_COMPLETE,
							"flag": 1,
							"message": constants.responseMessages.ACTION_COMPLETE,
							"response": user_thumbnails
						};
						res.send(JSON.stringify(response));
						return;
					}
				});
			}
		});
	}
}

exports.update_profile = function(req, res) {
	var access_token = req.body.access_token;
	var user_name = req.body.user_name;
	var work_position = req.body.work_position;
	var user_description = req.body.user_description;
	var user_address = req.body.user_address;

	var manvalues = [access_token, user_name];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {
		commonFunc.authenticateAccessToken(access_token, function(result) {
			if (result == 0) {
				 var response = {
					status: constants.responseFlags.INVALID_ACCESS_TOKEN,
					flag: 1,
					response: {},
					message: "Invalid access token."    
				};
				res.send(JSON.stringify(response));
				return;
			} else {
				var user_id = result[0].user_id;

				var update_sql = "UPDATE `user_details` SET `user_name`=?, `work_position`=?, `description`=?, `address`=? WHERE `user_id`=?";
				connection.query(update_sql, [user_name, work_position, user_description, user_address, user_id], function(err, result){
					console.log(err);
					if (err) {
						responses.sendError(res);
						return;
					} else {
						var user_query = "SELECT * FROM `user_details` WHERE `user_id`=?";
						connection.query(user_query,[user_id], function(err, userResult){
							if(err) {
								responses.sendError(res);
								return;
							} else {
								userResult[0].user_password = '';
								var response = {
									"status": constants.responseFlags.ACTION_COMPLETE,
									"flag": 1,
									"message": constants.responseMessages.ACTION_COMPLETE,
									"response": userResult[0]
								};
								res.send(JSON.stringify(response));
								return;
							}
						});
					}
				});
			}
		});
	}
}

exports.send_friend_request = function(req, res) {
	var access_token = req.body.access_token;
	var friend_id = req.body.user_id;

	var manvalues = [access_token,friend_id];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {
		commonFunc.authenticateAccessToken(access_token, function(result) {
			if (result == 0) {
				var response = {
					status: constants.responseFlags.INVALID_ACCESS_TOKEN,
					flag: 1,
					response: {},
					message: "Invalid access token."    
				};
				res.send(JSON.stringify(response));
				return; 
			} else {
				var user_id = result[0].user_id;
				var sql = "SELECT * FROM `friend_list` WHERE `user_id`=? AND `friend_id`=?";
				connection.query(sql, [user_id,friend_id], function(err, result_check) {
					if (err) {
						responses.sendError(res);
						return;
					} else {
						if ( result_check.length > 0 ) {
							var response = {
								status: constants.responseFlags.ALREADY_EXIST,
								flag: 1,
								response: {},
								message: "Already freind"
							}
						} else {
							var friend_list_idd = commonFunc.generateRandomString();
							var friend_list_id = md5(friend_list_idd);
							var currentTime = new Date();
							var created_on = Math.round(currentTime.getTime() / 1000);
							
							var sql = "INSERT INTO `friend_list`(`friend_list_id`, `user_id`, `friend_id`, `created_on`) VALUES (?,?,?,?)";
							var value = [friend_list_id, user_id, friend_id, created_on];
							connection.query(sql, value, function (err, result) {
								if (err) {
									responses.sendError(res);
									return;
								} else {
									var response = {
										status: constants.responseFlags.ACTION_COMPLETE,
										flag: 1,
										response: {},
										message: "Succefully added"
									};
									res.send(JSON.stringify(response)); 
								}
							});
						}
					}
				});
			}
		});
	}
}

exports.get_friend_list = function(req, res) {
	var access_token = req.body.access_token;

	var manvalues = [access_token];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {
		commonFunc.authenticateAccessToken(access_token, function(result) {
			if (result == 0) {
				var response = {
					status: constants.responseFlags.INVALID_ACCESS_TOKEN,
					flag: 1,
					response: {},
					message: "Invalid access token."    
				};
				res.send(JSON.stringify(response));
				return; 
			} else {
				var user_id = result[0].user_id;
				var sql = "SELECT * FROM `friend_list` WHERE `user_id`=?";
				connection.query(sql, [user_id], function(err, result_check) {
					console.log(err);
					if (err) {
						responses.sendError(res);
						return;
					} else {
						if (result_check.length == 0) {
							var response = {
								"status": constants.responseFlags.ACTION_COMPLETE,
								"flag": 2,
								"response": {},
								"message": "No Friend Found"
							}
							res.send(JSON.stringify(response));
						} else {
							var userArr = [];
							for (var i = 0; i < result_check.length; i++) {
								userArr.push(result_check[i].friend_id);
							}
							var user_sql = "SELECT * FROM `user_details` WHERE `user_id` IN(?)";
							connection.query(user_sql, [userArr], function(err, result) {
								if (err) {
									responses.sendError(res);
									return;
								} else {
									for (var i = 0; i < result.length; i++) {
										result[i].user_password = "";
									}
									var response = {
										"status": constants.responseFlags.ACTION_COMPLETE,
										"flag": 1,
										"message": constants.responseMessages.ACTION_COMPLETE,
										"response": result
									};
									res.send(JSON.stringify(response));
									return;
								}
							});
						}
					}
				});
			}
		});
	}
}

var searchArray = [];
exports.search_user = function(req, res) {
	var access_token = req.body.access_token;
	var search_value = req.body.search_value;

	var manvalues = [access_token, search_value];
	var checkblank = commonFunc.checkBlank(manvalues);
	if (checkblank == 1) {
		responses.parameterMissingResponse(res);
		return;
	} else {
		commonFunc.authenticateAccessToken(access_token, function(result) {
			if (result == 0) {
				var response = {
					status: constants.responseFlags.INVALID_ACCESS_TOKEN,
					flag: 1,
					response: {},
					message: "Invalid access token."    
				};
				res.send(JSON.stringify(response));
				return; 
			} else {
				var user_id = result[0].user_id;
				var sql = "SELECT * FROM `user_details` WHERE `user_name` LIKE '"+search_value+"%'";
				connection.query(sql, [], function(err, result_check) {
					console.log(err);
					console.log(result_check);
					if (err) {
						responses.sendError(res);
						return;
					} else {
						if ( result_check.length > 0 ) {
							for (var i = result_check.length - 1; i >= 0; i--) {
								result_check[i].user_password = "";
								if ( result_check[i].user_thumbnail == "" ) {
                                	result_check[i].user_thumbnail = config.get("base_url")+"/user/user_placeholder.jpeg";
								} else {
									result_check[i].user_thumbnail = config.get("base_url")+"/user/"+result_check[i].user_thumbnail;
								}
								result_check[i]["is_friend"] = "";
								result_check[i]["current_user_id"] = user_id;
							}
							async.eachSeries(result_check, get_search_list_details, function (err) {
								console.log(searchArray);
								var response = {
									status: constants.responseFlags.ACTION_COMPLETE,
									flag: 1,
									response: searchArray,
									message: "Data fetched successfully."
								};
								res.send(JSON.stringify(response));
								searchArray = [];
								return;
							});
						} else {
							var response = {
								status: constants.responseFlags.ACTION_COMPLETE,
								flag: 1,
								response: {},
								message: "No data found."    
							};
							res.send(JSON.stringify(response));
						}
					}
				});
			}
		});
	}
}

function get_search_list_details(result, callback) {
	var user_id = result.user_id;
	var current_user_id = result.current_user_id;

	var sql = "SELECT * FROM `friend_list` WHERE `friend_created_by_id`=?";
	connection.query(sql, [current_user_id], function(err,userResult){
		// console.log(userResult);
		if(err) {
			callback();
		} else {
			if ( userResult.length > 0 ) {
				if ( user_id == userResult[0].friend_created_to_id ) {
					result.is_friend = "1";
				} else {
					result.is_friend = "0";
				}
			} else {
				result.is_friend = "0";
			}
			searchArray.push(result);
			callback();					
		}
	});
}