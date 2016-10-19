define([
        '../util/ObservableMap',
        './Stream'
    ],
    function(ObservableMap, Stream) {

        class ActuatorStream extends Stream {

            constructor(streamModule, id, name, x, y, program) {
                super(streamModule, id, name, x, y, program);
                this.streamClass = "actuator";
                this.addable = false;
                this.edittable = true;
                this.deletable = true;

            }

            save() {
                this.streamModule.save();
            }
        }

        return ActuatorStream;
    }
);