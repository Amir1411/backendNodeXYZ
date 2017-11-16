app.controller("index", ['$scope','httpService','API_URL','$window','$rootScope', function ($scope, httpService, API_URL, $window, $rootScope) {
	$scope.closePopup = function() {
		$('.modal').hide();
	}
}]);

app.service('socket', ['$rootScope', function($rootScope) {
	console.log("amir");
  // var socket = io.connect();
  // console.log(socket);
  // return {
  //   on: function(eventName, callback){
  //     socket.on(eventName, callback);
  //   },
  //   emit: function(eventName, data) {
  //     socket.emit(eventName, data);
  //   }
  // };
}]);