"use strict";
const uuid = require('node-uuid');

class Sensor {
    constructor(id/* : uuid */,
                name/* : string */,
                parameters/* : ParameterDefinition[]*/) {
        this.id = id;
        this.name = name;
        this.parameters = parameters;
    }

    static create(name/* : string */,
                  parameters/* : string */) {
        return new Sensor(uuid.v4(), name, parameters);
    }
}

module.exports = Sensor;