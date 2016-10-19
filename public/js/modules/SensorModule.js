define(
    [
        '../models/Sensor',
        '../util/ObservableMap',
        '../util/ConnectionHandler',
        './Module'
    ],
    function(Sensor,
             ObservableMap,
             ConnectionHandler,
             Module) {

        class SensorModule extends Module {

            constructor(d) {
                super(d);
                this.sensors = new ObservableMap([]);

                ConnectionHandler.register(
                    "sensor", "add",
                    (entry) => this.add(
                        entry.id, entry.name, entry.parameters
                    )
                );
            }

            get(id) {
                return this.sensors.get(id);
            }

            getAll() {
                return this.sensors.values();
            }

            add(id, name, parameters) {
                var sensor = new Sensor(id, name, parameters);
                this.sensors.set(id, sensor);
                return sensor;
            }

            update(id, sensor) {
                this.sensors.set(id, sensor);
            }

            delete(id) {
                return this.sensors.delete(id);
            }

            clear() {
                this.sensors.clear();
            }

            register(observer) {
                this.sensors.register(observer);
            }
        }

        return SensorModule;
    }
);