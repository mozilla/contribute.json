angular.module('contribute', [
    'ngRoute',
    'contribute.controllers'
])

.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
    .when('/examples', {
        templateUrl: '/partials/examples.html',
        controller: 'ExamplesController'
    })
    .when('/:wildcard', {
        templateUrl: '/partials/validation.html',
        controller: 'ValidationController'
    })
    .when('/', {
        templateUrl: '/partials/form.html',
        controller:'FormController'
    })
    ;
}])

;
