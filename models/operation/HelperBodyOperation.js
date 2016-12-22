"use strict";
const SingleStreamOutputOperation = require("./SingleStreamOutputOperation");
const uuid = require('node-uuid');

class HelperBodyOperation extends SingleStreamOutputOperation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */) {
        super(id, source, destination, program);
    }

    addBody(body /* : string */) {
        this.body = body;
        return this;
    }

    addHelper(helper /* : Helper */) {
        this.helper = helper;
        return this;
    }

    static create(source/* : Stream */,
                  destination/* : Stream */,
                  program/* : Program */) {
        return new HelperBodyOperation(uuid.v4(), source, destination, program);
    }
}

module.exports = HelperBodyOperation;
