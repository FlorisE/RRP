define(
  [
    '../models/ActuatorStream',
    '../util/ObservableMap',
    '../util/FullExtend',
    './Module'
  ],
  function (ActuatorStream,
            ObservableMap,
            fullExtend,
            Module) {

    class ActuatorStreamModule extends Module {

      constructor(d, connectionHandler) {
        super(d, connectionHandler);
        var self = this;

        this.connectionHandler.register(
          "actuatorStream",
          "add",
          function (entry) {
            return self.addActuatorStream(
              entry.id,
              entry.name,
              entry.x,
              entry.y,
              d.programModule.get(entry.programId),
              d.actuatorModule.get(entry.actuatorId),
              entry.parameters.filter((parameter) => parameter.id)
            )
          }
        );

        this.connectionHandler.register(
          "actuatorStream",
          "update",
          function (entry) {
            return self.processUpdateActuatorStream(
              entry.id,
              entry.name,
              entry.x,
              entry.y,
              d.programModule.get(entry.programId),
              d.actuatorModule.get(entry.actuatorId),
              entry.parameters.filter((parameter) => parameter.id)
            )
          }
        );
      }

      handleAdd(entry) {
        return this.addActuatorStream(
          entry.id,
          entry.name,
          entry.x,
          entry.y,
          this.programModule.get(entry.programId),
          this.actuatorModule.get(entry.actuatorId),
          entry.parameters.filter((parameter) => parameter.id)
        )
      }

      handleUpdate(entry) {
        let stream = this.get(entry.id);

        stream.name(entry.name);
        stream.x(entry.x);
        stream.y(entry.y);
        stream.program = this.programModule.get(entry.programId);
        stream.actuator = this.actuatorModule.get(entry.actuatorId);
        stream.parameters = entry.parameters;
      }

      addActuatorStream(id, name, x, y, program, actuator, parameters) {
        var stream = new ActuatorStream(
          this, id, name, x, y, program, actuator, parameters
        );

        return this.add(id, stream);
      }

      processUpdateActuatorStream(id, name, x, y, program, actuator, parameters) {
        var actuatorStream = this.get(id);

        actuatorStream.name(name);
        actuatorStream.x(x);
        actuatorStream.y(y);
        actuatorStream.program = program;
        actuatorStream.actuator = actuator;
        actuatorStream.parameters.removeAll();

        parameters.forEach(
          (parameter) => actuatorStream.parameters.push(parameter)
        );
      }

      updateActuatorStream(id, name, programId, x, y, parameters, callback) {
        this.connectionHandler.emit(
          {
            type: "actuatorStream",
            action: "update",
            id: id,
            name: name,
            x: x,
            y: y,
            parameters: parameters,
            programId: programId
          },
          callback
        );
      }

      save() {
        console.log("save in actuator stream");
      }

      get(id) {
        return this.d.streamModule.get(id);
      }

      getAll() {
        return this.d.streamModule.getAll();
      }

      add(id, stream) {
        this.d.streamModule.add(id, stream);
      }

      update(id, stream) {
        this.d.streamModule.update(id, stream);
      }

      remove(id) {
        this.d.streamModule.remove(id);
      }

      clear() {
        this.d.streamModule.clear();
      }

      register(observer) {
        this.d.streamModule.register(observer);
      }
    }

    return ActuatorStreamModule;
  }
);
