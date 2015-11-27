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
            var wrappedLocations = [];
            for (var i = 0; i < locations.length; i++) {
                wrappedLocations.push(wrapLocation(locations[i]));
            }
            return wrappedLocations;
        }

        function wrapLocation(location) {
            return LocationModel.toWrapper(location);
        }
      //function to return name of locations
      var nameLists=[]; 
      function nameLocations(locations) {
        for (var i = 0; i < locations.length; i++) {
               var a= locations[i].name(); 
               var b= {"name"  : a,"value" : a}
               nameLists.push(b);  
           }
       }
        //doesnt work
        //locFactory.setLocations(nameLists); 
    }
    //use a factory to set the locations
    function locFactory(){
        this.locationList=[
                     {
                       "name"  : "Amani Hospital",
                       "value" : "Amani Hospital"
                       }
                     ];
       
       //this.setLocations: function(data){
         //        this.locationList = data;
        //}

        function allLocations(){   
            return this.locationList;
            } 
        return{
               getLocations: allLocations
        }
    } 

    app.run(function (formlyConfig,locFactory){
            formlyConfig.setType({
             name          : 'openmrsLocationSelect2',
             extends       : 'select',
             defaultOptions: {
              templateOptions:{
                label:"Default Locations",
                options: locFactory.getLocations()
                }
             }
        });
    });
})();
