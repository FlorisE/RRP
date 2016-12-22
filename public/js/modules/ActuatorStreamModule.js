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
                super(d);
                var self = this;

                connectionHandler.register(
                    "actuatorStream", "add", this.handleAdd.bind(this)
                );

                connectionHandler.register(
                    "actuatorStream", "update", this.handleUpdate.bind(this)
                );
            }

            handleAdd(entry) {
                return this.addActuatorStream(
                    entry.id,
                    entry.name,
                    entry.x,
                    entry.y,
                    this.programModule.get(entry.programId),
                    this.actuatorModule.get(entry.actuatorId)
                )
            }

            handleUpdate(entry) {
                let stream = this.get(entry.id);

                stream.name(entry.name);
                stream.x(entry.x);
                stream.y(entry.y);
                stream.program = this.programModule.get(entry.programId);
                stream.actuator = this.actuatorModule.get(entry.actuatorId);
            }

            addActuatorStream(id, name, x, y, program, actuator) {
                var stream = new ActuatorStream(
                    this, id, name, x, y, program, actuator
                );
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
