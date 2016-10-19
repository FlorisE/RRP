define(
    [
        '../util/ObservableMap',
        './Stream'
    ],
    function(ObservableMap, Stream) {

        class Sensor {

            constructor(id, name, parameters=[]) {
                this.id = ko.observable(id);
                this.name = ko.observable(name);
                this.parameters = ko.observableArray(parameters);
            }
        }

        return Sensor
    }
);