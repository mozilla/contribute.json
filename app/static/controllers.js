var app = angular.module('contribute.controllers', [])

.controller('FormController', [
    '$scope', '$location',
    function($scope, $location) {

        document.title = '/contribute.json';

        $scope.validation = {};
        $scope.validation.url = '';

        $scope.validate = function() {
            if (!$scope.validation.url.trim()) return;
            var url = $scope.validation.url.trim();
            $location.path('/' + encodeURIComponent(url));
            // $location.path('/' + encodeURI(url));
            return false;
        };
}])

.controller('ExamplesController', [
    '$scope', '$http',
    function($scope, $http) {
        $scope.loading = true;
        document.title = 'Examples of contribute.json';

        $http.get('/examples.json')
        .success(function(response) {
            $scope.urls = response.urls;
        })
        .error(function(data, status) {
            console.error(data, status);
        })
        .finally(function() {
            $scope.loading = false;
        });

        $scope.urlToLink = function(url) {
            return '/' + encodeURIComponent(encodeURIComponent(url));
        };
}])

.controller('ValidationController', [
    '$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams) {
        var url = $routeParams.wildcard;
        document.title = 'Validating ' + url;
        url = decodeURIComponent(url);
        // console.log('Look up', url);


        $scope.finished = false;
        $scope.error = null;
        $scope.url = url;

        function pretty_json(obj) {
            return JSON.stringify(obj, undefined, 4);
        }

        $http({url: '/validate', method: 'GET', params: {url: url}})
        .success(function(response) {
            console.log(response);
            $scope.schema = pretty_json(response.schema);
            $scope.schema_url = response.schema_url;
            $scope.response = pretty_json(response.response); // yuck!

            if (response.schema_error) {
                $scope.schema_error = response.schema_error;
            } else if (response.validation_error) {
                $scope.error = response.validation_error;
            }
            $scope.finished = true;
        })
        .error(function(data, status) {
            console.warn(data, status);
        });

}])

;
