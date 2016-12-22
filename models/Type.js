"use strict";
class Type {
    constructor(id/* : uuid */,
                name/* : string */,
                in_multiplicity/* : Enum */) {
        this.id = id;
        this.name = name;
        this.in_multiplicity = in_multiplicity;
    }
}

module.exports = Type;
