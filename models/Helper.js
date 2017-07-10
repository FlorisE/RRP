"use strict";
const uuid = require('node-uuid');

class Helper {
  constructor(id/* : uuid */,
              name/* : string */,
              parameterName/* : string */,
              body/* : string */) {
    this.id = id;
    this.name = name;
    this.parameterName = parameterName;
    this.body = body;
  }

  static create(name/* : string */,
                parameterName/* : string */,
                body/* : string */) {
    return new Helper(uuid.v4(), name, parameterName, body);
  }
}

module.exports = Helper;
