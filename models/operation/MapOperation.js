"use strict";
const OneToOneHelperBodyOperation = require("./OneToOneHelperBodyOperation");
const uuid = require('node-uuid');

class MapOperation extends OneToOneHelperBodyOperation {

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
