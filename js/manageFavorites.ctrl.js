/**
 * A controller responsible for handling the management of favorite requests.
 */
clientApp.controller('ManageFavoritesCtrl', function($scope, $rootScope, $uibModal, $analytics, favorites, toaster,
		GENERAL_CONSTANTS) {
	$scope.dateFormat = GENERAL_CONSTANTS.DATE_FORMAT;
	$scope.rowCollection = favorites.get();
	$scope.displayedCollection = [].concat($scope.rowCollection);

	//Delete (permanently) the selected item.
	$scope.removeItem = function(row) {
		var index = $scope.rowCollection.indexOf(row);
		if (index > -1) {
			$scope.rowCollection.splice(index, 1);
			favorites.deleteFavorite(row.id, function() {
				toaster.success("", "The selected favorite has been deleted.");
				$scope.$apply();
			});
		}
	};

	//Apply the selected favorite.
	$scope.apply = function(id) {
		$rootScope.$broadcast('applyFavorite', id);
		$rootScope.loadTab('main');
	};

	//Export a JSON file containing the selected favorite.
	$scope.export = function(row) {
		favorites.exportFavorites([row], row.name + GENERAL_CONSTANTS.EXPORT_FILE_TYPE);
		toaster.success("", "Export Complete.");
		$analytics.eventTrack('Export Single Favorite');
	};

	//Open a modal dialog to view more details about the selected item.
	$scope.openRowModal = function(row) {
		var modalInstance = $uibModal.open({
			templateUrl: 'partials/favoritesModal.html',
			controller: 'ManageFavoritesModalInstanceCtrl',
			backdropClass: 'modalBackdrop',
			backdrop: 'static',
			resolve: {
				favorite: function() {
					return row;
				}
			}
		});

		modalInstance.result.then(function(id) {
			$scope.apply(id);
		});
	};
});


/**
 * Modal controller for displaying more details about a specific favorite.
 */
clientApp.controller('ManageFavoritesModalInstanceCtrl', function ($scope, $uibModalInstance, $analytics, favorite,
		utils, favorites, toaster, GENERAL_CONSTANTS) {
	$scope.dateFormat = GENERAL_CONSTANTS.DATE_FORMAT;
	$scope.favorite = angular.copy(favorite);

	$scope.apply = function(id) {
		$uibModalInstance.close(id);
	};

	$scope.export = function() {
		favorites.exportFavorites([favorite], favorite.name + GENERAL_CONSTANTS.EXPORT_FILE_TYPE);
		toaster.success("", "Export Complete.");
		$analytics.eventTrack('Export Single Favorite');
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.countHeaders = function(headers, auth) {
		var numHeaders = 0;
		if (!utils.isBlankObject(headers)) {
			numHeaders = Object.keys(headers).length;
		}
		if (!utils.isBlankObject(auth) && !utils.isBlankObject(auth.value)) {
			numHeaders++;
		}
		return numHeaders;
	};
});
