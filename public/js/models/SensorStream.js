define(
  [
    '../util/ObservableMap',
    './Stream',
    'wu'
  ],
  function (ObservableMap, Stream, wu) {

    class SensorStream extends Stream {

      constructor(streamModule, id, name, x, y, program, sensor, parameters = []) {
        super(streamModule, id, name, x, y, program);

        this.sensor = sensor;
        this.parameters = ko.observableArray(parameters);
        this.modalParameters = ko.computed(function () {
          var parameters = this.parameters();
          return parameters.map(this.transform);
        }, this);

        this.knockoutInstance = null;
        this.streamClass = "sensor";
        this.addable = true;
        this.edittable = true;
        this.deletable = true;

        if (this.id()) {
          this.action = "Edit stream sensor";
        } else {
          this.action = "Add stream sensor";
        }
      }

      save() {
        if (this.id()) {
          this.streamModule.updateSensorStream(
            this.id(),
            this.name(),
            this.program.id(),
            this.modalParameters().map(
              function (parameter) {
                var msg = {
                  type: parameter.type,
                  name: parameter.name,
                  id: parameter.id
                };

                if (parameter.type == "list") {
                  msg.value = parameter.value().map(
                    (value) => value.value()
                  )
                }
                return msg;
              }
            ),
            () => $('#insert-sensor').modal('hide')
          );
        }
      }

      modal() {
        // disable enter for submission
        $(window).keydown(function (event) {
          if (event.keyCode == 13) {
            event.preventDefault();
            return false;
          }
        });

        return this;
      }

      copy() {
        return new SensorStream(
          this.streamModule,
          this.id(),
          this.name(),
          this.x(),
          this.y(),
          this.program,
          this.sensor,
          this.parameters()
        );
      }

      transform(parameter) {
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
          return returnParam;
        } else if (parameter.type == "string") {
          return parameter;
        }
      }
    }

    return SensorStream
  }
);