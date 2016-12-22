define(
    [
        '../util/ObservableMap',
        '../models/Operations/OperationFactory',
        './Module'
    ],
    function (ObservableMap,
              OperationFactory,
              Module) {

        class OperationModule extends Module {

            constructor(d, connectionHandler) {
                super(d, connectionHandler);

                let self = this;
                let repository = new OperationFactory(d);

                this.operations = new ObservableMap([]);

                this.connectionHandler.register(
                    "operation", "add",
                    function (entry) {
                        var operation = self.get(entry.id);
                        if (operation === undefined) {
                            operation = repository.create(
                                entry.name, entry
                            );
                            self.add(entry.id, operation);
                        } else {
                            operation.addSource(entry.source[0])
                        }
                    }
                );

                this.connectionHandler.register(
                    "operation", "update",
                    (item) => {
                        let operation = this.get(item.id);
                        repository.update(
                            item.name, operation, item
                        );
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
                this.connectionHandler.emit(msg, callback);
            }

            saveUpdated(msg, callback) {
                this.connectionHandler.emit(msg, callback);
            }
        }

        return OperationModule;

    }
);
