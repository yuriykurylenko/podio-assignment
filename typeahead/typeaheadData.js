'use strict';

var typeahead = typeahead || angular.module('typeahead', []);

// The data provider for typeahead component. Invokes the callback, when data
// is retrieved from the server and converted by the parser, which name is specified
// as the parameter for the get() method.
// $injector is used to handle injection of the parser. Now we use parser, called "podio",
// which is defined in app/service/parser/podio.js, and specified in "data-parser"
// HTML attribute, but we can handle different formats of server-side data in the way
// of implementing custom parsers as Angular services.
typeahead.service('typeaheadData', ['$http', '$injector', function($http, $injector) {
    return {
        get: function(url, parserName, callback) {
            try {
                $injector.invoke([parserName, function(parser) {
                    if (_.isFunction(parser.parse)) {
                        $http(
                            { method: 'GET', url: url }
                        ).success(function(data) {
                            callback( parser.parse(data) );
                        }).error(function(html, statusCode) {
                            throw new Error(url + ' responded with status code ' + statusCode);
                        });
                    }
                }]);
            } catch(e) {
                throw new Error('No service with the name "' + parserName + '" found in your module scope!');
            }
        }
    };
}]);