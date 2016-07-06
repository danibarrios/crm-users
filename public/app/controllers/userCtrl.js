angular.module('userCtrl', [])

	.controller('userController', function(user) {
		var vm = this;

		vm.processing = true;

		user.all()
			.then(function(data) {
				vm.processing = false;

				vm.users = data;
			});
	})