"use strict";
const Drawable = require("./Drawable");
const uuid = require('node-uuid');

class Stream extends Drawable {
    constructor(id/* : uuid */,
                name/* : string */,
                x/* : int */,
                y/* : int */,
                program/* : Program */) {
        super(x, y);
        this.id = id;
        this.name = name;
        this.program = program;
        this.operations/* : Operation[] */ = [];
    }

    addOperation(operation/* : Operation */) {
        this.operations.add(operation);
    }

    static create(name/* : string */,
                  x/* : int */,
                  y/* : int */,
                  program/* : Program */) {
        return new Stream(
            uuid.v4(), name, x, y, program
        );
    }
}
module.exports = Stream;
