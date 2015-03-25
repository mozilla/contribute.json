angular.module('contribute', [
    'ui.router',
    'contribute.controllers'
])

.config(['$stateProvider', '$locationProvider',
    function ($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    /*
     * With stateProvider there are two ways of pointing to a template using
     * the `templateUrl` option.
     * Either it's an actual HTTP GET URL like "/partials/examples.html"
     * Or it's an ID of a <script> tag that might look like this:
     * `<script type="text/ng-template" id="examples.html">`
     *
     * When to use which?
     * Having it all inline in the main index.html is good because it doesn't
     * require an additional HTTP GET just to download a tiny template.
     * However, it makes the main index.html fatter and if you suspect that
     * very few very rarely will need its content it might be best to just
     * leave it on the server and pull it in with a full AJAX URL.
     */
    $stateProvider
    .state('examples', {
        url: '/examples',
        templateUrl: 'examples.html',
        controller: 'ExamplesController'
    })
    .state('whatIsThis', {
        url: '/what-is-this',
        templateUrl: 'what-is-this.html',
        controller: 'WhatIsThisController'
    })
    .state('result', {
        url: '/result',
        templateUrl: 'validation.html',
        controller: 'ValidationController'
    })
    .state('schema', {
        url: '/schema',
        templateUrl: 'partials/schema.html',
        controller: 'SchemaController'
    })
    .state('wildcard', {
        url: '/:url',
        templateUrl: 'validation.html',
        controller: 'ValidationController'
    })
    .state('validator', {
        url: '/',
        templateUrl: 'validator.html',
        controller: 'ValidatorController'
    })
    ;
}])

.directive('numberedLines', function() {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            numberedLines: '='
        },
        template: '<table cellpadding="0" cellspacing="0"><tbody><tr>' +
                '<td><span ng-repeat="line in lineNumbers">{{ line }}</span></td>' +
                '<td><pre><div ng-repeat="line in lines track by $index" ng-bind-html="line"></div></pre></td>' +
                '</tr></tbody></table>',
        controller: function($scope) {
            $scope.$watch('numberedLines', function(value) {
                $scope.lines = $scope.numberedLines.split(/\n/g);
                $scope.lineNumbers = [];
                for (var i = 1, L = $scope.lines.length; i <= L; i++) {
                    $scope.lineNumbers.push(i);
                }
            });
        }
    };
})

;
