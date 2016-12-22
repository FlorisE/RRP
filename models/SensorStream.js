"use strict";
const uuid = require('node-uuid');
const Stream = require("./Stream");

class SensorStream extends Stream {
    constructor(id/* : uuid */,
                name/* : string */,
                x/* : int */,
                y/* : int */,
                program/* : Program */,
                sensor/* : Sensor */,
                parameters/* : Parameter[] */) {
        super(id, name, x, y, program);

        this.sensor = sensor;
        this.parameters = parameters;
    }

    static create(name/* : string */,
                              x/* : int */,
                              y/* : int */,
                              program/* : Program */,
                              sensor/* : Sensor */,
                              parameters/* : Parameter[] */) {
        return new SensorStream(
            uuid.v4(), name, x, y, program, sensor, parameters
        );
    }
}

module.exports = SensorStream;
