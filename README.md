##Solution structure

We have a typeahead component implemented, that consists of 3 parts:
* typeahead - Angular directive that represents the presentation logic of component
* typeaheadData - Angular service that works as a data provider for the directive
* typeaheadMatch - Angular filter that is responsible for filtering data according to user input

Also we use a parser implemented on applicaion level, called "podio" that converts data from external format to internal, understood by the component.

##Suggestion

I would suggest to move the logic behind the parser and the filter to the server-side, so that we can access filtered data, compatible with the component, by url

```
  /typeahead/?filter=<filter_string>
```

This will work better if we deal with big amounts of data and have enough scalable backend.
