/*
jshint -W106, -W098, -W003, -W068, -W004, -W033, -W030, -W117, -W116, -W069, -W026
*/
(function() {
    'use strict';

    angular
        .module('app.formentry')
        .factory('FormentryService', FormentryService);

    FormentryService.$inject = [];

    function FormentryService() {
        var service = {
            createForm: createForm,
            getPayLoad: getPayLoad,
            getConceptUuid:getConceptUuid,
            validateForm:validateForm,
            getEncounter:getEncounter
        };

        return service;

        function getEncounter(uuid, formlySchema){
          //cbce861a-790c-4b91-80e6-3d75e671a4de
          console.log('Sample data from REST API')
          console.log(uuid);
          /*
          Expected Encounter object format
          {encounterDatetime: 'date',
          encounterType:{display,uuid},
          form:{},
          location:{},
          obs:[{concept:{display,uud},uuid,value{display,uuid},groupMembers:[]}],
          patient:{uuid},
          provider:{},
          uuid:'encounter-uuid'
          */

          //Start by prefilling the encounter information
          var encData = uuid;
          var obsData = _.filter(encData.obs,function(obs){
            if(obs.groupMembers === null) return obs
          })
          var obsGroupData =  _.filter(encData.obs,function(obs){
            if(obs.groupMembers !== null) return obs
          })
          var key;

          _.each(formlySchema, function(field) {
            if(field.key.startsWith('enc_')) //using underscore.js and underscore.string.js Functions
            {
              console.log('Encounter Keys');
              console.log(field.key);
              key = field.key;
              if(key === 'enc_patient')
              {
                //update the model property
                field.model[key] = encData.patient.uuid;
              }
              else if(key === 'enc_encounterType')
              {
                //update the model property
                field.model[key] = encData.encounterType.uuid;
              }
              else if(key === 'enc_encounterDatetime')
              {
                //update the model property
                field.model[key] = encData.encounterDatetime;
              }
              else if(key === 'enc_encounterLocation')
              {
                //update the model property
                if(encData.location !== null) field.model[key] = encData.location.uuid;
              }
              else if(key === 'enc_encounterProvider')
              {
                //update the model property
                if(encData.provider !== null) field.model[key] = encData.provider.uuid;
              }
              //field.model[key] = encData.encounterDatetime;
            }
            else if(field.key.startsWith('obs_')) //using underscore.js and underscore.string.js Functions
            {
                //get obs fields without groups
                console.log('starting obs prefill');
                key = field.key;
                var val;
                var multiArr = []; //for multiselect fiellds like checkboxes
                if(field.model.obsGroupUuid === '')
                {
                  if(field.type === 'select' || field.type === 'radio')
                  {

                    val = _.find(obsData,function(obs){
                      if(obs.concept.uuid === field.model.obsConceptUuid) return obs;
                    });
                    console.log('matching obs concept id:');
                    console.log(val);
                    if (val !== undefined) field.model[key] = val.value.uuid;
                  }
                  else if(field.type === 'multiCheckbox')
                  {

                    val = _.filter(obsData,function(obs){
                      if(obs.concept.uuid === field.model.obsConceptUuid) return obs;
                    });
                    console.log('matching multiCheckbox:');
                    console.log(val);
                    if (val !== undefined) {
                      _.each(val, function(obs){
                        multiArr.push(obs.value.uuid);
                      });
                      field.model[key] = multiArr;
                    }
                  }
                  else{
                    val = _.find(obsData,function(obs){
                      if(obs.concept.uuid === field.model.obsConceptUuid) return obs;
                    });
                      console.log('matching obs concept id: and autofilled model');
                      console.log(val);
                      console.log(field.model);
                      if (val !== undefined) field.model[key] = val.value;
                      console.log(field.model);
                  }
                }
                //obs with obs group uuids
                else if(field.model.obsGroupUuid !== '')
                {
                  if(field.type === 'select' || field.type === 'radio')
                  {
                    //get the group member matching the current key
                    var groupMember;
                    _.each(obsGroupData, function(obs) {
                      groupMember = _.find(obs.groupMembers, function(item) {
                        if(obs.concept.uuid === field.model.obsGroupUuid && item.concept.uuid === field.model.obsConceptUuid) return item;
                      })
                    })
                    val = _.find(obsGroupData,function(obs){
                      if(obs.concept.uuid === field.model.obsGroupUuid) return obs;
                    });
                    console.log('matching obs concept id:');
                    console.log(val);
                    if (val !== undefined && groupMember !== undefined) field.model[key] = groupMember.value.uuid;
                  }
                  else if(field.type === 'multiCheckbox')
                  {
                    //get the group member matching the current key
                    var groupMember;
                    _.each(obsGroupData, function(obs) {
                      groupMember = _.filter(obs.groupMembers, function(item) {
                        if(obs.concept.uuid === field.model.obsGroupUuid && item.concept.uuid === field.model.obsConceptUuid) return item;
                      })
                    });

                    val = _.find(obsGroupData,function(obs){
                      if(obs.concept.uuid === field.model.obsGroupUuid) return obs;
                    });
                    console.log('matching multiCheckbox:');
                    console.log(val);
                    if (val !== undefined && groupMember !== undefined) {
                      _.each(groupMember, function(obs){
                        multiArr.push(obs.value.uuid);
                      });
                      field.model[key] = multiArr;
                    }
                  }
                  else{
                    //get the group member matching the current key
                    var groupMember;
                    _.each(obsGroupData, function(obs) {
                      groupMember = _.find(obs.groupMembers, function(item) {
                        if(obs.concept.uuid === field.model.obsGroupUuid && item.concept.uuid === field.model.obsConceptUuid) return item;
                      })
                    });

                    val = _.find(obsGroupData,function(obs){
                      if(obs.concept.uuid === field.model.obsGroupUuid) return obs;
                    });
                      console.log('matching obs concept id: and autofilled model');
                      console.log(val);
                      console.log(field.model);
                      if (val !== undefined && groupMember !== undefined) field.model[key] = groupMember.value;
                      console.log(field.model);
                  }
                }
            }


          });
          console.log('obs group data')
          console.log(obsGroupData);

        }

        function validateForm(schema)
        {
          _.each(schema, function(field) {
            // body...
            if(field.model.obsConceptUuid === '')
            {
              return field.templateOptions.label + 'Missing Concept uuid';
            }
            else {
              return '';
            }
          })
        }

        function getConceptUuid()
        {

        }

        function getPayLoad(schema)
        {
          var payLoad = {};
          //generate encounter section of the payload
          _.each(schema, function(field){
            var val= field.model.encounter;
            //console.log('encounter log');
            //console.log(val);
            //console.log(field.model.encounter + '  ' + field.model[val] );
            if(field.model.encounter === 'enc_patient' && field.model[val] !== undefined)
            {
              //add property to the payload
              payLoad.patient = field.model[val];
            }
            else if(field.model.encounter === 'enc_encounterType' && field.model[val] !== undefined)
            {
              //add property to the payload
              payLoad.encounterType = field.model[val];
            }
            else if(field.model.encounter === 'enc_encounterDatetime' && field.model[val] !== undefined)
            {
              //add property to the payload
              payLoad.encounterDatetime = field.model[val];
            }
            else if(field.model.encounter === 'enc_encounterLocation' && field.model[val] !== undefined)
            {
              //add property to the payload
              payLoad.location = field.model[val];
            }
            else if(field.model.encounter === 'enc_encounterProvider' && field.model[val] !== undefined)
            {
              //add property to the payload
              payLoad.provider = field.model[val];
            }
          })


          //generate obs payload section
          var obs=[];
          // for loop using underscore js
          _.each(schema, function(field, index){
            var val = 'obs_' + field.model.obsConceptUuid;
            //console.log('logging val: ' + val);
            if(val !== 'obs_undefined') // all only obs with some data to be posted
            {
              //console.log(field.model.obsConceptUuid + '  ' + field.model[val] );
              /*
              Add all obs without obs groups
              */
              if((field.model[val] !== undefined) && (field.type !== 'multiCheckbox') && (field.model.obsGroupUuid === '') )
              {
                //add property to obs
                obs.push({concept:field.model.obsConceptUuid, value:field.model[val]});

              }
              else if((field.model[val] !== undefined) && (field.type === 'multiCheckbox') && (field.model.obsGroupUuid === '') )
              {
                //add property to obs
                var items = [];
                items = field.model[val];
                 //console.log(items);
                for (var l = 0; l < items.length; l++)
                {
                  obs.push({concept:field.model.obsConceptUuid, value:items[l]});
                }
              }
            }
          })

          /*
          Get an array of all obs group available in the schema and
          create an obs group with group members of items having the same obs group uuid
          the assumption here is that we will not have have more than one group sharing
          the same obs group uuid
          in case we have more than one group sharing the same obs group uuid then all
          this members will be grouped in same group
          */
          var obsGroupArr = {}; //dictionary object to store obs group uuids
          _.each(schema, function(field, i){
            //console.log('Pringting Obs Array');
            //console.log(field.model.obsGroupUuid + ' ' + i);
            /*
            we will only add obs groups that have some data
            */

            var val = 'obs_' + field.model.obsConceptUuid;
            if(val !== 'obs_undefined') // allow only obs with some data to be posted
            {
              if(field.model[val] !== undefined)
              {
                if((field.model.obsGroupUuid !== '') && (field.model.obsGroupUuid !== undefined))
                {
                  obsGroupArr[field.model.obsGroupUuid] = field.model.obsGroupUuid;
                }
              }
            }
          })

          /*
          Build obs group array list for each unique obsGroupUuid
          */
          _.each(obsGroupArr,function(key,i){
            //console.log('logging keys in the dictionary ' + key);
            //filter all fields related to the current obs group uuid
            var obsGroupFields = _.filter(schema,function(field){
              if(field.model.obsGroupUuid === key)
              {
                return field;
              }
            });
            //console.log('obsGroupFields...');
            //console.log(obsGroupFields);
            var groupMembers = [];

            _.each(obsGroupFields, function(field){
              /*
              obss group
              "obs": {
              "concept": "uuid-of-grouping-concept",
              "groupMembers": [...]

              }
              */
              var val = 'obs_' + field.model.obsConceptUuid;
              if((field.model[val] !== undefined) && (field.type !== 'multiCheckbox'))
              {
                //add property to obs
                groupMembers.push({concept:field.model.obsConceptUuid, value:field.model[val]});

              }
              else if((field.model[val] !== undefined) && (field.type === 'multiCheckbox'))
              {
                //add property to obs
                var items = [];
                items = field.model[val];
                 //console.log(items);
                for (var l = 0; l < items.length; l++)
                {
                  groupMembers.push({concept:field.model.obsConceptUuid, value:items[l]});
                }
              }

            });

            //add group items to the obs Array
            obs.push({concept:key, groupMembers:groupMembers});

          });


          //add obs to payload
          payLoad.obs = obs;
          console.log('Pringting payload');
          console.log(JSON.stringify(payLoad));
          return JSON.stringify(payLoad);
        }





        function createForm(schema) {
          var validatorsArray = {};
          validatorsArray['ipAddress'] = {
            expression: function(viewValue, modelValue) {
              var value = modelValue || viewValue;
              //return !value || /(\d{1,3}\.){3}\d{1,3}/.test(value);
              if (value>100) return false;
            },
            message: '$viewValue + " is above normal acceptable range!"'
          };
          var formSchema=[];
          var field ={};

          //add encounter details
          var encounterFields = _.filter(schema, function(obj) {
            //console.log(obj);
            if (obj['encounter']) return obj;
          });
          console.log('encounterFields');
          //console.log(encounterFields);
          //console.log(schema);

          _.each (encounterFields[0]['encounter'], function(encField) {
            //console.log(encField)
            if(encField.type === 'datepicker')
            {
              field = {
                key: 'enc_' + encField.idName,
                type: 'input',
                model: {encounter:'enc_' + encField.idName},
                templateOptions: {
                  type: 'text',
                  label: encField.labelName,
                  placeholder: encField.labelName
                }
              }
            }
            else if(encField.type === 'text')
            {
              field = {
                key: 'enc_' + encField.idName,
                type: 'input',
                model: {encounter:'enc_' + encField.idName},
                templateOptions: {
                  type: 'text',
                  label: encField.labelName,
                  placeholder: encField.labelName
                }
              }
            }
            else {
              field = {
                key: 'enc_' + encField.idName,
                type: encField.type,
                model: {encounter:'enc_' + encField.idName},
                templateOptions: {
                  type: 'text',
                  label: encField.labelName,
                  placeholder: encField.labelName,
                  options:[]
                }
              }
            }

            formSchema.push(field);
          });


          //add obs details
          var obsFields = _.filter(schema, function(obj) {
            //console.log(obj);
            if (obj['obs']) return obj;
          });

          _.each(obsFields[0]['obs'], function(obs_Field) {
            console.log(obs_Field)
            var obsField ={};
            if ((obs_Field.type === 'text') || (obs_Field.type === 'number'))
            {
              obsField = {
                key: 'obs_' + obs_Field.obsConceptUuid,
                type: 'input',
                model: {obsConceptUuid:obs_Field.obsConceptUuid,
                  obsGroupUuid:obs_Field.obsConceptGroupUuid,
                  answerValue:''},
                templateOptions: {
                  type: obs_Field.type,
                  label: obs_Field.label,
                  required:true
                },
        validators: {
          //ipAddress: validatorsArray['ipAddress']
        }

              }

            }
            else if ((obs_Field.type === 'radio') || (obs_Field.type === 'select') || (obs_Field.type === 'multiCheckbox'))
            {
              var opts= [];
              //get the radio/select options/multicheckbox
              for(var l = 0; l<obs_Field.obsAnswerConceptUuids.length; l++)
              {
                 var item={
                   name:obs_Field.obsAnswerLabels[l],
                   value:obs_Field.obsAnswerConceptUuids[l]
                   };
                 opts.push(item);
              }

              obsField = {
                key: 'obs_' + obs_Field.obsConceptUuid,
                type: obs_Field.type,
                model: {obsConceptUuid:obs_Field.obsConceptUuid,
                  obsGroupUuid:obs_Field.obsConceptGroupUuid,
                  answerValue:''},
                templateOptions: {
                  type: obs_Field.type,
                  label: obs_Field.label,
                  options:opts
                }
              }

            }

            formSchema.push(obsField);

          });

          console.log('sample form');
          console.log(formSchema);

          return formSchema;

        }

    }
})();