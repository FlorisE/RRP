"use strict";
const uuid = require('node-uuid');
const ParameterizedComponent = require("./ParameterizedComponent");

class Actuator extends ParameterizedComponent {
    constructor(id/* : uuid */,
                name/* : string */,
                parameterDefinitions/* : ParameterDefinition[] */) {
        super(id, name, parameterDefinitions);
    }

    static create(name/* : string */,
                  parameterDefinitions/* : ParameterDefinition[] */) {
        return new Actuator(uuid.v4(), name, parameterDefinitions);
    }
}
module.exports = Actuator;
