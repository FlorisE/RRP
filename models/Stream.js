"use strict";
const Drawable = require("./Drawable");
const uuid = require('node-uuid');

class Stream extends Drawable {
    constructor(id/* : uuid */,
                name/* : string */,
                x/* : int */,
                y/* : int */,
                program/* : Program */,
                inStreams/* Stream[] */) {
        super(x, y);
        this.id = id;
        this.name = name;
        this.program = program;
        this.operations/* : Operation[] */ = [];
        this.inStreams = inStreams;
    }

    addOperation(operation/* : Operation */) {
        this.operations.add(operation);
    }

    static create(name/* : string */,
                  x/* : int */,
                  y/* : int */,
                  program/* : Program */,
                  inStreams/* : Stream[] */) {
        return new Stream(
            uuid.v4(), name, x, y, program, inStreams
        );
    }
}
module.exports = Stream;
