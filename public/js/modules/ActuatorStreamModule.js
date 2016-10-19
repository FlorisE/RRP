define(
  [
    '../models/ActuatorStream',
    '../util/ObservableMap',
    '../util/ConnectionHandler',
    '../util/FullExtend',
    './Module'
  ],
  function (ActuatorStream,
            ObservableMap,
            ConnectionHandler,
            fullExtend,
            Module) {

    class ActuatorStreamModule extends Module {

      constructor(d) {
        super(d);
        var self = this;

        ConnectionHandler.register("actuatorStream", "add",
          function (entry) {
            return self.addActuatorStream(
              entry.id,
              entry.name,
              entry.x,
              entry.y,
              self.programModule.get(entry.programId)
            )
          }
        );
      }

      addActuatorStream(id, name, x, y, program) {
        var stream = new ActuatorStream(this, id, name, x, y, program);
        return this.add(id, stream);
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

      delete(id) {
        this.d.streamModule.delete(id);
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
