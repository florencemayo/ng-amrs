/*
jshint -W003, -W026, -W098
*/
(function() {
  'use strict';

  angular
        .module('app.openmrsRestServices')
        .factory('UserResService', UserResService);

  UserResService.$inject = ['$resource', 'OpenmrsSettings', 'UserModel', '$rootScope'];

  function UserResService($resource, settings, UserModel, $rootScope) {
    var service = {
      getUser: getUser,
      user: ''
    };

    return service;

    function getResource() {
    // avoid spaces in this string
     var v = 'custom:(uuid,username,systemId,roles:(uuid,name,privileges),person:(uuid,preferredName))';
     var r = $resource(settings.getCurrentRestUrlBase().trim() + 'user/:uuid',
       {uuid: '@uuid', v: v},
       {query: {method: 'GET', isArray: false}}
     );
     return r;
   }

    function getUser(params,callback) {
      var UserRes = getResource();
      //console.log(params);
      UserRes.query(params, false,
        function(data) {
          var result = data.results;
          if (result.length>0)
          {
            //user(userName_, personUuId_, password_, uuId_, systemId_, userRole_)
            service.user = new UserModel.user(result[0].username, result[0].person.uuid,'' ,result[0].uuid, result[0].systemId, result[0].roles);
            //service.user = result;
            //broadcasting user to other controllers
            $rootScope.$broadcast('loggedUser');
            callback(service.user);
          }
          });

    }

    function getRoles(argument) {
      // body...
      var UserRes = getResource();
    }
  }
})()
;
