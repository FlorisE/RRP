define([
    '../util/ObservableMap',
    './ParameterizedStream'
  ],
  function (ObservableMap, ParameterizedStream) {

    class ActuatorStream extends ParameterizedStream {

      constructor(streamModule, id, name, x, y, program, actuator, parameters = []) {
        super(streamModule, id, name, x, y, program, parameters);

        this.actuator = actuator;

        this.knockoutInstance = null;
        this.streamClass = "actuator";
        this.addable = false;
        this.edittable = true;
        this.deletable = true;

        if (this.id()) {
          this.action = "Edit stream actuator";
        } else {
          this.action = "Add stream actuator";
        }
      }

      save() {
        if (this.id()) {
          this.streamModule.updateActuatorStream(
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
            () => $('#insert-actuator').modal('hide')
          );
        }
      }

      copy() {
        return new ActuatorStream(
          this.streamModule,
          this.id(),
          this.name(),
          this.x(),
          this.y(),
          this.program,
          this.actuator,
          this.parameters()
        );
      }
    }

    return ActuatorStream;
  }
);