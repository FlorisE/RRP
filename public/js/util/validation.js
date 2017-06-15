define(["knockout"], function (ko) {
  "use strict";

  ko.validation.init({
    grouping: {
      deep: true,
      live: true,
      observable: true
    }
  });

  ko.validation.rules['minArrayLength'] = {
    validator: function (obj, params) {
      return obj.length >= params.minLength;
    },
    message: "Array does not meet minimum length requirements"
  };

  ko.validation.registerExtenders();
});