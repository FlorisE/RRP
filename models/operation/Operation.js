"use strict";
class Operation {
    constructor(id/* : uuid */,
                source/* : Stream */,
                program/* : Program */) {
        this.id = id;
        this.source = source;
        this.program = program;
    }
}

module.exports = Operation;
