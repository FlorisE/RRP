define(
    [],
    function () {
        class ObservableMap extends Map {

            constructor(map) {
                super();
                this.observers = [];
                // manually copy the values of the map
                // after observer list has been initialized
                for (let [key, value] of map) {
                    this.set(key, value);
                }
            }

            clear() {
                super.clear();
                this.observers.forEach(function (observer) {
                    if (observer["cleared"]) {
                        observer["cleared"](this);
                    }
                });
            }

            delete(key) {
                var returnValue = super.delete(key);
                this.observers.forEach(function (observer) {
                    if (observer["deleted"]) {
                        observer["deleted"](this, key);
                    }
                });
                return returnValue;
            }

            set(key, value) {
                super.set(key, value);
                this.observers.forEach(function (observer) {
                    if (observer["setted"]) {
                        observer["setted"](this, key, value);
                    }
                });
                return this;
            }

            register(observer) {
                this.observers.push(observer);
            }

            copy() {
                var copy = new ObservableMap(this);
                return copy;
            }
        }

        return ObservableMap;
    }
);