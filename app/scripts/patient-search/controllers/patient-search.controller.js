
/*
Controller associated with an element in the DOM
*/
(function() {
  'use strict';

// add module and controller's constructor function
  angular
  .module('app.patientsearch')
  .controller('PatientSearchCtrl', PatientSearchCtrl);

  /*
  // $inject property annotation and an array of service names to inject
  // must match with the order of parameters in controller's constructor function
  // for minifying code purpose (inject right services if they get renamed)
  */
  PatientSearchCtrl.$inject = ['$rootScope', 'OpenmrsRestService', '$scope',
  '$log', 'filterFilter', '$state','PatientSearchService'];

  /*
  // controller's constructor function
  // also assign the initial value of properties of scope
  */
  function PatientSearchCtrl($rootScope, OpenmrsRestService, $scope, $log, filterFilter, $state, PatientSearchService) {

    $scope.filter = '';
    $scope.patients = PatientSearchService.getPatients();
    $scope.isBusy = false;

    // pagination controls, items per page, and number of page calculation
    $scope.currentPage = 1;
    $scope.entryLimit = 10;
    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

    // call getSearchString in service PatientSearchService
    $scope.searchString = PatientSearchService.getSearchString();

    // $watch API used to propagate model values to the DOM
    $scope.$watch('searchString', function(searchString) {
      $scope.patients = PatientSearchService.getPatients();
      // get patient query when input search string > 2
      if (searchString && searchString.length > 2) {
        $scope.isBusy = true;
        OpenmrsRestService.getPatientService().getPatientQuery({q:searchString}, function(data) {
          $scope.isBusy = false;
          $scope.patients = data;
          PatientSearchService.resetPatients();
          PatientSearchService.setPatients(data);
          PatientSearchService.setSearchString (searchString);
          // set number of retrieved items, number of pages, and current page
          $scope.totalItems = $scope.patients.length;
          $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
          $scope.currentPage = 1;
        });
      }
    });

    $scope.loadPatient = function(patientUuid) {
      /*
       Get the selected patient and save the details in the root scope
       so that we don't do another round trip to get the patient details
       */
       $rootScope.broadcastPatient = _.find($scope.patients, function(patient) {
        if (patient.uuid() === patientUuid){
          return patient;
        }
      });

       // go to state with the patientUuid (navigate between views)
       $state.go('patient', {uuid:patientUuid});
     };

     // log page changes
     $scope.pageChanged = function() {
      $log.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.items = [];

    // create empty search model (object) to trigger $watch on update
    $scope.search = {};

    $scope.resetFilters = function() {
      // needs to be a function or it won't trigger a $watch
      $scope.search = {};
    };
  }
})();
