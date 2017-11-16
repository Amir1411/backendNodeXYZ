// var request = require('request');
var logging = require('./logging');
var constants = require('./constants');
// var nodemailer = require("nodemailer");
// var fs = require('fs');
// var phantom = require('phantom');
var debugging_enabled = true;
var smtpTransport = undefined;
var responses = require("./responses");
var connection = require('./connection');

/*
 * -----------------------------------------------
 * CHECK EACH ELEMENT OF ARRAY FOR BLANK
 * -----------------------------------------------
 */

var checkBlank = function(arr, req, res) {
	var arrlength = arr.length;
	for (var i = 0; i < arrlength; i++) {
		if (arr[i] === undefined) {
			arr[i] = "";
		} else {
			arr[i] = arr[i];
		}
		arr[i] = arr[i].trim();
		if (arr[i] === '' || arr[i] === "" || arr[i] == undefined) {
			return 1;
			break;
		}
	}
	return 0;
};
exports.checkBlank = checkBlank;

exports.checkBlankAsync = function (res, manValues, callback) {
	var checkBlankData = checkBlank(manValues);
	if (checkBlankData) {
		responses.parameterMissingResponse(res);
		return process.nextTick(callback.bind(null,null));
	} else {
		return  process.nextTick(callback.bind(null,null));
	}
};

exports.generateAndSavePdf=function(htmlData,HtmlFilePath,FilePath, callback) {
	fs.writeFile(HtmlFilePath, htmlData, function (err) {
		if (err) {
			console.log(err);
		} else {
			var options = { 'web-security': 'no' };
			phantom.create({parameters: options},function (ph) {
				ph.createPage(function (page) {
					page.set('viewportSize', {width: 1440, height: 2036});
					page.open(HtmlFilePath, function (status) {
						page.render(FilePath, function () {
							ph.exit();
							return callback(2);
						});
					});
				});
			});
		}
	});
};

/*
 * -----------------------------------------------
 * Send Email With Attachment
 * -----------------------------------------------
 */

exports.sendEmailWithAttachment = function (Files,Subject,Message,SendTo, callback) {
	var nodemailer = require("nodemailer");
	var smtpTransport = require('nodemailer-smtp-transport');
	var transporter = nodemailer.createTransport(smtpTransport({
		host: "smtp.mandrillapp.com",
		port: 587,
		auth: {
			user: config.get('emailCredentials.senderEmail'),
			pass: config.get('emailCredentials.senderPassword')
		}
	}));
	var mailOptions = {
		from: config.get('emailCredentials.senderEmail'),
		to:SendTo,
		subject: Subject,
		html: Message,
		attachments: Files
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
			return callback(0);
		} else {
			console.log(info);
			return callback(1);
		}
	});
};

/*
 * -----------------------------------------------
 * AUTHENTICATE ADMIN ACCESS TOKEN
 * -----------------------------------------------
 */

exports.authenticateAccessToken = function(userAccessToken, callback) {
	var sql = "SELECT * FROM `user_details` WHERE `access_token`=? LIMIT 1";
	connection.query(sql, [userAccessToken], function(err, result) {
		// console.log(result);
		if (result.length > 0) {
			// result[0]["user_password"] = "";
			return callback(result);
		} else {
			return callback(0);
		}
	});
};


exports.timeDifferenceInDays = function(date1, date2) {
	var t1 = new Date(date1);
	var t2 = new Date(date2);
	return parseInt((t2-t1)/86400000);
};

exports.generateRandomString = function() {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < 4; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

exports.convertTimeIntoLocal = function(date, timezone) {
	if (timezone==undefined || date == '0000-00-00 00:00:00') {
		return "N/A";
	} else {
		var newDate = new Date(date);
		var millies = timezone*60*1000;

		if (timezone < 0) {
			newDate.setTime(newDate.getTime()-millies)
		} else  {
			newDate.setTime(newDate.getTime()+millies)
		}

		var date = newDate.getDate();
		var month = newDate.getMonth()+1;
		var year = newDate.getFullYear();
		var sec = newDate.getSeconds();
		var hours = newDate.getHours();
		var mins = newDate.getMinutes();

		var datestring = date + "/" + month + "/" + year + " " + hours + ":" + mins+ ":" + sec;
		return datestring;
	}
};

function removeInvalidIds(allIds){
	// done to handle the case where array is passed after stringifying
	allIds = allIds.toString();
	allIds = allIds.split(',');

	var i = 0;
	var isInvalid = false;
	var regularExp = /@facebook.com/i;
	var index = allIds.length;
	while(index--) {
		allIds[index] = allIds[index].trim();
		isInvalid = regularExp.test(allIds[index]);
		if(isInvalid === true){
			allIds.splice(index, 1);
		}
	}
	return allIds;
}

exports.sendPlainTextEmail = function(to, cc, bcc, subject, message, callback){

	var nodemailer = require("nodemailer");
	if(smtpTransport === undefined) {
		smtpTransport = nodemailer.createTransport({
			service: config.get('emailCredentials.service'),
			auth: {
				user: config.get('emailCredentials.senderEmail'),
				pass: config.get('emailCredentials.senderPassword')
			}
		});
	}

	if(to) {
		to = removeInvalidIds(to);
	}
	if(cc) {
		cc = removeInvalidIds(cc);
	}
	if(bcc) {
		bcc = removeInvalidIds(bcc);
	}

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: config.get('emailCredentials.From'), // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		text: message // plaintext body
		//html: "<b>Hello world ?</b>" // html body
	};

	if(cc) {
		mailOptions.cc = cc;
	}
	if(bcc) {
		mailOptions.bcc = bcc;
	}

	// send mail with defined transport object
	if(to.length > 0 || cc.length > 0 || bcc.length > 0) {
		smtpTransport.sendMail(mailOptions, function (error, response) {
			console.log("Sending Mail Error: " + JSON.stringify(error));
			console.log("Sending Mail Response: " + JSON.stringify(response));
			return process.nextTick(callback.bind(null, error, response));
		});
	}
};

exports.sendHtmlEmail = function(to, cc, bcc, subject, htmlContent, callback){
	if(smtpTransport === undefined) {
		smtpTransport = nodemailer.createTransport({
			service: config.get('emailCredentials.service'),
			auth: {
				user: config.get('emailCredentials.senderEmail'),
				pass: config.get('emailCredentials.senderPassword')
			}
		});
	}

	if(to){
		to = removeInvalidIds(to);
	}
	if(cc){
		cc = removeInvalidIds(cc);
	}
	if(bcc){
		bcc = removeInvalidIds(bcc);
	}

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from    : config.get('emailCredentials.From'),
		to      : to,
		subject : subject,
		html    : htmlContent
	};

	if(cc){
		mailOptions.cc = cc;
	}
	if(bcc){
		mailOptions.bcc = bcc;
	}

	// send mail with defined transport object
	if(to.length > 0 || cc.length > 0 || bcc.length > 0) {
		smtpTransport.sendMail(mailOptions, function (error, response) {
			console.log("Sending Mail Error: " + JSON.stringify(error));
			console.log("Sending Mail Response: " + JSON.stringify(response));
			return process.nextTick(callback.bind(null, error, response));
		});
	}
};

exports.sendEmailForPassword = function(receiverMailId, message, subject, callback) {
	if(smtpTransport === undefined) {
		smtpTransport = nodemailer.createTransport({
			service: config.get('emailCredentials.service'),
			debug: true,
			auth: {
				user: config.get('emailCredentials.senderEmail'),
				pass: config.get('emailCredentials.senderPassword')
			}
		});
	}

	receiverMailId = removeInvalidIds(receiverMailId);

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: config.get('emailCredentials.From'), // sender address
		to: receiverMailId, // list of receivers
		subject: subject, // Subject line
		text: message // plaintext body
		//html: "<b>Hello world ?</b>" // html body
	};

	// send mail with defined transport object
	if(receiverMailId.length > 0) {
		smtpTransport.sendMail(mailOptions, function (error, response) {
			console.log("Sending Mail Error: " + error);
			console.log("Sending Mail Response: " + response);
			if (error) {
				return callback(0);
			} else {
				return callback(1);
			}

		});
	}
};

exports.sendHtmlContent = function(receiverMailId, html, subject, callback) {
	console.log(receiverMailId + html+ subject);
	if(smtpTransport === undefined){
		smtpTransport = nodemailer.createTransport({
			host: config.get('emailCredentials.host'),
			port: config.get('emailCredentials.port'),
			auth: {
				user: config.get('emailCredentials.senderEmail'),
				pass: config.get('emailCredentials.senderPassword')
			}
		});
	}

	receiverMailId = removeInvalidIds(receiverMailId);

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: config.get('emailCredentials.From'), // sender address
		to: receiverMailId, // list of receivers
		subject: subject, // Subject line
		html: html // html body
	}

	// send mail with defined transport object
	if(receiverMailId.length > 0) {

		smtpTransport.sendMail(mailOptions, function (error, response) {
			console.log("Sending Mail Error: " + JSON.stringify(error));
			console.log("Sending Mail Response: " + JSON.stringify(response));
			if (error) {
				return callback(0);
			} else {
				return callback(1);
			}
		});
	}

	// if you don't want to use this transport object anymore, uncomment following line
	//smtpTransport.close(); // shut down the connection pool, no more messages
};

exports.sendHtmlContent_UseBCC = function(receiverMailId, html, subject, callback) {
	if(smtpTransport === undefined){
		smtpTransport = nodemailer.createTransport({
			service: config.get('emailCredentials.service'),
			auth: {
				user: config.get('emailCredentials.senderEmail'),
				pass: config.get('emailCredentials.senderPassword')
			}
		});
	}

	receiverMailId = removeInvalidIds(receiverMailId);

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: config.get('emailCredentials.from'), // sender address
		bcc: receiverMailId, // list of receivers
		subject: subject, // Subject line
		html: html // html body
	}

	// send mail with defined transport object
	if(receiverMailId.length > 0){
		smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				return callback(0);
			} else {
				return callback(1);
			}
		});
	}

	// if you don't want to use this transport object anymore, uncomment following line
	//smtpTransport.close(); // shut down the connection pool, no more messages
};

exports.sendMessage = function(contact_number, message) {
	var accountSid = config.get('twillioCredentials.accountSid');
	var authToken = config.get('twillioCredentials.authToken');

	var client = require('twilio')(accountSid, authToken);
	client.messages.create({
		to: contact_number, // Any number Twilio can deliver to
		from: config.get('twillioCredentials.fromNumber'),
		body: message// body of the SMS message
	}, function(err, response) {
		if(err){
			console.log("Sms service: Error: " + err );
			console.log("Sms service: Response: " + response );
		}
	});
};

exports.encrypt = function(text) {
	var crypto = require('crypto');
	var cipher = crypto.createCipher('aes-256-cbc', 'd6F3Efeq');
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
};

exports.authenticateUser = function(userAccessToken, callback) {
	var sql = "SELECT `user_id`, `is_blocked`, `user_email`, `user_name`, `user_image`,`date_registered`, `current_location_latitude`, `current_location_longitude`, " +
		"`current_user_status`, `reg_as`, " +
		"`app_versioncode`, `device_type` " +
		"FROM `tb_users` WHERE `access_token`=? LIMIT 1";
	connection.query(sql, [userAccessToken], function(err, result) {
		//logging.logDatabaseQueryError("Authenticating user.", err, result, null);
		if (result.length > 0) {
			return callback(result);
		} else {
			return callback(0);
		}
	});
};

exports.getUserInformation = function(userId, callback) {
	var getInformation =
		'SELECT `user_id`, `user_name`, `phone_no`, `user_email`, `is_blocked` ' +
		'FROM `tb_users` ' +
		'WHERE `user_id` = ?';
	connection.query(getInformation, [userId], function(err, user){
		if(err){
			return process.nextTick(callback.bind(null, err, user));
		}

		if(user.length == 0){
			return process.nextTick(callback.bind(null, err, null));
		}

		return process.nextTick(callback.bind(null, err, user[0]));
	});
};

exports.calculateDistance=function(lat1, long1, lat2, long2) {
	var dist = require('geo-distance-js');
	var from = {lat: lat1, lng: long1};
	var to = [{lat: lat2, lng: long2}];

	var result = dist.getDistance(from, to, 'asc', 'metres', 2);
	return result[0].distance;
};

exports.sortByKeyAsc = function(array, key) {
	return array.sort(function(a, b) {
		var x = a[key];
		var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
};

function sortAsc(array, key) {
	return array.sort(function(a, b) {
		var x = a[key];
		var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

// Format the raw address obtained using google API
exports.formatLocationAddress = function(raw_address) {
	var pickup_location_address = 'Unnamed';
	var arr_formatted_address = raw_address.split(',');
	var arr_formatted_address_length = arr_formatted_address.length;
	var arr_pickup_location_address = [];
	for (var i = 0; i < arr_formatted_address_length; i++) {
		var flag = 0;
		for (var j = 0; j < arr_formatted_address_length; j++) {
			if ((i != j) && (arr_formatted_address[j].indexOf(arr_formatted_address[i]) > -1)) {
				flag = 1;
				break;
			}
		}
		if (flag == 0) {
			arr_pickup_location_address.push(arr_formatted_address[i]);
		}
	}

	pickup_location_address = arr_pickup_location_address.toString();
	return pickup_location_address;
};

// Get the address of the location using the location's latitude and longitude
exports.getLocationAddress = function(latitude, longitude, callback) {
	request('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude, function (error, response, body)
	{
		var pickup_address = 'Unnamed';
		if (!error && response.statusCode == 200)
		{
			body = JSON.parse(body);
			if (body.results.length > 0)
			{
				var raw_address = body.results[0].formatted_address;
				pickup_address = module.exports.formatLocationAddress(raw_address);
			}
		}
		callback(pickup_address);
	});
};

exports.generateUniqueCode = function (callback){
	var validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var code = config.get('startPromoCodeWith');
	var i = 0;
	for(i = 0; i < 6; i++){
		code += validChars[Math.round(Math.random() * (36 - 1))];
	}
	var check_existing = "SELECT * FROM `tb_promotions` WHERE `promotion_code`=?";
	connection.query(check_existing, [code], function(err, result){
		if(err){
			logging.logDatabaseQueryError("Getting any existing promotional code", err, result);
			callback(err);
		}
		if(result.length > 0){
			generateUniqueCode(callback);
		}
		else{
			callback(err, code);
		}
	});
};

exports.timeDifferenceInDays = function(date1, date2){
	var t1 = new Date(date1);
	var t2 = new Date(date2);
	return parseInt((t2-t1)/86400000);
};

exports.timeDifferenceInHours = function(date1, date2){
	var t1 = new Date(date1);
	var t2 = new Date(date2);
	return parseInt((t2-t1)/3600000);
};

exports.timeDifferenceInMinutes = function(date1, date2){
	var t1 = new Date(date1);
	var t2 = new Date(date2);
	return parseInt((t2-t1)/60000);
};

exports.timeDifferenceInSeconds = function(date1, date2){
	var t1 = new Date(date1);
	var t2 = new Date(date2);
	return parseInt((t2-t1)/1000);
};

exports.changeTimezoneFromIstToUtc = function(date){
	var temp = new Date(date);
	return new Date(temp.getTime() - (3600000 * -4.5)).toISOString();
};

exports.changeTimezoneFromUtcToIst = function(date){
	var temp = new Date(date);
	return new Date(temp.getTime() + (3600000 * -4.5)).toISOString();
};

exports.getMysqlStyleDateString = function(jsDate){
	var year = jsDate.getFullYear().toString();
	var month = (jsDate.getMonth() + 1).toString();
	month = month.length == 1 ? '0' + month : month;
	var date = jsDate.getDate().toString();
	date = date.length == 1 ? '0' + date : date;
	return year + '-' + month + '-' + date;
}
