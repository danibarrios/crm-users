angular.module('userApp', [
	'ngAnimate',
	'app.routes',
	'mainCtrl',
	'userCtrl',
	'authService',
	'userService'
])

	.config(function($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	});