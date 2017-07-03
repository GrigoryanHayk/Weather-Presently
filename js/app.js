var myApp = angular.module('myApp', [
    'ngRoute'
]);

myApp.config(['$routeProvider', 'WeatherProvider', function($routeProvider, WeatherProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'templates/home.html',
            controller: 'MainController'
        }).
        otherwise({redirectTo: '/'});

    WeatherProvider.setApiKey("7a0aa51cccfad285");
}]);

myApp.controller('MainController', ['$scope', '$timeout', '$http', 'Weather', 'Countries', 
    function($scope, $timeout, $http, Weather, Countries) {
    
    $scope.date = {};
    $scope.weather = {};
    $scope.countries = [];

    Countries.getCountiesList().
        then(function (data) {
            for(var i = 0, len = data.length; i < len; i++) {
                var country = {};
                country.name = data[i].name;
                country.val = /*data[i].name + "/" + */data[i].capital;
                $scope.countries.push(country);
            }
            $scope.setWeatherShow();
        });

    $scope.setWeatherShow = function(country) {
        if(country) getWeatherForecast(country.val);
        else $scope.weather.forecast = {};
    };

    $scope.changeWeatherShow = function() {
        var countryVal = $scope.countriesList;
        if(countryVal) getWeatherForecast(countryVal);
        else $scope.weather.forecast = {};
    };

    var getWeatherForecast = function(countryVal) {
        Weather.getWeatherForecast(countryVal).
            then(function(data) {
                $scope.weather.forecast = data;
            });
    };
    var updateTime = function() {
        $scope.date.raw = new Date();
        $timeout(updateTime, 1000);
    };
    updateTime();
}]);

myApp.provider("Weather", function () {
    var apiKey = "";
    var apiUrl = "http://api.wunderground.com/api/";

    this.setApiKey = function(key) {
        if(key) apiKey = key;
    };

    this.getUrl = function(type, ext) {
        return apiUrl + apiKey + "/" + type + "/q/" + ext + ".json";
    };

    this.$get = function($http, $q) {
        var self = this;
        return {
            getWeatherForecast: function (city) {
                var d = $q.defer();
                $http({
                    method: 'GET',
                    url: self.getUrl('forecast', city),
                    cache: true
                }).success(function(data) {
                    d.resolve(data.forecast.simpleforecast);
                }).error(function(err) {
                    d.reject(err);
                });
                return d.promise;
            }
        }
    }
});

myApp.provider("Countries", function() {
    var apiUrl = "https://restcountries.eu/rest/v1/all";

    this.getUrl = function() {
        return apiUrl;
    };

    this.$get = function ($http, $q) {
        var self = this;
        return {
            getCountiesList: function () {
                var d = $q.defer();
                $http({
                    method: 'GET',
                    url: self.getUrl(),
                    cache: true
                }).success(function(data) {
                    d.resolve(data);
                }).error(function(err) {
                    d.reject(err);
                });
                return d.promise;
            }
        }
    }
});