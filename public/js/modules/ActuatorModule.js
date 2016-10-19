define(
    [
        '../models/Actuator',
        '../util/ObservableMap',
        '../util/ConnectionHandler',
        './Module'
    ],
    function(Actuator,
             ObservableMap,
             ConnectionHandler,
             Module) {

        class ActuatorModule extends Module {

            constructor(d) {
                super(d);
                this.actuators = new ObservableMap([]);

                ConnectionHandler.register(
                    "actuator", "add",
                    (entry) => this.add(
                        entry.id, entry.name, entry.parameters
                    )
                );
            }

            get(id) {
                return this.actuators.get(id);
            }

            getAll() {
                return this.actuators.values();
            }

            add(id, name, parameters) {
                var actuator = new Actuator(id, name, parameters);
                this.actuators.set(id, actuator);
                return actuator;
            }

            update(id, actuator) {
                this.actuators.set(id, actuator);
            }

            delete(id) {
                return this.actuators.delete(id);
            }

            clear() {
                this.actuators.clear();
            }

            register(observer) {
                this.actuators.register(observer);
            }
        }

        return ActuatorModule;
    }
);