app.controller("chat", ['$scope','httpService','API_URL','$window','$rootScope', function ($scope, httpService, API_URL, $window, $rootScope) {
	
	var user = localStorage.getItem("user");
	var userData = JSON.parse(user);
	var access_token = userData.access_token;

	$scope.friendlist = false;
	$scope.noFriendSuggestion = false;
	$scope.noFriendChatSuggestion = false;
	$scope.friendChatlist = false;

	$scope.logout = function() {
	    localStorage.removeItem('user');
	    $window.location.href = API_URL;
	}

	$scope.addFriend = function() {
		params = {access_token: access_token};
		httpService.post( API_URL + '/get_user_list', params).then(function(response){
			var response = response.response.data;
			console.log(response);
			if(response.status == 200){
				if (response.flag == "2") {
					$scope.noFriendSuggestionData = response.message;
					console.log($scope.noFriendSuggestionData);
					$('#add-friend-popup').show();
					$scope.noFriendSuggestion = true;
					$scope.friendlist = false;
				} else { 
					var userListData = response.response;
					for (var i = 0; i < userListData.length; i++) {
						if ( userListData[i].user_thumbnail != '' ) {
							userListData[i].user_thumbnail = API_URL+'/user/'+userListData[i].user_thumbnail;
						} else {
							userListData[i].user_thumbnail = "http://lorempixel.com/400/200/";
						}
					}
					$scope.userListData = userListData;
					$('#add-friend-popup').show();
					$scope.noFriendSuggestion = false;
					$scope.friendlist = true;
				}
			} 
		}, function myError(response) {
			// console.log("Something went wrong");
		});
	}

	$scope.init = function() {
		params = {access_token: access_token};
		httpService.post( API_URL + '/get_friend_list', params).then(function(response){
			var response = response.response.data;
			console.log(response);
			if(response.status == 200){
				var friendListData = response.response;
				if ( response.flag == 2 ) {
					$scope.noFriendChatSuggestionData = response.message;
					$scope.noFriendChatSuggestion = true;
					$scope.friendChatlist = false;
				} else {
					for (var i = 0; i < friendListData.length; i++) {
						if ( friendListData[i].user_thumbnail != '' ) {
							friendListData[i].user_thumbnail = API_URL+'/user/'+friendListData[i].user_thumbnail;
						} else {
							friendListData[i].user_thumbnail = "http://lorempixel.com/400/200/";
						}
					}
					$scope.friendListData = friendListData;
					$scope.noFriendChatSuggestion = false;
					$scope.friendChatlist = true;
				}
			}
		}, function myError(response) {
			// console.log("Something went wrong");
		});
	}
	$scope.init();

	$scope.addFriendRequest = function(user_id, key, event) {
		 
		params = {access_token: access_token, user_id: user_id};
		httpService.post( API_URL + '/send_friend_request', params).then(function(response){
			var response = response.response.data;
			console.log(response);
			if(response.status == 200){
				var userListData = response.response;
				$scope.userListData[key].is_friend = 1;
			}
		}, function myError(response) {
			// console.log("Something went wrong");
		});
	}
}]);