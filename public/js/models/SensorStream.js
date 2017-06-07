define(
  [
    '../util/ObservableMap',
    './ParameterizedStream'
  ],
  function (ObservableMap, ParameterizedStream) {

    class SensorStream extends ParameterizedStream {

      constructor(streamModule, id, name, x, y, program, sensor, parameters = []) {
        super(streamModule, id, name, x, y, program, parameters);

        this.sensor = sensor;

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
            this.x(),
            this.y(),
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
                } else {
                  msg.value = parameter.value();
                }
                return msg;
              }
            ),
            () => $('#insert-sensor').modal('hide')
          );
        }
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
    }

    return SensorStream
  }
);