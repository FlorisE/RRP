"use strict";
const uuid = require('node-uuid');

class Program {
    constructor(id/* : uuid */,
                name/* : string */) {
        this.id = id;
        this.name = name;
        this.streams /* : Stream[] */ = [];
    }

    addStream(stream/* : Stream */) {
        this.streams.push(stream);
    }

    static create(name/* : string */) {
        return new Program(uuid.v4(), name);
    }
}
module.exports = Program;
