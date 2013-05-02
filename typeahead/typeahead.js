'use strict';

var typeahead = typeahead || angular.module('typeahead', []);

// Custom directive that contains logic of the UI component.
// Can be configured in declarative manner in HTML:
//   <typeahead data-url="json/podio.json" data-parser="podio" />,
// where "data-url" specifies data source url for this component,
// and "data-parser" contains the name of the service to be used
// for converting data from the source to component-compatible format
typeahead.directive('typeahead', ['typeaheadData', function(typeaheadData) {
    return {
        // Restricts this directive to an element name style - <typeahead></typeahead>
        restrict: 'E',

        // Scope variables to be read from "data-url" and "data-parser" HTML attributes
        scope: {
            url: '@url',
            parserName: '@parser'
        },
        templateUrl: 'typeahead/template.html',

        // Function responsible for linking component to DOM,
        // the directive presentation logic described here
        link: function(scope, element, attrs) {

            /* Private variables and methods */
            var needed = true,
                filterEl = element.find('input.filter'),
                listEl = element.find('ul.nav-list');

            // Fetching data, when user interacts with the component for the first time
            function fetchDataIfNeeded() {
                if (needed) {
                    typeaheadData.get(scope.url, scope.parserName, function(items) {
                        scope.items = items;
                        needed = false;
                    });
                }
            }

            // Moving through the list, when <up> or <down> key pressed
            // direction = "prev" (for <up> pressed) || "next" (for <down>)
            function moveTo(direction) {
                filterEl.blur();

                var activeEl = listEl.find('li.active');
                if (!activeEl.length) {
                    scope.activate( listEl.find('li:' + (direction == 'next' ? 'first' : 'last')) );
                } else {
                    var elToActivate = activeEl[direction]();
                    scope.activate( elToActivate.length ? elToActivate : filterEl );
                }
            }

            // Opening a link in case of enter pressed
            function openLinkIfPossible() {
                var linkHref = listEl.find('li.active a').attr('href');
                if (linkHref) {
                    window.open(linkHref);
                }
            }

            // Keyboard navigation handler
            function keyNavigate(e) {
                switch (e.keyCode) {
                    // Up
                    case 38: moveTo('prev'); break;
                    // Down
                    case 40: moveTo('next'); break;
                    // Enter
                    case 13: openLinkIfPossible(); break;
                }
            }

            // Binding events triggered by user
            function bindEvents() {
                filterEl.bind('focus', fetchDataIfNeeded);
                angular.element(document).bind('keydown', keyNavigate);
            }


            /* Scope methods */

            // Inserting a thumbnail in case if its link specified
            scope.insertThumbnailImageIfExists = function(item) {
                angular.element('#item' + item.id + ' .thumb').html(
                    item.thumbnail_link ? '<img src="' + item.thumbnail_link + '" />' : '&nbsp;'
                );
            };

            // Highlighting the matches of a search criteria
            scope.highlightMatches = function(item, match) {
                var name = item.name,
                    match = scope.filter,
                    highlightedName = name;

                if (_.isString(match)) {
                    var pos = name.toLowerCase().indexOf(match.toLowerCase());

                     if (pos > -1) {
                        highlightedName = [
                            name.slice(0, pos), '<span class="hl">',
                            name.slice(pos, pos + match.length), '</span>',
                            name.slice(pos + match.length)
                        ].join('');
                    }
                }

                angular.element('#item' + item.id + ' .item-link').html(highlightedName);
            };

            // Handling different types of input:
            // 1) element from the list;
            // 2) filter text input element;
            // 3) id of the element from the list (in case if invoked via "ng-click").
            scope.activate = function(el) {
                if (_.isString(el) || _.isNumber(el)) {
                    el = listEl.find('#item' + el);
                }

                listEl.find('li.active').removeClass('active');

                if (_.isEqual(el, filterEl)) {
                    el.focus();
                } else {
                    el.addClass('active');
                }
            };

            // Determining, if we're looking at a first-level or a second-level element
            scope.getItemClass = function(item) {
                return !item.level ? 'nav-header custom-header' : '';
            };

            // Showing list if its not empty, else hiding
            scope.toShowList = function() {
                // !!listEl - short way to convert number to boolean
                return !!listEl.find('li').length;
            };

            // Initializing component
            bindEvents();
        }
    }
}]);