/*
 jshint -W003, -W098, -W117, -W109
 */
(function() {
  'use strict';

  angular
    .module('app.schemaEditor')
    .controller('SyncAppController', ASyncCtrl);

  SyncAppController.$inject = ['$rootScope', 'OpenmrsRestService', '$scope', '$log', 'filterFilter', '$state'];

  function ASyncCtrl ($scope, $http, $timeout) {

    // Load with $http
    $scope.mySchema = $http.get('../scripts/schema-editor/formschema/schema.json');

    // Values can be a promise from anywhere
    $scope.myStartVal = $http.get('../scripts/schema-editor/formschema/startval.json');

    $scope.onSubmit = function () {
        console.log('onSubmit data in async controller', $scope.editor.getValue());
    };

}

  function SyncCtrl($scope){

     $scope.mySchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                title: 'Item Name',
                required: true,
                minLength: 1
            },
            age: {
                type: 'integer',
                title: 'Age',
                required: true,
                min: 0
            }
        }
    };

    $scope.myStartVal = {
        age: 20
    };

    $scope.onChange = function (data) {
        console.log('Form changed!');
        console.dir(data);
    };


  }

  function PatientSearchCtrl($rootScope, OpenmrsRestService, $scope, $log, filterFilter, $state) {
    $scope.filter = "";
    $scope.patients = [];
    $scope.isBusy = false;
    // pagination controls
    $scope.currentPage = 1;
    $scope.entryLimit = 10; // items per page
    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

    $scope.$watch('searchString', function (searchString) {
      $scope.patients = [];
      if (searchString && searchString.length > 2) {
        $scope.isBusy = true;
        OpenmrsRestService.getPatientService().getPatientQuery({q:searchString},
          function(data) {
            $scope.isBusy = false;
            $scope.patients = data;
            $scope.totalItems = $scope.patients.length;
            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
            $scope.currentPage = 1;
          }
        );
      }
    });

    $scope.loadPatient = function (patientUuid){
      /*
       Get the selected patient and save the details in the root scope
       so that we don't do another round trip to get the patient details
       */
      $rootScope.broadcastPatient = _.find($scope.patients, function(patient){
        if(patient.uuid() === patientUuid)
        {return patient;}
      });
      $state.go('patient', {uuid:patientUuid});
    };

    $scope.pageChanged = function() {
      $log.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.items = [];
    // create empty search model (object) to trigger $watch on update
    $scope.search = {};
    $scope.resetFilters = function () {
      // needs to be a function or it won't trigger a $watch
      $scope.search = {};
    };
  }
})();
