"use strict";
const OneToOneOperation = require("./OneToOneOperation");
const uuid = require("node-uuid");

class SubscribeOperation extends OneToOneOperation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : ActuatorStream */,
                program/* : Program */) {
        super(id, source, destination, program);
        this.name = "subscribe";
    }

    static create(source/* : Stream */,
                  destination/* : ActuatorStream */,
                  program/* : Program */) {
        return new SubscribeOperation(uuid.v4(), source, destination, program);
    }
}

module.exports = SubscribeOperation;
