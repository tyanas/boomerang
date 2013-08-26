'use strict';

/* Controllers */

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function PayPalCtrl($scope, $http, $location) {
  $scope.paypal_button_key = '';
  $http.post('/keys').success(function(data) {
    $scope.paypal_button_key = data.paypal_button_key;
  })
}

function NewCallCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.message = '';

  $scope.submitCall = function () {
    $scope.message = 'Thanks for calling! Please wait a bit...';
    $http.post('/', $scope.form).
      success(function(data) {
        if (data.msg == 'error') {
          $scope.message = 'Your number is not OK, sorry.';
        } else {
          $scope.message = capitaliseFirstLetter(data.msg) + '. Calling ' + data.to;
        }
        $location.path('/');
      });
  };
}

