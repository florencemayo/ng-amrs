/* global angular */
(function() {
  'use strict';
    var app = angular.module('app.formentry')
             .factory('locationsFactory', locationsFactory);
             //use a factory to set the locations
             function locationsFactory(){
                //DEFAULT SELECT OPTIONS
                var locationList = [
                                    {
                                     "name"  : "Amani Hospital",
                                      "value": "Amani Hospital"
                                    },
                                    {
                                     "name"  : "Inpatient Ward",
                                      "value": "Inpatient Ward"
                                    },
                                    {
                                     "name"  : "Isolation Ward",
                                      "value": "Isolation Ward"
                                    },
                                    {
                                     "name"  : "Laboratory",
                                      "value": "Laboratory"
                                    },
                                    {
                                     "name"  : "Outpatient Clinic",
                                     "value" : "Outpatient Clinic"
                                    },
                                    {
                                     "name"  : "Pharmacy",
                                     "value" : "Pharmacy"
                                    },
                                    {
                                     "name"  : "Registration Desk",
                                     "value" : "Registration Desk"
                                    },
                                    {
                                     "name"  : "Unknown Location",
                                     "value" : "Unknown Location"
                                    }
                                    ];
             function getLocationsList(){
                return locationList;
                }
             return{
             getLocations: getLocationsList
                 }
                }
       //call run to input a factory         
       app.run(function (formlyConfig,locationsFactory) {
            
          formlyConfig.setType({
            name: 'openmrsLocationSelect',
            extends: 'select',
            defaultOptions: {
              templateOptions:{
                label:"Default Locations",
                options: locationsFactory.getLocations()
                  }
                 }
               });
         });            
})();

