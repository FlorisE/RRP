"use strict";
const HelperBodyOperation = require("./HelperBodyOperation");
const uuid = require('node-uuid');

class MapOperation extends HelperBodyOperation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */) {
        super(id, source, destination, program);
        this.name = "map";
    }

    static create(source/* : Stream */,
                  destination/* : Stream */,
                  program/* : Program */) {
        return new MapOperation(uuid.v4(), source, destination, program);
    }

}

module.exports = MapOperation;
