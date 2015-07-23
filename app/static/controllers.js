var app = angular.module('contribute.controllers', ['ngSanitize'])

.factory('resultHolder', function() {
    var service = {};
    var _result;
    service.store = function(result) {
        _result = result;
    };
    service.get = function() {
        return _result;
    };
    return service;
})

.controller('WhatIsThisController', ['$scope', function($scope) {

}])

.controller('SchemaController', ['$scope', function($scope) {
    document.title = 'The Schema';
    hljs.highlightBlock(document.querySelector('.content-column pre code'));

}])

.controller('ValidatorController', [
    '$scope', '$state', '$http', 'resultHolder',
    function($scope, $state, $http, resultHolder) {

        document.title = 'contribute.json';

        $scope.validation = {};
        $scope.validation.url = '';
        $scope.validation.method = 'url';

        $scope.validate = function() {
            if ($scope.validation.method === 'url') {
                if (!$scope.validation.url.trim()) return;
                var url = $scope.validation.url.trim();
                $state.go('wildcard', {url: url});
                return false;
            } else if ($scope.validation.method === 'text') {
                if (!$scope.validation.text.trim()) return;
                    $http.post('/validate', $scope.validation.text)
                    .success(function(response) {
                        resultHolder.store(response);
                        $state.go('result');
                    })
                    .error(function() {
                        console.warn(arguments);
                    });
            } else if ($scope.validation.method === 'file') {
                var input = document.querySelector('form input[type="file"]');
                if (!input.files.length) return;
                var reader = new FileReader();
                reader.onload = function(content) {
                    $http.post('/validate', content.target.result)
                    .success(function(response) {
                        // console.log('RESPONSE', response);
                        resultHolder.store(response);
                        $state.go('result');
                    })
                    .error(function() {
                        console.warn(arguments);
                    });
                }
                reader.readAsText(input.files[0]);
            }
        };

        $scope.changeValidationMethod = function(method) {
            $scope.validation.method = method;
        };
}])

.controller('ExamplesController', [
    '$scope', '$http',
    function($scope, $http) {
        $scope.loading = true;
        document.title = 'Examples of contribute.json';
        $scope.projects = [];

        $http.get('/examples.json')
        .success(function(response) {
            $scope.urls = response.urls;
            $scope.urls.forEach(function(url) {
                $http.get('/load-example?url=' + encodeURIComponent(url))
                .success(function(response) {
                    if (response.project) {
                        $scope.projects.push(response.project);
                    } else {
                        console.warn('Failed to get a project for', url);
                    }
                });
            });
        })
        .error(function(data, status) {
            console.error(data, status);
        })
        .finally(function() {
            $scope.loading = false;
        });

}])

.controller('ValidationController', [
    '$scope', '$http', '$stateParams', '$state', 'resultHolder',
    function($scope, $http, $stateParams, $state, resultHolder) {
        var url = $stateParams.url;
        if (url) {
            document.title = 'Validating ' + url;
            url = decodeURIComponent(url);
        } else {
            document.title = 'Validation result';
        }
        $scope.finished = false;
        $scope.error = null;
        $scope.url = url;
        $scope.horribly_wrong = false;

        function pretty_json(obj) {
            return JSON.stringify(obj, undefined, 4);
        }

        function findUrls(struct) {
            var urls = [];
            for (var key in struct) {
                if (struct.hasOwnProperty(key)) {
                    var value = struct[key];
                    if (typeof value === 'object') {
                        urls.push.apply(urls, findUrls(value));
                    } else if (
                        (value.substr(0, 7) === 'http://' || value.substr(0, 8) === 'https://')
                        && value.indexOf(' ') === -1
                    ) {
                        if (urls.indexOf(value) === -1) {
                            urls.push(value);
                        }
                    }
                }
            }
            return urls;
        }

        function escapeRegExp(string){
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }

        function showResult(response) {
            // console.log(response);
            $scope.urls_to_check = [];
            $scope.schema = pretty_json(response.schema);
            $scope.schema_url = response.schema_url;
            if (!response.request_error) {
                $scope.response = pretty_json(response.response);  // yuck!
            } else {
                $scope.response = response.response;
            }

            if (response.schema_error) {
                $scope.schema_error = response.schema_error;
            } else if (response.validation_error) {
                $scope.error = response.validation_error;
            } else if (response.request_error) {
                $scope.request_error = response.request_error;
            } else {
                var urls = findUrls(response.response);
                $scope.urls_to_check = urls;
                urls.forEach(function(url) {
                    $http.post('/validateurl', {url: url})
                    .success(function(response) {
                        var reg = new RegExp('"' + escapeRegExp(url) + '"', 'g');
                        var tmpl;
                        if (response.status_code === 200 || response.status_code === 302) {
                            // console.log('Valid URL:', response.url);
                            tmpl = '"<a href="' + url + '">' + url + '</a>"';
                        } else {
                            console.warn('Invalid URL:', response.url, response.status_code);
                            tmpl = '"<a href="' + url + '" class="invalid-url" ' +
                                   'title="Error code: ' + response.status_code + '">' +
                                    url + '</a>"';
                        }
                        $scope.response = $scope.response.replace(
                            reg,
                            tmpl
                        );

                    }).error(function() {
                        console.error(arguments);
                    }).finally(function() {
                        var index = $scope.urls_to_check.indexOf(url);
                        if (index > -1) {
                            $scope.urls_to_check.splice(index, 1);
                        }
                    });
                });
            }
            $scope.finished = true;
        }

        if (resultHolder.get()) {
            showResult(resultHolder.get());
        } else if (url) {
            $http({url: '/validate', method: 'POST', params: {url: url}})
            .success(showResult)
            .error(function(data, status) {
                $scope.horribly_wrong = true;
                $scope.finished = true;
                console.warn(data, status);
            });
        } else {
            $state.go('validator');
        }


}])

;
