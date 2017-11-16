app.controller("login", ['$scope','httpService','API_URL','$window','$rootScope', function ($scope, httpService, API_URL, $window, $rootScope) {

	$scope.login_email_error = false;
	$scope.login_password_error = false;

	$scope.signup_name_error = false;
	$scope.signup_email_error = false;
	$scope.signup_password_error = false;
	$scope.signup_confirm_password_error = false;

	$scope.loginForm = function(){
		if($scope.login_email == undefined || $scope.login_email == null || $scope.login_email == ""){
			$scope.login_email_msg = "Please enter the email id";
			$scope.login_email_error = true;
		} else {
			var regex = new RegExp("^([a-zA-Z0-9_.]+@[a-zA-Z0-9]+[.][.a-zA-Z]+)$");
			if(!$scope.login_email.match(regex)){
				$scope.login_email_msg = "Please enter the valid email address.";
				$scope.login_email_error = true;
			} else {
				$scope.login_email_error = false;
			}
		}
		if($scope.login_password == undefined || $scope.login_password == null || $scope.login_password == ""){
			$scope.login_password_msg = "Please enter the password";
			$scope.login_password_error = true;
		} else {
			if($scope.login_password.length < 6){
				$scope.login_password_msg = "The password must be at least 8 characters long.";
				$scope.login_password_error = true;
			} else {
				$scope.login_password_error = false;
			}
		}

		if($scope.login_email_error == true || $scope.login_password_error == true){
			return false;
		} else {
			params = {user_email:$scope.login_email,user_password:$scope.login_password};
			httpService.post( API_URL + '/login', params).then(function(response){
				console.log(response);
				if( response.response.data.status == 200 ) {
					localStorage.setItem('user', JSON.stringify(response.response.data.response));
					$window.location.href = API_URL+'/#!/chat';
				} else {
					if ( response.response.data.flag == 1 ) {
						$scope.login_email_msg = response.response.data.message;
						$scope.login_email_error = true;
					} else if ( response.response.data.flag == 2 ) {
						$scope.login_password_msg = response.response.data.message;
						$scope.login_password_error = true;
					}
				}
			}, function myError( response ) {
				alert( response.data.message );
			});
		}
	}

	// $scope.logout = function(){
	//     // console.log('logout');
	//     localStorage.setItem('user', null);
	//     $rootScope.pivotuser = undefined;
	//     $scope.user_logged_in = false;
	//     $scope.logged_username = "";
	//     $window.location.href = API_URL;
	//     // $location.path( '/' );
	// }

	// $scope.formatString = function(format) {
	//     var day   = parseInt(format.substring(0,2));
	//     var month  = parseInt(format.substring(3,5));
	//     var year   = parseInt(format.substring(6,10));
	//     var date = new Date(year, month-1, day);
	//     return date;
	// }

	// $scope.dayDiff = function(firstDate,secondDate){
	//     var date2 = new Date($scope.formatString(secondDate));
	//     var date1 = new Date($scope.formatString(firstDate));
	//     var timeDiff = Math.abs(date2.getTime() - date1.getTime());   
	//     var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	//     alert(diffDays);
	// }

	$scope.signupForm = function(){

		if($scope.signup_name == undefined || $scope.signup_name == null || $scope.signup_name == ""){
			$scope.signup_name_error_msg = "Name is required";
			$scope.signup_name_error = true;
		} else {
			$scope.signup_name_error = false;
		}

		if($scope.signup_email == undefined || $scope.signup_email == null || $scope.signup_email == ""){
			$scope.signup_email_error_msg = "Email is required";
			$scope.signup_email_error = true;
		} else {
			var regex = new RegExp("^([a-zA-Z0-9_.]+@[a-zA-Z0-9]+[.][.a-zA-Z]+)$");
			if(!$scope.signup_email.match(regex)){
				$scope.signup_email_error_msg = "Please enter the valid email address.";
				$scope.signup_email_error = true;
			} else {
				$scope.signup_email_error = false;
			}
		}

		if($scope.signup_password == undefined || $scope.signup_password == null || $scope.signup_password == ""){
			$scope.signup_password_error_msg = "Password is required";
			$scope.signup_password_error = true;
		} else {
			if($scope.signup_password.length < 8){
				$scope.signup_password_error_msg = "The password must be at least 8 characters long.";
				$scope.signup_password_error = true;
			} else {
				// var passregex = new RegExp("^[a-zA-Z0-9/!/@/#/$/%/^/&/*]*$");
				// if(!$scope.signup_password.match(passregex)){
				//     $scope.signup_password_msg = "The password must contain alphabets or numbers.";
				//     $scope.signup_password_error = true;
				// } else {
				//     $scope.signup_password_error = false;
				// }
				$scope.signup_password_error = false;
			}
		}

		if($scope.signup_confirm_password == undefined || $scope.signup_confirm_password == null || $scope.signup_confirm_password == ""){
			$scope.signup_confirm_password_error_msg = "Confirm password is required";
			$scope.signup_confirm_password_error = true;
		} else {
			if($scope.signup_confirm_password != $scope.signup_password){
				$scope.signup_confirm_password_error_msg = "Passwords do not match";
				$scope.signup_confirm_password_error = true;
			} else {
				$scope.signup_confirm_password_error = false;
			}
		}

		if($scope.signup_name_error || $scope.signup_confirm_password_error || $scope.signup_password_error || $scope.signup_email_error) {
			return false;
		} else {
			
			params = {
				user_email:$scope.signup_email,
				user_password:$scope.signup_password,
				user_name:$scope.signup_name
			};
			
			httpService.post( API_URL + '/userCreate', params).then(function(response){
				console.log(response);
				if(response.response.data.status == 200){
					localStorage.setItem('user', JSON.stringify(response.response.data.response));
					$window.location.href = API_URL+'/#!/chat';
				} else {
					$scope.signup_email_error_msg = "Email is already exist";
					$scope.signup_email_error = true;
				}
			}, function myError(response) {
				if(response.status == 401){
					console.log(response.data);
				} else {
					console.log(response.data.message);
				}
			});
		}
	}

	// // console.log(fb.auth.authResponseChange)
	// $scope.$on('fb.auth.authResponseChange', function(fbResponse) {
	//     if($scope.is_social_login){
	//         $scope.status = $facebook.isConnected();
	//         if($scope.status) {
	//             $facebook.api('/me?fields=email,name,gender,picture').then(function(user) {
	//                 // console.log(user);return false;
	//                 $scope.socialType = 0;
	//                 var userPicture = "http://graph.facebook.com/" + user.id + "/picture?width=260&height=260";
	//                 params = {socialId:user.id,type:0,deviceToken:0,deviceType:2,socialType:0,email:user.email};
	//                 if(user.email){
	//                     params.emailCode = 1;
	//                     $scope.emailCode = 1;
	//                 } else {
	//                     params.emailCode = 0;
	//                     $scope.emailCode = 0;
	//                 }
	//                 // console.log(params);
	//                 // return false;
	//                 httpService.post( API_URL + 'api/socialLogin', params).then(function(response){
	//                     if(response.status == 200){
	//                         // console.log('fb success signin');
	//                         localStorage.setItem('user', JSON.stringify(response.response.result[0]));
	//                         $scope.user_logged_in = true;
	//                         $scope.logged_username = response.response.result[0].name;
	//                         $('#loginModal').modal('hide');
	//                         $window.location.href = API_URL;
	//                     } else {
	//                         // console.log('go to fb signup');
	//                         if(user.name != undefined){
	//                             $scope.signup_name = user.name;
	//                         }
	//                         $scope.fb_id = user.id;
	//                         $('#loginModal').modal('show');
	//                         modalAnimate($('#login-form'), $('#register-form'));
	//                     }
	//                 }, function myError(response) {
	//                     // console.log('go to fb signup');
	//                     var string = "The email has already been taken.";
	//                     if(string.indexOf(response.data.message) === 0){
	//                         $('#loginModal').modal('hide');
	//                         alert(response.data.message);
	//                         return false;
	//                     }
	//                     if(user.name != undefined){
	//                         $scope.signup_name = user.name;
	//                     }
	//                     if(user.email != undefined){
	//                         $scope.signup_email = user.email;
	//                         $scope.disable_signup_email = true;
	//                     } else {
	//                         $scope.disable_signup_email = false;
	//                     }
	//                     if(user.gender != undefined){
	//                         if(user.gender == "male")
	//                             $scope.signup_gender = "Male";
	//                         else if(user.gender == "female")
	//                             $scope.signup_gender = "Female";
	//                     }
	//                     if(userPicture != undefined){
	//                         $scope.social_image = userPicture;
	//                     }
	//                     $scope.social_signup_id = user.id;
	//                     $scope.fb_id = user.id;
	//                     $('#loginModal').modal('show');
	//                     modalAnimate($('#login-form'), $('#register-form'));
	//                 });
	//             }, function myError(response) {
	//                 alert('Something went wrong. Please try again!');        
	//             });
	//         }
	//     }
		
	// });
	// var $divForms = $('#modal-login-form-wrapper');
	// var $modalAnimateTime = 300;
	// function modalAnimate ($oldForm, $newForm) {
	//     var $oldH = $oldForm.height();
	//     var $newH = $newForm.height();
	//     $divForms.css("height",$oldH);
	//     $oldForm.fadeToggle($modalAnimateTime, function(){
	//         $divForms.animate({height: $newH}, $modalAnimateTime, function(){
	//             $newForm.fadeToggle($modalAnimateTime);
	//         });
	//     });
	// }

	// $scope.socialSignup = function(){
	//     if($scope.signup_name == undefined || $scope.signup_name == null || $scope.signup_name == "" || $scope.signup_email == undefined || $scope.signup_email == null || $scope.signup_email == "" || $('#date').val() == undefined || $('#date').val() == null || $('#date').val() == "" || $scope.signup_gender == undefined || $scope.signup_gender == null || $scope.signup_gender == ""){
	//         if($scope.signup_name == undefined || $scope.signup_name == null || $scope.signup_name == ""){
	//             $scope.signup_name_msg = "Name is required";
	//             $scope.signup_name_error = true;
	//             $scope.signup_error = true;
	//         } else {
	//             $scope.signup_name_error = false;
	//         }

	//         if($scope.signup_email == undefined || $scope.signup_email == null || $scope.signup_email == ""){
	//             $scope.signup_email_msg = "Email is required";
	//             $scope.signup_email_error = true;
	//             $scope.signup_error = true;
	//         } else {
	//             var regex = new RegExp("^([a-zA-Z0-9_.]+@[a-zA-Z0-9]+[.][.a-zA-Z]+)$");
	//             if(!$scope.signup_email.match(regex)){
	//                 $scope.signup_email_msg = "Please enter the valid email address.";
	//                 $scope.signup_email_error = true;
	//             } else {
	//                 $scope.signup_email_error = false;
	//             }
	//             // $scope.signup_email_error = false;
	//         }

	//         if($('#date').val() == undefined || $('#date').val() == null || $('#date').val() == ""){
	//             $scope.signup_dob_msg = "Date of birth is required";
	//             $scope.signup_dob_error = true;
	//             $scope.signup_error = true;
	//         } else {
	//             var date = new Date();
	//             date.setDate(date.getDate());
	//             var selectedDate = new Date($('#date').val());
				
	//             var timeDiff = Math.abs(date.getTime() - selectedDate.getTime());
	//             var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	//             // alert(diffDays);return false;
	//             if(diffDays < 6574){
	//                 $scope.signup_dob_msg = "Age cannot be less that 18 years.";
	//                 $scope.signup_dob_error = true;
	//                 $scope.signup_error = true;
	//             } else {
	//                 $scope.signup_dob_error = false;
	//             }
	//             // $scope.signup_dob_error = false;
	//         }

	//         if($scope.signup_gender == undefined || $scope.signup_gender == null || $scope.signup_gender == ""){
	//             $scope.signup_gender_msg = "Gender is required";
	//             $scope.signup_gender_error = true;
	//             $scope.signup_error = true;
	//         } else {
	//             $scope.signup_gender_error = false;
	//         }
	//         if($scope.signup_error){
	//             return false;
	//         }
	//     } else {
	//         $scope.signup_error = false;
	//     }
		
		
	//     if($scope.signup_gender == "Male"){
	//         $scope.gender_value = 0;
	//     } else {
	//         $scope.gender_value = 1;
	//     }

	//     params = {socialId:$scope.social_signup_id,email:$scope.signup_email,gender:$scope.gender_value,type:0,deviceToken:0,deviceType:2,socialType:$scope.socialType,name:$scope.signup_name,dob:$('#date').val(),image:$scope.social_image,referralCode:$scope.signup_referal,emailCode: $scope.emailCode};
	//     httpService.post( API_URL + 'api/socialLogin', params).then(function(response){
	//         if(response.status == 200 || response.status == 201){
	//             localStorage.setItem('user', JSON.stringify(response.response.result[0]));
	//             $scope.user_logged_in = true;
	//             $scope.logged_username = response.response.result[0].name;
	//             $('#loginModal').modal('hide');
	//             $window.location.href = API_URL;
	//         } else {
	//             alert(response.data.message);
	//         }
	//     }, function myError(response) {
	//         if(response.status == 401){
	//             alert(response.data.message);
	//             // $scope.signup_referal_msg = "Referral is incorrect";
	//             // $scope.signup_referal_error = true;
	//             // $scope.signup_error = true;
					
	//         } else {
	//             // $scope.signup_referal_error = false;
	//             // $scope.signup_error = false;
	//             alert(response.data.message);
	//         }
	//     });
	// }

	// $scope.loginToggle = function() {
	//     $scope.is_social_login = true;
	//     if($scope.status) {
	//         $facebook.logout();
	//     } else {
	//         $facebook.login();
	//     }
	// };

	// // $scope.getFriends = function() {
	// //   if(!$scope.status) return;
	// //   $facebook.cachedApi('/me/friends').then(function(friends) {
	// //     $scope.friends = friends.data;
	// //   });
	// // }

	// $scope.googleLogin = function(){
	//     // alert('dffd');
	//     $scope.is_social_login = true;
		
	// }

	// //Google signin
	// $scope.$on('event:google-plus-signin-success', function (event, authResult) {
	//     // User successfully authorized the G+ App!
	//     if($scope.is_social_login){
	//         params = {socialId:authResult.w3.Eea,type:0,deviceToken:0,deviceType:2,socialType:1,email:authResult.w3.U3};
	//         if(authResult.w3.U3){
	//             params.emailCode = 1;
	//             $scope.emailCode = 1;
	//         } else {
	//             params.emailCode = 0;
	//             $scope.emailCode = 0;
	//         }
	//         $scope.socialType = 1;
	//         httpService.post( API_URL + 'api/socialLogin', params).then(function(response){
	//             if(response.status == 200){
	//                 // console.log('google success signin');
	//                 localStorage.setItem('user', JSON.stringify(response.response.result[0]));
	//                 $scope.user_logged_in = true;
	//                 $scope.logged_username = response.response.result[0].name;
	//                 $('#loginModal').modal('hide');
	//                 $window.location.href = API_URL;
	//             } 
	//         }, function myError(response) {
	//             // console.log('go to google signup');
	//                 var string = "The email has already been taken.";
	//                 if(string.indexOf(response.data.message) === 0){
	//                     $('#loginModal').modal('hide');
	//                     alert(response.data.message);
	//                     return false;
	//                 }

	//                 if(authResult.w3.ig != undefined){
	//                     $scope.signup_name = authResult.w3.ig;
	//                 }
	//                 if(authResult.w3.U3 != undefined){
	//                     $scope.signup_email = authResult.w3.U3;
	//                     $scope.disable_signup_email = true;
	//                 } else {
	//                     $scope.disable_signup_email = false;
	//                 }
	//                 if(authResult.w3.Paa != undefined){
	//                     $scope.social_image = authResult.w3.Paa;
	//                 }
	//                 $scope.google_id = authResult.w3.Eea;
	//                 $scope.social_signup_id = authResult.w3.Eea;
	//             $('#loginModal').modal('show');
	//             modalAnimate($('#login-form'), $('#register-form'));
	//         });
	//     }

	// });
	// $scope.$on('event:google-plus-signin-failure', function (event, authResult) {
	//     // User has not authorized the G+ App!
	//     // console.log('Not signed into Google Plus.');
	// });

	// $scope.forgotPassword = function(){
	//     if($scope.forgot_email == undefined || $scope.forgot_email == "" || $scope.forgot_email == null){
	//         $scope.forgot_email_error = true;
	//         $scope.forgot_email_msg = "Please enter your email id";
	//         return false;
	//     } else {
	//         var regex = new RegExp("^([a-zA-Z0-9_.]+@[a-zA-Z0-9]+[.][.a-zA-Z]+)$");
	//         if(!$scope.forgot_email.match(regex)){
	//             $scope.forgot_email_msg = "Please enter the valid email address.";
	//             $scope.forgot_email_error = true;
	//         } else {
	//             $scope.forgot_email_error = false;
	//         }
			
	//     }
	//     if($scope.forgot_email_error){
	//         return false;
	//     }
	//     params = {email:$scope.forgot_email,type:0};
	//     httpService.post( API_URL + 'api/forgetPassword', params).then(function(response){
	//         // console.log(response);
	//         if(response.status == 200){
	//             $scope.success_message_display = true;
	//             $scope.success_message = "An email has been sent. Please check your email!";
	//             $timeout(function () {
	//                 $('#loginModal').modal('show');
	//                 modalAnimate($('#lost-form'), $('#login-form'));
	//             }, 3000);
	//         } else {
	//             $scope.success_message_display = false;
	//             alert(response.response.message);
	//         }
	//     }, function myError(response) {
	//         // console.log(response);
	//         // console.log(response.data.message);
	//         $scope.success_message_display = false;
	//         if(response.data.message)
	//             alert(response.data.message);

	//     });
	// }

	// $scope.registerForm = function(){
	//     // alert('sdfsdf');
	//     $scope.disable_signup_email = false;
	//     $scope.signup_name_error = false;
	//     $scope.signup_email_error = false;
	//     $scope.signup_dob_error = false;
	//     $scope.signup_gender_error = false;
	//     $scope.signup_password_error = false;
	//     $scope.signup_password_confirm_error = false;
	//     $scope.signup_referal_error = false;
	//     $scope.is_social_login = false;
	//     $scope.fb_id = undefined;
	//     $scope.google_id = undefined;
	//     $scope.signup_name = "";
	//     $scope.signup_email = "";
	//     $scope.signup_dob = "";
	//     $scope.signup_gender = "";
	//     $scope.signup_password = "";
	//     $scope.signup_password_confirm = "";
	//     $scope.signup_referal = "";
	//     $('#date').val("");
	// }

	// $scope.forgotForm = function(){
	//     $scope.forgot_email_error = false;
	//     $scope.forgot_email = "";
	// }

	// $scope.loginform = function(){
	//     $scope.login_email = "";
	//     $scope.login_password = "";
	//     $scope.login_email_error = false;
	//     $scope.login_password_error = false;
	//     $scope.login_remember = false;
	//     if($cookieStore.get('pivotuserobj') != undefined && $cookieStore.get('pivotuserobj') != null){
	//         $scope.cookieObj = JSON.parse($cookieStore.get('pivotuserobj'));
	//         if($scope.cookieObj.remember == true){
	//             $scope.login_email  = $scope.cookieObj.email;
	//             $scope.login_password = $scope.cookieObj.password;
	//             $scope.login_remember = true;
	//         }
	//     }
	// }

	// $scope.clearAll = function(){
	//     $scope.disable_signup_email = false;
	//     $scope.signup_name_error = false;
	//     $scope.signup_email_error = false;
	//     $scope.signup_dob_error = false;
	//     $scope.signup_gender_error = false;
	//     $scope.signup_password_error = false;
	//     $scope.signup_password_confirm_error = false;
	//     $scope.signup_referal_error = false;
	//     $scope.is_social_login = false;
	//     $scope.fb_id = undefined;
	//     $scope.google_id = undefined;
	//     $scope.signup_name = "";
	//     $scope.signup_email = "";
	//     $scope.signup_dob = "";
	//     $scope.signup_gender = "";
	//     $scope.signup_password = "";
	//     $scope.signup_password_confirm = "";
	//     $scope.signup_referal = "";
	//     $('#date').val("");
	//     $scope.forgot_email_error = false;
	//     $scope.forgot_email = "";
	//     $scope.login_email = "";
	//     $scope.login_password = "";
	//     $scope.login_email_error = false;
	//     $scope.login_password_error = false;
	//     $scope.login_remember = false;
	//     if($cookieStore.get('pivotuserobj') != undefined && $cookieStore.get('pivotuserobj') != null){
	//         $scope.cookieObj = JSON.parse($cookieStore.get('pivotuserobj'));
	//         if($scope.cookieObj.remember == true){
	//             $scope.login_email  = $scope.cookieObj.email;
	//             $scope.login_password = $scope.cookieObj.password;
	//             $scope.login_remember = true;
	//         }
	//     }
	// }

	// $scope.password_field = function(){
	//     if($scope.signup_password!=undefined)
	//         $scope.signup_password = $scope.signup_password.replace(' ','');
	// }

	// $scope.clearLocalTripId = function(){
	//     // console.log('clear function called');
	//     localStorage.setItem('userdraftid',null);
	// }

}]);
