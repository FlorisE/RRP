"use strict";
const uuid = require('node-uuid');

class Sensor {
    constructor(id/* : uuid */,
                name/* : string */) {
        this.id = id;
        this.name = name;
    }

    static create(name/* : string */) {
        return new Sensor(uuid.v4(), name);
    }
}

module.exports = Sensor;