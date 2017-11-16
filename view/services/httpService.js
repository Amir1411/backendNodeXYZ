/*
  |------------------------------------------------------------------
  |                     This Service gets called whenever an ajax request is made to the Server       |
  |------------------------------------------------------------------
 */

app.service('httpService', ['$window', '$http',  '$q','API_URL',  function ($window, $http, $q,API_URL) {

    var httpService = {};
    var savedData = {};
    //===========================GET RESOURCE==============================
    var get = function (module, parameter, event) {
        var deferred = $q.defer();
        $http.get( module, { params: parameter }, { headers: { 'Content-Type': 'application/json' } }).success(function (response) {
            deferred.resolve(response);
        }).catch(function (data, status, headers, config, event) { // <--- catch instead error
            if(data.status == 403){
                console.log('service called');
                $window.location.href = base_url+'/';
                localStorage.setItem('user',null);
                alert('Session expired! Please login to continue.');
                event.preventDefault();
            }
            deferred.reject(data.statusText);
        });

        return deferred.promise;
    };

    //===========================POST RESOURCE==============================
    var post = function (module, parameter) {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            token = user.accessToken;
            url = module;
        }
        else {
            token = "";
            url = module;
        }
        var deferred = $q.defer();
        $http.post( url, parameter, { headers: { 'Content-Type': 'application/json','accessToken':token} }).then(function (response, status, headers, config, event) {
            var data = [];
            // alert('service');
            data.response = response;
            data.status = status;
            // console.log(parameter);
            if(status == 403){
                console.log('service called');
                localStorage.setItem('user',null);
            }
            // data.headers = headers;
            // data.config = config;
            deferred.resolve(data);

        }, function myError(response, status, headers, config) {
            var data = [];
            console.log(parameter);
            data.response = response;
            if(status == 403){
                console.log('service called');
                localStorage.setItem('user',null);
            }
            data.status = status;
            deferred.resolve(data);

        }).catch(function (data, status, headers, config, event) { // <--- catch instead error
            console.log(parameter);
            
            if(data.status == 403){
                console.log('service called');
                $window.location.href = base_url+'/';
                localStorage.setItem('user',null);
                alert('Session expired! Please login to continue.');
                event.preventDefault();

            }
            deferred.reject(data);
        });
        return deferred.promise;
    };
    
    //===========================POST RESOURCE WITH FILE==============================
    var postWithFile = function (module, parameter) {
        var user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            token = localStorage.getItem('token');
            url = module;
        }
        else {
            url = module;
        }
        var deferred = $q.defer();
        $http.post( url, parameter, {transformRequest: angular.identity, headers: { 'Content-Type': undefined} }).then(function (response) {
            /*Check if response token is expired/invalidated*/
            // if(response.status == 401 || response.status == 402){
            //     var re = new RegExp("^.*(Token Expired).*$");
            //     var reInvalid = new RegExp("^.*(Invalid token).*$");
            //     var reToken = new RegExp("^.*(Token is not provided).*$");
            //     var reTokenError = new RegExp("^.*(Token Error).*$");
            //     if (re.test(response.msg)) {
            //         //alert('Token Expired');
            //         localStorage.setItem('user', null);
            //         logoutUser();
            //     } else if (reInvalid.test(response.msg)) {
            //         //alert('Invalid Token');
            //         localStorage.setItem('user', null);
            //         logoutUser();
            //     } else if (reToken.test(response.msg)) {
            //         //alert('Token not provided')
            //         localStorage.setItem('user', null);
            //         logoutUser();
            //     } else if (reTokenError.test(response.msg)) {
            //         //alert('Token Error')
            //         localStorage.setItem('user', null);
            //         logoutUser();
            //     }
            // } else {
                deferred.resolve(response);
            // }

         }).catch(function (data, status, headers, config) { // <--- catch instead error
             deferred.reject(data);
        });
        return deferred.promise;
    }

    //===========================CLEAR COOKIE RESOURCE==============================
    var logoutUser = function () {
        url = API_URL+'api/clearcookie';
        $http.post(url,{},{ headers: { 'Content-Type': 'application/json'} }).success(function (response) {
            if (response.status == 200) {
                alert('Some error occured,please login again');
                $window.location.href = API_URL+'login';    
            }
            else{
                alert('Some error occured,please login again');
                $window.location.href = API_URL+'login';    
            }
        });
        localStorage.clear();
    }
    //===========================UPDATE RESOURCE==============================
    var update = function (module, parameter) {
        // console.log("hitting Service=============");

        var deferred = $q.defer();

        $http.post( module + '/' + parameter.id, parameter, { headers: { 'Content-Type': 'application/json' } }).success(function (response) {

            deferred.resolve(response);

        }).catch(function (data, status, headers, config) { // <--- catch instead error
            deferred.reject(data.statusText);
        });

        return deferred.promise;
    };


    //===========================DELETE RESOURCE==============================
    var del = function (module, parameter) {
        // console.log("hitting Service=============");
        
        url = module;
        var deferred = $q.defer();
        console.log(parameter);
        $http.delete( url, parameter, { headers: { 'Content-Type': 'application/json'} }).success(function (response, status, headers, config) {
            var data = [];
            data.response = response;
            data.status = status;
            deferred.resolve(data);

        }, function myError(response, status, headers, config) {
            var data = [];
            data.response = response;
            data.status = status;
            deferred.resolve(data);

        }).catch(function (data, status, headers, config) { // <--- catch instead error
            deferred.reject(data);
        });
        return deferred.promise;
    };
    
    function setData(data) {
        savedData = data;
    }
    function getData() {
        return savedData;
    }
    function resetData(){
        savedData = {};
    }
    httpService.get = get;
    httpService.post = post;
    httpService.postWithFile = postWithFile;
    httpService.update = update;
    httpService.del = del;
    httpService.setData = setData;
    httpService.getData = getData;
    httpService.resetData = resetData;
    return httpService;
}]);
