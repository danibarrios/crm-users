angular.module('userService', [])

	.factory('User', function($http) {
		var userFactory = {};
		//get all the users
		userFactory.all = function(){
			return $http.get('/v1/api/users');
		};

		//get an specific user
		userFactory.get = function(id){
			return $http.get('/v1/api/users/' + id);
		};

		//create a new user
		userFactory.create = function(userData){
			return $http.post('/v1/api/users', userData);
		};

		//update a user
		userFactory.update = function(id, userData){
			return $http.put('/v1/api/users/' + id, userData);
		};

		//delete a user
		userFactory.delete = function(id){
			return $http.delete('/v1/api/users' + id);
		};

		//return our entire factory object
		return userFactory;
	});