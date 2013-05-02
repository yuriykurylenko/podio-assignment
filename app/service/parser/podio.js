'use strict';

var podioApp = podioApp || angular.module('Podio', ['typeahead']);

/////////////////////////////////////////////////////////////////////////////////////
// Parsing service used for converting data from external format
// coming from the server-side, to the format, understood by the typeahead component.
//
// The input JSON looks like this:
// [{
//      "id": <organization_id>,
//      "name": <organization_name>,
//      "image": {
//          ...
//          "thumbnail_link": <organization_thumbnail_link>
//      },
//      "url": <organization_link_url>
//      "spaces": [{
//          "id': <space_id>,
//          "name": <space_name>,
//          "org_id": <parent_organization_id>,
//          "url": <space_link_url>
//      }, {
//          ...
//      },
//          ...
//      ]
// }, { ... }, ... ],
//
// and is converted to:
// [{
//      "id": <organization_or_space_id>,
//      "name": <organization_or_space_name>,
//      "url": <organization_or_space_link_url>,
//      "level": <level_in_the_typeahead_list>,           // is_organisation ? 0 : 1
//      "thumbnail_link": <organization_thumbnail_link>,  // (only for organisations!)
//      "parentId": <parent_organization_id>,             // (only for spaces)
// }, { ... }, ... ]
//
// Uses some Underscore magic, not the fastest way to do those things, but definitely
// the shortest way to code that converting...
//
// On the other hand, I simply love functional programming! And Underscore :)
/////////////////////////////////////////////////////////////////////////////////////
podioApp.service('podio', function() {
    return {
        parse: function(data) {
            return _.flatten(
               _.map(data, function(org) {
                   return _.union(
                       [ _.extend(
                           _.pick(org, 'id', 'name', 'url'),
                           { level: 0, thumbnail_link: org.image.thumbnail_link }
                       ) ],
                       _.map(org.spaces, function(space) {
                           return _.extend(
                               _.pick(space, 'id', 'name', 'url'),
                               { level: 1, parentId: org.id }
                           )
                       })
                   );
               })
            );
        }
    }
});