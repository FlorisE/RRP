"use strict";
const uuid = require('node-uuid');
const Stream = require("./Stream");

class ActuatorStream extends Stream {
    constructor(id/* : uuid */,
                name/* : string */,
                x/* : int */,
                y/* : int */,
                program/* : Program */,
                actuator/* : Actuator */,
                parameters/* : Parameter[] */) {
        super(id, name, x, y, program);

        this.actuator = actuator;
        this.parameters = parameters;
    }

    static create(name/* : string */,
                  x/* : int */,
                  y/* : int */,
                  program/* : Program */,
                  actuator/* : Actuator */,
                  parameters/* : Parameter[] */) {
        return new ActuatorStream(uuid.v4(), name, x, y, program, actuator, parameters);
    }
}

module.exports = ActuatorStream;
