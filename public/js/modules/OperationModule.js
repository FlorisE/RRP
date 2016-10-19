define(
    [
        '../util/ObservableMap',
        '../util/ConnectionHandler',
        '../models/Operations/OperationFactory',
        './Module'
    ],
    function(ObservableMap,
             ConnectionHandler,
             OperationFactory,
             Module) {

        class OperationModule extends Module {

            constructor(d) {
                super(d);
                var self = this;
                this.operations = new ObservableMap([]);

                ConnectionHandler.register(
                    "operation", "add",
                    function (entry) {
                        var operation = new OperationFactory(d).create(entry.name, entry);
                        self.add(entry.id, operation);
                    }
                );
            }

            get(id) {
                return this.operations.get(id);
            }

            getAll() {
                return this.operations.values();
            }

            add(id, operation) {
                this.operations.set(id, operation);
                return operation;
            }

            update(id, operation) {
                this.operations.set(id, operation);
            }

            delete(id) {
                return this.operations.delete(id);
            }

            clear() {
                this.operations.clear();
            }

            register(observer) {
                this.operations.register(observer);
            }

            saveNew(msg, callback) {
                ConnectionHandler.emit(msg, callback);
            }

            saveUpdated(msg, callback) {
                ConnectionHandler.emit(msg, callback);
            }
        }

        return OperationModule;

    }
);