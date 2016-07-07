angular.module('userCtrl', [])

	.controller('userController', function(User) {
		var vm = this;

		vm.processing = true;

		User.all()
			.success(function(data) {
				vm.processing = false;

				vm.users = data;
			});
	})