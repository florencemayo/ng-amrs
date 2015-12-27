/*jshint -W003, -W098, -W033 */
(function () {
	'use strict';

	/**
	 * @ngdoc function
	 * @name ngAmrsApp.controller:MainCtrl
	 * @description
	 * # MainCtrl
	 * Controller of the ngAmrsApp
	 */
	var app = angular
		.module('app.clinicDashboard')
		.controller('ClinicDashboardCtrl', ClinicDashboardCtrl)
		.factory('locFactory',locFactory);
	ClinicDashboardCtrl.$nject = ['$rootScope', '$scope','$stateParams', 'OpenmrsRestService', 'LocationModel'];

	function ClinicDashboardCtrl($rootScope, $scope, locFactory, $stateParams, OpenmrsRestService, LocationModel) {

		var locationService = OpenmrsRestService.getLocationResService();

		$scope.selectedLocation = {selected:undefined};

		$scope.locations = [];
		
		$scope.isBusy = false;
		
		$scope.onLocationSelection = onLocationSelection;
		
		$scope.locationSelectionEnabled = true;
		
		$scope.switchTabByIndex = switchTabByIndex;

		activate();
		

		function activate() {
			fetchLocations();
		}
		
		function switchTabByIndex(index){
			//console.log("Switched to tab:" + index);
			$scope.activeTabId = index;
		}
		
		function onLocationSelection($event) {
			$scope.locationSelectionEnabled = false;
		}

		function fetchLocations() {
			$scope.isBusy = true;
			locationService.getLocations(onGetLocationsSuccess, onGetLocationsError, false);
		}


		function onGetLocationsSuccess(locations) {
			$scope.isBusy = false;
			$scope.locations = wrapLocations(locations);
		}

		function onGetLocationsError(error) {
      		$scope.isBusy = false;
		}

    function wrapLocations(locations) {
            var wrappedLocations = []; var nameLists=[];
            for (var i = 0; i < locations.length; i++) {
                wrappedLocations.push(wrapLocation(locations[i]));
                 
                 var b = locations[i].name;
                 var a = "{" + 
                      "name  :"  +  b + "," + 
                      "value :"  +  b +
                      "}" ;
                 
                 nameLists.push(a);
            }
            console.log("aa"+nameLists);
            locFactory.locationList=nameLists;
            return wrappedLocations;
        }

        function wrapLocation(location) {
            return LocationModel.toWrapper(location);
        }
      
    }
    //use a factory to set the locations
    function locFactory(){
      var locationList;

      console.log(" locationList"+locationList);
      function allLocations(){   
           return locationList;
      } 
      return{
             getLocs: allLocations
      }
    } 

    app.run(function (formlyConfig,locFactory){
            formlyConfig.setType({
             name          : 'openmrsLocationSelect2',
             extends       : 'select',
             defaultOptions: {
              templateOptions:{
                label:"Default Locations",
                options: locFactory.getLocs()
                }
             }
        });
    });
})();
