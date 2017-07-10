define(
    [
        '../models/Sensor',
        '../util/ObservableMap',
        './Module'
    ],
    function(Sensor,
             ObservableMap,
             Module) {

        class SensorModule extends Module {

            constructor(d, connectionHandler) {
                super(d, connectionHandler);
                this.sensors = new ObservableMap([]);

                this.connectionHandler.register(
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

            remove(id) {
                return this.sensors.remove(id);
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
