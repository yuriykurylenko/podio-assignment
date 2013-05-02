'use strict';

var typeahead = typeahead || angular.module('typeahead', []);

// Custom filter that is invoked every time the search criteria changes in UI.
// Returns the items with attribute "name", matching the criteria,
// and the items A, that have the relation to B, those who match,
// through criteria "A.id = B.parentId".
typeahead.filter('typeaheadMatch', function() {
    // pattern parameter has the structure of { name: "<name>" },
    // that is configured in template.html
    return function(items, pattern) {
        var filteredItems = [],
            patternName = (pattern &&_.isString(pattern.name)) ? pattern.name : '';

        // Determines if the item name matches the input criteria
        function matchesDirectly(item) {
            return item.name.toLowerCase().indexOf(patternName.toLowerCase()) > -1;
        }

        if (!_.isEmpty(items) && _.isString(patternName)) {
            _.each(items, function(item) {
                if ( matchesDirectly(item) ) {
                    filteredItems.push(item);
                } else if ( item.level == 0 ) {

                    // Looking for children of the current item, that match the input criteria
                    var matchedChildren = _.filter(
                        _.where(items, { parentId: item.id }),
                        function(childItem) {
                            return matchesDirectly(childItem);
                        }
                    );

                    if (matchedChildren.length) {
                         filteredItems.push(item);
                    }
                }
            })
        }

        return filteredItems;
    }
});