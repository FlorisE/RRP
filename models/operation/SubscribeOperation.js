"use strict";
const Operation = require("./Operation");
const uuid = require("node-uuid");

class SubscribeOperation extends Operation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : ActuatorStream */,
                program/* : Program */) {
        super(id, source, program);
        this.destination = destination;
        this.name = "subscribe";
    }

    static create(source/* : Stream */,
                  destination/* : ActuatorStream */,
                  program/* : Program */) {
        return new SubscribeOperation(uuid.v4(), source, destination, program);
    }
}

module.exports = SubscribeOperation;
