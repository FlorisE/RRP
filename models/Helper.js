"use strict";
const uuid = require('node-uuid');

class Helper {
    constructor(id/* : uuid */,
                name/* : string */,
                body/* : string */) {
        this.id = id;
        this.name = name;
        this.body = body;
    }

    static create(name/* : string */,
                        body/* : string */) {
        return new Helper(uuid.v4(), name, body);
    }
}
module.exports = Helper;
