define(
    [
        '../util/ObservableArray',
        '../util/ConnectionHandler',
        './Module'
    ],
    function(ObservableArray,
             ConnectionHandler,
             Module) {

        class AvailableOperationsModule /*extends Module*/ {

            constructor(d) {
                //super(d);
                var self = this;
                this.availableOperations = new ObservableArray([]);

                ConnectionHandler.register(
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