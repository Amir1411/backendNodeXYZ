var commonFunc = require('./commonfunction');
var md5 = require('MD5');
var responses = require('./responses');
var Handlebars = require('handlebars');
var logging = require('./logging');
var constants = require('./constants');
var connection = require('./connection');
var config = require('config');
var async = require('async');

exports.create_post = function(req, res) {
	var access_token = req.body.access_token;
	var post_caption = req.body.post_caption;

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
				if ( post_caption == undefined ) {
					post_caption = '';
				}

				var posted_by_id = result[0].user_id;
				var post_unique_id = commonFunc.generateRandomString();
				var post_id = md5(post_unique_id);
				var currentTime = new Date();
				var created_on = Math.round(currentTime.getTime() / 1000);

				if ( req.file != undefined ) {
					var post_image = req.file.filename;
				} else {
					var post_image = "";
				}

				var sql = "INSERT INTO `post`(`post_id`, `posted_by_id`, `post_caption`, `post_image`, `created_on`) VALUES (?,?,?,?,?)";
				var value = [post_id, posted_by_id, post_caption, post_image, created_on];
				connection.query(sql, value, function (err, result) {
					if (err) {
						responses.sendError(res);
						return;
					} else { 
						var response = {
							status: constants.responseFlags.ACTION_COMPLETE,
							flag: 1,
							response: "Order created successfully.",
							message: "Order created successfully."
						};
						res.send(JSON.stringify(response)); 
					}
				});
			}
		});
	}
}

var postArray = [];
exports.get_post = function(req, res) {
	var access_token = req.body.access_token;
	var manvalues = [access_token];
	var checkblank = commonFunc.checkBlank(manvalues);
	console.log(checkblank);
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
				var sql = "SELECT * FROM `post` ORDER BY `row_id` DESC";
				connection.query(sql, [], function(err, result) {
					console.log(err);
					if(err) {
						responses.sendError(res);
						return;
					} else if ( result.length > 0 ) {
						for (var i = 0; i < result.length; i++) {
							if ( result[i].post_image != "" ) {
								result[i].post_image = config.get("base_url")+"/post/"+result[i].post_image;
							}
							result[i]["user_id"] = user_id;
							result[i]["user_access_token"] = access_token;
							// result[i]["is_liked_by_me"] = 0;
						}

						async.eachSeries(result, get_post_list_details, function (err) {
							var response = {
								status: constants.responseFlags.ACTION_COMPLETE,
								flag: 1,
								response: postArray,
								message: "Data fetched successfully."
							};
							res.send(JSON.stringify(response));
							postArray = [];
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
				});
			}
		});
	}
}

function get_post_list_details(result, callback) {
	var user_id = result.user_id;
	var post_id = result.post_id;
	var posted_by_id = result.posted_by_id;

	var sql = "SELECT * FROM `user_details` WHERE `user_id`=?";
	connection.query(sql, [posted_by_id], function(err,userResult){
		// console.log(userResult);
		if(err) {
			callback();
		} else {
			if ( userResult[0].user_thumbnail == '' ) {
				userResult[0].user_thumbnail = config.get('base_url')+"/user/user_placeholder.jpeg";
			} else {
				userResult[0].user_thumbnail = config.get('base_url')+"/user/"+userResult[0].user_thumbnail;
			}
			// callback(userResult[0]);
			async.parallel([
				function(callback) {
	                get_commentList_with_posted_details(post_id,function(total_comment_list_result){
	                    callback(null,total_comment_list_result)
	                });
	            },
	            function(callback) {
	                get_comment_count(post_id,function(total_comment_count_result){
	                    callback(null,total_comment_count_result)
	                });
	            },
	            function(callback) {
	                get_like_count(post_id, user_id, function(total_like_count_result){
	                    callback(null,total_like_count_result)
	                });
	            },
	            function(callback) {
	                get_is_liked_by_me(post_id, user_id, function(is_liked_by_me_result){
	                    callback(null,is_liked_by_me_result)
	                });
	            }
			], function(err, results){
				// console.log(results[0]); // Post Comment list
				// console.log(results[1]); // Post Comment count
				// console.log(results[2]); // Post Like count
				// console.log(results[3]); // Post is liked by me
				result.post_comment = results[0];
				result.is_liked_by_me = results[3];
				result.post_like_count = results[2];
				result.post_comment_count = results[1];
				postArray.push({
					post_details: result, 
					user_details: userResult[0], 
					user_access_token: 
					result.user_access_token
				});
				callback();	
			});							
		}
	});
}

function get_commentList_with_posted_details ( post_id, callback ) {
	var sql = "SELECT * FROM `post_comment` WHERE `post_id`=? ORDER BY `row_id` DESC LIMIT 2";
	connection.query(sql, [post_id], function(err,postCommentResult){
		console.log(err);
		if(err) {
			callback();
		} else {
			async.eachSeries(postCommentResult, get_commented_by_post_details, function (err) {
				callback(postCommentResult);
			});
		}
	});
}

function get_commented_by_post_details (postCommentResult, callback) {
	var sql = "SELECT * FROM `user_details` WHERE `user_id`=?";
	connection.query(sql, [postCommentResult.post_commented_by_id], function(err, postCommentUserResult){
		if (err) {
			callback();
		} else {
			for (var i = 0; i < postCommentUserResult.length; i++) {
				postCommentUserResult[i]["user_password"] = "";
				if ( postCommentUserResult[i].user_thumbnail == '' ) {
					postCommentUserResult[i].user_thumbnail = config.get('base_url')+"/user/user_placeholder.jpeg";
				} else if (postCommentUserResult[i].user_thumbnail != '') {
					postCommentUserResult[i].user_thumbnail = config.get('base_url')+"/user/"+postCommentUserResult[i].user_thumbnail;
				}
			}
			postCommentResult.posted_details = postCommentUserResult[0];
			callback();
		}
	});
}

function get_comment_count ( post_id, callback) {
	var sql = "SELECT * FROM `post_comment` WHERE `post_id`=?";
	connection.query(sql, [post_id], function(err,postCommentCountResult){
		console.log(err);
		if(err) {
			callback();
		} else {
			callback(postCommentCountResult.length);
		}
	});
}

function get_like_count(post_id, user_id, callback) {
	var sql = "SELECT * FROM `post_like` WHERE `post_id`=? AND `post_like_by_id`!=?";
	connection.query(sql, [post_id, user_id], function(err,postLikeCountResult){
		if(err) {
			callback();
		} else {
			callback(postLikeCountResult.length);
		}
	});
}

function get_is_liked_by_me (post_id, user_id, callback) {
	var sql = "SELECT * FROM `post_like` WHERE `post_like_by_id`=? AND `post_id`=?";
	connection.query(sql, [user_id, post_id], function(err,postLikeResult){
		if(err) {
			callback();
		} else {
			if ( postLikeResult.length == 0 ) {
				var is_liked_by_me = 0;
			} else {
				var is_liked_by_me = 1;
			}
			callback(is_liked_by_me);
		}
	});
}

exports.post_like = function(req, res) {
	var access_token = req.body.access_token;
	var is_liked_by_me = req.body.is_liked_by_me;
	var post_id = req.body.post_id;

	var manvalues = [access_token, post_id];
	var checkblank = commonFunc.checkBlank(manvalues);
	console.log(checkblank);
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
				var post_like_by_id = result[0].user_id;
				if ( is_liked_by_me == 1 ) {
					var delete_sql = "DELETE FROM `post_like` WHERE `post_id`=? AND `post_like_by_id`=?";
					connection.query(delete_sql, [post_id, post_like_by_id], function(err, result){
						if (err) {
							responses.sendError(res);
							return;
						} else {
							var response = {
								status: constants.responseFlags.ACTION_COMPLETE,
								flag: 1,
								response: { "is_liked_by_me": 0 },
								message: "Post unliked successfully."
							};
							res.send(JSON.stringify(response));
						}
					});
				} else {
					var post_like_unique_id = commonFunc.generateRandomString();
					var post_like_id = md5(post_like_unique_id);
					var currentTime = new Date();
					var created_on = Math.round(currentTime.getTime() / 1000);

					var sql = "INSERT INTO `post_like`(`post_id`, `post_like_id`, `post_like_by_id`, `created_on`) VALUES (?,?,?,?)";
					var value = [post_id, post_like_id, post_like_by_id, created_on];
					connection.query(sql, value, function (err, result) {
						if (err) {
							responses.sendError(res);
							return;
						} else { 
							var response = {
								status: constants.responseFlags.ACTION_COMPLETE,
								flag: 1,
								response: { "is_liked_by_me": 1 },
								message: "Post liked successfully."
							};
							res.send(JSON.stringify(response)); 
						}
					});
				}
			}
		});
	}
}

exports.post_comment = function(req, res) {
	var access_token = req.body.access_token;
	var comment_msg = req.body.comment_msg;
	var post_id = req.body.post_id;

	var manvalues = [access_token, post_id, comment_msg];
	var checkblank = commonFunc.checkBlank(manvalues);
	console.log(checkblank);
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
				var post_commented_by_id = result[0].user_id;
				var post_comment_unique_id = commonFunc.generateRandomString();
				var post_comment_id = md5(post_comment_unique_id);
				var currentTime = new Date();
				var created_on = Math.round(currentTime.getTime() / 1000);

				var sql = "INSERT INTO `post_comment`(`post_id`, `post_comment_id`, `post_commented_by_id`, `comment_text`, `created_on`) VALUES (?,?,?,?,?)";
				var value = [post_id, post_comment_id, post_commented_by_id, comment_msg, created_on];
				connection.query(sql, value, function (err, result) {
					if (err) {
						responses.sendError(res);
						return;
					} else { 
						var sql = "SELECT * FROM `post_comment` WHERE `post_comment_id`=?";
						connection.query(sql, [post_comment_id], function(err,postCommentResult){
							if(err) {
								responses.sendError(res);
								return;
							} else {
								var sql = "SELECT * FROM `user_details` WHERE `user_id`=?";
								connection.query(sql, [postCommentResult[0].post_commented_by_id], function(err, postCommentUserResult){
									if (err) {
										callback();
									} else {
										postCommentUserResult[0]["user_password"] = "";
										if ( postCommentUserResult[0].user_thumbnail == '' ) {
											postCommentUserResult[0].user_thumbnail = config.get('base_url')+"/user/user_placeholder.jpeg";
										} else if (postCommentUserResult[0].user_thumbnail != '') {
											postCommentUserResult[0].user_thumbnail = config.get('base_url')+"/user/"+postCommentUserResult[0].user_thumbnail;
										}

										postCommentResult[0].posted_details = postCommentUserResult[0];
										var response = {
											status: constants.responseFlags.ACTION_COMPLETE,
											flag: 1,
											response: postCommentResult[0],
											message: "Post commented successfully."
										};
										res.send(JSON.stringify(response)); 
									}
								});
							}
						});
					}
				});
			}
		});
	}
}