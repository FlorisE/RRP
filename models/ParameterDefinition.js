"use strict";
const uuid = require("node-uuid");

class ParameterDefinition {
    constructor(id/* : uuid */,
                name/* : string */,
                type/* : ParameterType */) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    static create(name/* : string */,
                  type/* : ParameterType */) {
        return new ParameterDefinition(uuid.v4(), name, type);
    }
}

module.exports = ParameterDefinition;
