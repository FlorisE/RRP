"use strict";
const ManyToOneOperation = require("./ManyToOneOperation");
const uuid = require('node-uuid');

class MergeOperation extends ManyToOneOperation {

  constructor(id/* : uuid */,
              sources/* : Stream[] */,
              destination/* : Stream */,
              program/* : Program */,
              x/* : Int */,
              y/* : Int */) {
    super(id, sources, destination, program, x, y);
    this.name = "merge";
  }

  static create(sources/* : Stream[] */,
                destination/* : Stream */,
                program/* : Program */,
                x/* : Int */,
                y/* : Int */) {
    return new MergeOperation(
      uuid.v4(), sources, destination, program, x, y
    );
  }

  hasHelper() {
    return false;
  }

  hasBody() {
    return false;
  }

  save(dao, helper, callback) {
    dao.saveRegular(this, callback);
  }

}

module.exports = MergeOperation;
