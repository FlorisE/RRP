define(
    [
        '../util/ObservableArray',
        './Module'
    ],
    function(ObservableArray,
             Module) {

        class AvailableOperationsModule /*extends Module*/ {

            constructor(d, connectionHandler) {
                //super(d);
                var self = this;
                this.availableOperations = new ObservableArray([]);

                connectionHandler.register(
                    "operations", "add",
                    function (entry) {
                        entry.operations.forEach(self.push.bind(self))
                    }
                );
            }

            find(callback, thisArg) {
                return this.availableOperations.find(callback, thisArg);
            }

            push(element) {
                this.availableOperations.push(element);
            }

            clear() {
                this.availableOperations.clear();
            }

            register(observer) {
                this.availableOperations.register(observer);
            }
        }

        return AvailableOperationsModule;
    }
);
