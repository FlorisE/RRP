"use strict";
const SingleStreamOutputOperation = require("./SingleStreamOutputOperation");
const uuid = require('node-uuid');

class TimestampOperation extends SingleStreamOutputOperation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */) {
        super(id, source, destination, program);
        this.name = "timestamp";
    }

    static create(source/* : Stream */,
                  destination/* : Stream */,
                  program/* : Program */) {
        return new TimestampOperation(
            uuid.v4(), source, destination, program
        );
    }
}

module.exports = TimestampOperation;
