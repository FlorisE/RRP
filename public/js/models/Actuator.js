define([], function() {

        class Actuator {

            constructor(id, name, parameters=[]) {
                this.id = ko.observable(id);
                this.name = ko.observable(name);
                this.parameters = ko.observableArray(parameters);
            }
        }

        return Actuator
    }
);