define(
  [
    '../models/SensorStream',
    '../util/ObservableMap',
    '../util/FullExtend',
    './Module'
  ],
  function (SensorStream,
            ObservableMap,
            fullExtend,
            Module) {

    class SensorStreamModule extends Module {

      constructor(d, connectionHandler) {
        super(d, connectionHandler);
        var self = this;

        this.connectionHandler.register("sensorStream", "add",
          function (entry) {
            return self.addSensorStream(
              entry.id,
              entry.name,
              entry.x,
              entry.y,
              d.programModule.get(entry.programId),
              d.sensorModule.get(entry.sensorId),
              entry.parameters.filter((parameter) => parameter.id)
            )
          }
        );

        this.connectionHandler.register("sensorStream", "update",
          function (entry) {
            return self.processUpdateSensorStream(
              entry.id,
              entry.name,
              entry.x,
              entry.y,
              d.programModule.get(entry.programId),
              d.sensorModule.get(entry.sensorId),
              entry.parameters.filter((parameter) => parameter.id)
            )
          }
        );
      }

      create(name, x, y, programId, sensorId, parameters, callback) {
        this.connectionHandler.emit(
          {
            type: "sensorStream",
            action: "add",
            name: name,
            programId: programId,
            sensorId: sensorId,
            parameters: parameters,
            x: x,
            y: y
          },
          callback
        );
      }

      processUpdateSensorStream(id, name, x, y, program, sensor, parameters) {
        var sensorStream = this.get(id);

        sensorStream.name(name);
        sensorStream.x(x);
        sensorStream.y(y);
        sensorStream.program = program;
        sensorStream.sensor = sensor;
        sensorStream.parameters.removeAll();

        parameters.forEach(
          (parameter) => sensorStream.parameters.push(parameter)
        );
      }

      updateSensorStream(id, name, programId, x, y, parameters, callback) {
        this.connectionHandler.emit(
          {
            type: "sensorStream",
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

      addSensorStream(id, name, x, y, program, sensor, parameters) {
        var stream = new SensorStream(
          this, id, name, x, y, program, sensor, parameters
        );
        return this.d.streamModule.add(id, stream);
      }

      save() {
        console.log("save in sensor stream");
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

    return SensorStreamModule;
  }
);
