define(
    [
        '../models/Actuator',
        '../util/ObservableMap',
        './Module'
    ],
    function(Actuator,
             ObservableMap,
             Module) {

        class ActuatorModule extends Module {

            constructor(d, connectionHandler) {
                super(d);
                this.actuators = new ObservableMap([]);

                connectionHandler.register(
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
