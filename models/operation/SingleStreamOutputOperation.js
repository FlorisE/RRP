"use strict";
const Operation = require("./Operation");

class SingleStreamOutputOperation extends Operation {

    constructor(id/* : uuid */,
                source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */) {
        super(id, source, program);
        this.destination = destination;
    }

}

module.exports = SingleStreamOutputOperation;
