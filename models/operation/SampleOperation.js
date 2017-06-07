"use strict";
const OneToOneOperation = require("./OneToOneOperation");
const uuid = require('node-uuid');

class SampleOperation extends OneToOneOperation {

  constructor(id/* : uuid */,
              source/* : Stream */,
              destination/* : Stream */,
              program/* : Program */,
              rate/* : int */) {
    super(id, source, destination, program);
    this.rate = rate;
    this.name = "sample";
  }

  static create(source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */,
                rate/* : int */) {
    return new SampleOperation(
      uuid.v4(), source, destination, program, rate
    );
  }
}

module.exports = SampleOperation;
