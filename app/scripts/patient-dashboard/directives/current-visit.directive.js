/*
jshint -W003, -W026
*/
(function() {
    'use strict';

    angular
        .module('app.patientdashboard')
            .directive('currentVisit', directive);

    function directive() {
      return {
        restrict: 'E',
        scope: { patientUuid: "@" },
        templateUrl: 'views/patient-dashboard/current-visit.html',
        controller: currentVisitController
      }
    }

    currentVisitController.$inject = [
        '$scope',
        '$rootScope',
        'VisitResService',
        '$stateParams',
        'EncounterResService',
        'EncounterModel',
        '$filter',
        '$timeout',
        '$location',
        'dialogs'
    ];

    function currentVisitController($scope, $rootScope, vService, $stateParams,
                                    encService, encModel, $filter, $timeout,
                                    $location, dialogs) {
        $scope.currentVisit = initializeCurrentVisit();
        $scope.busy = true;
        $scope.visitTypesLoaded = false;
        $scope.formsFilledStatus = [{
                name: 'AMPATH Triage Encounter Form 1.0',
                shortName: 'triage',
                encounterType:'a44ad5e2-b3ec-42e7-8cfa-8ba3dbcf5ed7',
                filled: false
            }, {
                name: 'AMPATH Adult Return Encounter Form',
                shortName: 'form1',
                encounterType: '8d5b2be0-c2cc-11de-8d13-0010c6dffd0f',
                filled: false
            }, {
                name: 'AMPATH Pediatric Return Encounter Form',
                shortName: 'form2',
                encounterType: '8d5b3108-c2cc-11de-8d13-0010c6dffd0f',
                filled: false
            }, {
                name: 'AMPATH PMTCT Postnatal Care Encounter Form',
                shortName: 'form3',
                encounterType: 'b1e9ed0f-5222-4d47-98f7-5678b8a21ebd',
                filled: false
            }
        ];
        
        $scope.startNewVisit = function() {
             $scope.currentVisit.startDatetime = new Date();
             //Create visit
             var newVisit = {
                 patient: $scope.patientUuid,
                 visitType: $scope.currentVisit.visitType,
                 startDatetime: getFormattedDate($scope.currentVisit.startDatetime)
             };

             vService.saveVisit(newVisit, function(data) {
                 $scope.currentVisit.uuid = data.uuid;
                 $scope.visitStarted = true;
                 console.info('New visit instance created');
             });
         };

         $scope.loadEncounterForm = function(EncounterModel) {
           $rootScope.activeEncounter = EncounterModel;
           $location.path('/encounter/' + EncounterModel.uuid() + '/patient/' +
             EncounterModel.patientUuid());
         }
         
         $scope.cancelVisit = function(visit) {
             var promise = dialogs.confirm('Warning', 'Canceling a visit ' +
                            'deletes all encounters associated with it');
             promise.result.then(function yes(){
                 //void the visit.
                 var payload = {
                     'uuid': visit.uuid,
                     'voided': true
                 };
                 vService.saveVisit(payload, function success(response){
                     //Update state
                     $scope.visitStarted = false;
                     $scope.currentVisit = initializeCurrentVisit()
                     clearFormFilledStatus();
                     
                     //Void encounters
                     if(angular.isDefined(visit.encounters)) {
                         _.each(visit.encounters, function(encounter) {
                             encService.voidEncounter(encounter.uuid());
                         });
                     }
                 });
             });
         } 
         
         $scope.endVisit = function(visit) {
             var promise = dialogs.confirm('Confirm', 'Are you sure?');
             promise.result.then(function yes(){
                 $scope.currentVisit.stopDatetime = Date.now();
                 var payload = {
                     uuid: visit.uuid,
                     stopDatetime: getFormattedDate($scope.currentVisit.stopDatetime)
                 };
                 
                 vService.saveVisit(payload, function(data) {
                     $scope.currentVisit.ended = true;
                 }, function(error) {
                     $scope.currentVisit.stopDatetime = undefined;
                 });
             });
         }
         
         $timeout(function checkIfVisitStarted() {
             console.info('Checking whether visit has started');
              var simpleVisitRep = 'custom:(uuid,patient:(uuid,uuid),' +
                      'visitType:(uuid,name),location:ref,startDatetime,' +
                      'stopDatetime)';
              var params = {
                  patientUuid: $scope.patientUuid,
                  v: simpleVisitRep
              }
              vService.getPatientVisits(params, function(visits) {
                  //Get todays
                  var dFormat = 'yyyy-MM-dd';
                  var today = getFormattedDate(Date.now(), dFormat);
                  var todayVisits = [];
                  function formatted(gDate) {
                      return getFormattedDate(new Date(gDate), dFormat);
                  }
                  _.each(visits, function(visit) {
                     if(today === formatted(visit.startDatetime)) {
                         todayVisits.push(visit);
                     } 
                  });
                  
                  if(todayVisits.length > 0) {
                      console.info('Patient with uuid ', $scope.patientUuid,
                        ' has visit started');
                      var visit = todayVisits[0];
                      $scope.currentVisit.uuid = visit.uuid;
                      $scope.currentVisit.startDatetime = visit.startDatetime;
                      $scope.visitStarted = true;
                      if(Date.parse(visit.stopDatetime) !== null) {
                          $scope.currentVisit.stopDatetime = visit.stopDatetime;
                          $scope.currentVisit.ended = true;
                      }
                      
                      //Load associated encounters
                      fetchVisitCompletedEncounters($scope.currentVisit.uuid);
                  } else {
                      console.info('No visit started yet');
                      $scope.visitStarted = false;
                  }
                  $scope.busy = false;
              }, function(error) {
                  console.error('Error: An error occured while loading visits ',
                              'patient with uuid ', $scope.patientUuid);
              });
          },1000);

          $timeout(function loadVisitTypes() {
              vService.getVisitTypes(function(data) {
                  $scope.visitTypes = data;
                  $scope.visitTypesLoaded = true;
              });
          },1000);

         // Function to load saved encounters if visit started
         function fetchVisitCompletedEncounters(visitUuid) {
             $scope.busy = true;
             vService.getVisitEncounters(visitUuid, function(visitEncounters) {
                 if(visitEncounters.length > 0) {
                     $scope.currentVisit.hasCompletedEncounters = true;
                     $scope.currentVisit.encounters = 
                        encModel.toArrayOfModels(visitEncounters);
                        
                     _.each(visitEncounters, function(encounter) {
                          var i = _.findIndex($scope.formsFilledStatus, function(entry) {
                             return entry.encounterType === encounter.encounterType.uuid;
                         });
                         if(i !== -1) {
                             $scope.formsFilledStatus[i].filled = true;
                             return true;
                        }
                     });
                }
                $scope.busy = false;
             });
         }
         
         //Format date
         function getFormattedDate(date, format) {
             if(angular.isUndefined(format)) {
                 format = 'yyyy-MM-dd HH:mm:ss';
             }
             if(typeof date === 'string') {
                 date = new Date(date);
             }
             return $filter('date')(date, format, '+0300');
         }
         
         function clearFormFilledStatus() {
             _.each($scope.formsFilledStatus, function(entry) {
                 entry.filled = false;
             });
         }
         
         function initializeCurrentVisit() {
             return {
                 ended: false,
                 hasCompletedEncounters: false
             };
         }
    }
})();
