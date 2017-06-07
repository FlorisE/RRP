define(
  [
    '../util/ObservableMap',
    './Stream'
  ],
  function (ObservableMap, Stream) {

    class ParameterizedStream extends Stream {

      constructor(streamModule, id, name, x, y, program, parameters = []) {
        super(streamModule, id, name, x, y, program);

        this.parameters = ko.observableArray(parameters);
        this.modalParameters = ko.computed(function () {
          var parameters = this.parameters();
          return parameters.map(this.mapParameter);
        }, this);
      }

      modal() {

        return this;
      }

      mapParameter(parameter) {
        if (parameter.type == "list") {
          if (parameter.value == null) {
            parameter.value = [];
          }
          var returnParam = {
            id: parameter.id,
            name: parameter.name,
            type: parameter.type,
            value: ko.observableArray(
              parameter.value.map(function (value) {
                return {
                  value: ko.observable(value)
                }
              })
            )
          };
          returnParam.currentItem = ko.observable();
          returnParam.appendItem = function (item) {
            returnParam.value.push(
              {value: ko.observable(item.currentItem())}
            );
            item.currentItem("");
          };
          returnParam.removeListItem = function (item) {
            returnParam.value.remove(item);
          };
          returnParam.enterKeyPressed = function (parameter, event) {
            if (event.keyCode == 13) {
              returnParam.appendItem(parameter);
              return false;
            }
          };

          // disable enter for submission
          $(window).keydown(function (event) {
            if (event.target.id == "field-" + parameter.name &&
                event.keyCode == 13) {
              event.preventDefault();
              return false;
            }
          });
          return returnParam;
        } else if (parameter.type == "string") {
          return {
            type: parameter.type,
            id: parameter.id,
            name: parameter.name,
            value: ko.observable(parameter.value)
          };
        } else if (parameter.type == "integer") {
          return {
            type: parameter.type,
            id: parameter.id,
            name: parameter.name,
            value: ko.observable(parameter.value)
          };
        } else if (parameter.type == "select") {
          return {
            type: parameter.type,
            id: parameter.id,
            name: parameter.name,
            value: ko.observable(parameter.value),
            options: ko.observableArray(parameter.options)
          }
        }
      }
    }

    return ParameterizedStream
  }
);