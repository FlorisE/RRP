"use strict";
const OneToOneOperation = require("./OneToOneOperation");
const uuid = require('node-uuid');

class ForgetAfterOperation extends OneToOneOperation {

  constructor(id/* : uuid */,
              source/* : Stream */,
              destination/* : Stream */,
              program/* : Program */,
              rate/* : int */) {
    super(id, source, destination, program);
    this.rate = rate;
    this.name = "forgetAfter";
  }

  static create(source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */,
                rate/* : int */) {
    return new ForgetAfterOperation(
      uuid.v4(), source, destination, program, rate
    );
  }
}

module.exports = ForgetAfterOperation;
