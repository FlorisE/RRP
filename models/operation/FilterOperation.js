"use strict";
const HelperBodyOperation = require("./HelperBodyOperation");
const uuid = require('node-uuid');

class FilterOperation extends HelperBodyOperation {

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
