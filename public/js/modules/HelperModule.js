define(
    [
        './Module',
        '../models/Helper',
        '../util/ObservableMap',
        '../util/ConnectionHandler'
    ],
    function(Module,
             Helper,
             ObservableMap,
             ConnectionHandler) {

        class HelperModule extends Module {

            constructor(d) {
                super(d);
                this.helpers = new ObservableMap([]);

                ConnectionHandler.register(
                    "helper", "add",
                    (entry) => this.add(
                        entry.id, entry.name, entry.parameters
                    )
                );
            }

            get(id) {
                return this.helpers.get(id);
            }

            getAll() {
                return this.helpers.values();
            }

            add(id, name, body) {
                var helper = new Helper(id, name, body);
                this.helpers.set(id, helper);
                return helper;
            }

            update(id, helper) {
                this.helpers.set(id, helper);
            }

            delete(id) {
                return this.helpers.delete(id);
            }

            clear() {
                this.helpers.clear();
            }

            register(observer) {
                this.helpers.register(observer);
            }
        }

        return HelperModule;

    }
);