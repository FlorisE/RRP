"use strict";
const OneToOneHelperBodyOperation = require("./OneToOneHelperBodyOperation");
const uuid = require('node-uuid');

class FilterOperation extends OneToOneHelperBodyOperation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */) {
        super(id, source, destination, program);
        this.name = "filter";
    }

    static create(source/* : Stream */,
                  destination/* : Stream */,
                  program/* : Program */) {
        return new FilterOperation(uuid.v4(), source, destination, program);
    }

}

module.exports = FilterOperation;
