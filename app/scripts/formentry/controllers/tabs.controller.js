/*
jshint -W098, -W003, -W068, -W004, -W033, -W030, -W117, -W069
*/
(function() {
    'use strict';

    angular
        .module('app.formentry')
        .controller('tabCtrl', tabCtrl);

    tabCtrl.$inject = ['SearchDataService','$translate', 'dialogs',
        '$location', '$rootScope',  '$stateParams', '$state', '$scope',
        'FormentryService', 'OpenmrsRestService', '$timeout', 'FormsMetaData',
        '$filter'
    ];

    function tabCtrl(SearchDataService,$translate, dialogs, $location, $rootScope,
        $stateParams, $state, $scope, FormentryService, OpenmrsRestService, $timeout,
        FormsMetaData, $filter) {

        var formSchema;

        function parseDate(value) {
            return $filter('date')(value || new Date(), 'yyyy-MM-dd HH:mm:ss', '+0300');
        }

        $scope.vm = {};
        $scope.vm.model = {};
        $scope.vm.patient = $rootScope.broadcastPatient;
        $scope.vm.submitLabel = 'Save'
        $scope.vm.formlyFields;

        $scope.vm.currentTab = 0;

        $scope.vm.tabs=[
        {
            title: 'Tab 1',
            active: true,
            form: {
                options: {},
                model: $scope.vm.model,
                fields: [
                {
                    key: 'section_1',
                    type: 'section',
                    templateOptions: {
                        label: 'Tarehe'
                    },
                    data: {
                        fields: [
                        {
                            key: 'encounterDate',
                            type: 'datetimepicker',
                            defaultValue: parseDate(new Date()),
                            templateOptions: {
                                type: 'text',
                                label: 'Tarehe'
                            }
                        }
                        ]
                    }
                },
                ]
            }
        },
        ];

        // function definition
        $scope.vm.onSubmit = function() {

            if($scope.vm.form.$valid) {
                console.log('testing submit button');
                var form = {
                    name:'test',
                    encounterType:'8d5b2be0-c2cc-11de-8d13-0010c6dffd0f'
                };

                var updatedPayLoad = FormentryService.updateFormPayLoad($scope.vm.model,
                    $scope.vm.tabs, $scope.vm.patient,form);

                console.log('Updated payLoad');
                console.log(JSON.stringify(updatedPayLoad));

                if($scope.vm.submitLabel === 'Update'){
                    var obsToVoid = _.where(updatedPayLoad.obs,{voided:true});
                    console.log('Obs to Void: ', obsToVoid);

                    if(obsToVoid !== undefined){
                        _.each(obsToVoid, function(obs){
                            OpenmrsRestService.getObsResService().voidObs(obs, function(data){
                                if (data){
                                    console.log('Voided Obs uuid: ', obs.uuid);
                                }
                            });
                        })
                    }
                }
            }
        }

        $scope.vm.cancel = function(){
            console.log($state);
            var dlg = dialogs.confirm('Close Form', 'Do you want to close this form?');
            dlg.result.then(function(btn){
                $location.path($rootScope.previousState + '/' + $rootScope.previousStateParams.uuid);
            }, function(btn){
  				//$scope.vm.confirmed = 'You confirmed "No."';
            });
        }
    }
})();
