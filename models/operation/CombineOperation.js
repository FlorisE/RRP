"use strict";
const ManyToOneHelperBodyOperation = require("./ManyToOneHelperBodyOperation");
const uuid = require('node-uuid');

class CombineOperation extends ManyToOneHelperBodyOperation {

  constructor(id/* : uuid */,
              sources/* : Stream[] */,
              destination/* : Stream */,
              program/* : Program */,
              x/* : Int */,
              y/* : Int */) {
    super(id, sources, destination, program, x, y);
    this.name = "combine";
  }

  static create(sources/* : Stream[] */,
                destination/* : Stream */,
                program/* : Program */,
                x/* : Int */,
                y/* : Int */) {
    return new CombineOperation(
      uuid.v4(), sources, destination, program, x, y
    );
  }

}

module.exports = CombineOperation;
