'use strict';

var app = angular.module('pasteyeapp', ['ngCookies', 'ngSanitize', 'restangular', 'ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/stats");
    $stateProvider
        .state('stats', {
        url: "/stats",
        templateUrl: "views/partials/stats.html"
    })
        .state('settings', {
        url: "/settings",
        templateUrl: "views/partials/settings.html"
    });

});

app.controller('HeaderCtrl', function ($scope, $window) {
    $scope.isLoggedIn = function () {
        var appRoute = $window.location.pathname;
        if (appRoute === '/app') {
            return true;
        }
        else {
            return false;
        }
    };

    $scope.navClass = function (page) {
        var currentRoute = $window.location.pathname || 'home';
        return page === currentRoute ? 'active' : '';
    };
});

app.controller('AppCtrl', function ($scope, CurrentUser, $window, $http) {

    CurrentUser.current.get().then(function (user) {
        $scope.currentUser = user;
        $scope.currentSet = [{'name': 'username', 'value': user.username}, {'name': 'password', 'value': null}, {'name': 'E-mail', 'value': user.userEmail}];
        $scope.userUpdateData = {};
        $scope.userDeleteData = {apikey: user.apikey};
    });
    CurrentUser.current.one('settings').get().then(function (settings) {
        $scope.currentSettingsRaw = settings;
        $scope.currentSettings = [{'name': 'ip', 'value': settings.ip}, {'name': 'email', 'value': settings.email}, {'name': 'hash', 'value': settings.hash}];
        $scope.monitorUpdateData = {};
    });
    CurrentUser.current.one('stats').get().then(function (stats) {
        $scope.currentStatsRaw = stats;
        $scope.currentStats = [{'name': 'ip', 'value': stats.ip}, {'name': 'email', 'value': stats.email}, {'name': 'hash', 'value': stats.hash}];
        $scope.totalTriggers = stats.ip + stats.email + stats.hash;
    });
    $scope.userDelete = function () {
        $scope.deleteFormError = false;
        $scope.deleteErrorMessage = undefined;
        $scope.deleteErrorMessageFlag = false;
        if ($scope.userDeleteData.username === $scope.currentUser.username) {
            $http({method: 'DELETE', url: '/api/users/', headers: {"Content-Type": "application/json"}, data: $scope.userDeleteData})
                .success(function (data, status) {
                    window.location.replace('/');
                })
                .error(function (data, status) {
                    $scope.deleteErrorMessage = data;
                    $scope.deleteErrorMessageFlag = true;
                });
        }
        else {
            $scope.deleteFormError = true;
        }
    };

    $scope.userSettingsUpdate = function () {
        for (var n in $scope.userUpdateData) {
            if ($scope.userUpdateData.hasOwnProperty(n)) {
                if ($scope.userUpdateData[n] === null || $scope.userUpdateData[n] === "") {
                    delete $scope.userUpdateData[n];
                }
            }
        }
        $scope.userUpdateData.apikey = $scope.currentUser.apikey;
        console.log($scope.userUpdateData);
        $http({method: 'PUT', url: '/api/users/' + $scope.currentUser.id, data: $scope.userUpdateData})
            .success(function (data, status) {
                if ($("#successMessage").hasClass("hide") && $("#errorMessage").hasClass("hide")) {
                    $("#successMessage").toggleClass("hide");
                }
                else if ((! $("#errorMessage").hasClass("hide")) && $("#successMessage").hasClass("hide")) {
                    $("#errorMessage").toggleClass("hide");
                    $("#successMessage").toggleClass("hide");
                }
            })
            .error(function (data, status) {
                console.log('PUT ERROR! ' + data + ' ' + status);
                $scope.errMessage = data;
                if ($("#successMessage").hasClass("hide") && $("#errorMessage").hasClass("hide")) {
                    $("#errorMessage").toggleClass("hide");
                }
                else if ((! $("#successMessage").hasClass("hide")) && $("#errorMessage").hasClass("hide")) {
                    $("#errorMessage").toggleClass("hide");
                    $("#successMessage").toggleClass("hide");
                }
            });
    };

    $scope.monitorSettingsUpdate = function () {
        if (!$("#monitorForm").checkValidity || $("#monitorForm").checkValidity()) {
            for (var n in $scope.monitorUpdateData) {
                if ($scope.monitorUpdateData.hasOwnProperty(n)) {
                    if ($scope.monitorUpdateData[n] === null || $scope.monitorUpdateData[n] === "") {
                        delete $scope.monitorUpdateData[n];
                    }
                }
            }
            $scope.monitorUpdateData.apikey = $scope.currentUser.apikey;
            console.log($scope.monitorUpdateData);
            $http({method: 'PUT', url: '/api/users/' + $scope.currentUser.id, data: $scope.monitorUpdateData})
                .success(function (data, status) {
                    if ($("#successMessage").hasClass("hide") && $("#errorMessage").hasClass("hide")) {
                        $("#successMessage").toggleClass("hide");
                    }
                    else if ((! $("#errorMessage").hasClass("hide")) && $("#successMessage").hasClass("hide")) {
                        $("#errorMessage").toggleClass("hide");
                        $("#successMessage").toggleClass("hide");
                    }
                })
                .error(function (data, status) {
                    console.log('PUT ERROR! ' + data + ' ' + status);
                    $scope.errMessage = data;
                    if ($("#successMessage").hasClass("hide") && $("#errorMessage").hasClass("hide")) {
                        $("#errorMessage").toggleClass("hide");
                    }
                    else if ((! $("#successMessage").hasClass("hide")) && $("#errorMessage").hasClass("hide")) {
                        $("#errorMessage").toggleClass("hide");
                        $("#successMessage").toggleClass("hide");
                    }
                });
        }
        else {
            $scope.errorMessage = "Your monitor inputs are invalid";
            $("#errorMessage").removeClass("hide");
        }
    };
});
