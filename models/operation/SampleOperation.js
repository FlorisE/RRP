"use strict";
const SingleStreamOutputOperation = require("./SingleStreamOutputOperation");
const uuid = require('node-uuid');

class SampleOperation extends SingleStreamOutputOperation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */,
                rate/* : int */) {
        super(id, source, destination, program);
        this.rate = rate;
        this.name = "sample";
    }

    static create(source/* : Stream */,
                  destination/* : Stream */,
                  program/* : Program */,
                  rate/* : int */) {
        return new SampleOperation(
            uuid.v4(), source, destination, program, rate
        );
    }
}

module.exports = SampleOperation;
