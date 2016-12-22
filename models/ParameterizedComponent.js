"use strict";
class ParameterizedComponent {
    constructor(id/* : uuid */,
                name/* : string */,
                parameterDefinitions/* : ParameterDefinition[] */) {
        this.id = id;
        this.name = name;
        this.parameterDefinitions = parameterDefinitions;
    }
}

module.exports = ParameterizedComponent;
