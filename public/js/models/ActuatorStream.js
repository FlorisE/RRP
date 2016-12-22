define([
        '../util/ObservableMap',
        './Stream'
    ],
    function(ObservableMap, Stream) {

        class ActuatorStream extends Stream {

            constructor(streamModule, id, name, x, y, program, actuator) {
                super(streamModule, id, name, x, y, program);
                this.streamClass = "actuator";
                this.addable = false;
                this.edittable = true;
                this.deletable = true;
                this.actuator = actuator;
            }

            save() {
                this.streamModule.save();
            }
        }

        return ActuatorStream;
    }
);