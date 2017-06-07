"use strict";
const uuid = require('node-uuid');
const Operation = require('./Operation');

class OneToOneOperation extends Operation {

  constructor(id/* : uuid */,
              source/* : Stream */,
              destination/* : Stream */,
              program/* : Program */) {
    super(id, program);
    this.source = source;
    this.destination = destination;
  }

  static create(source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */) {
    return new OneToOneOperation(uuid.v4(), source, destination, program);
  }

  update(newValues) {
    if (newValues.name && newValues.name != this.destination.name) {
      this.destination.name = newValues.name;
    }
  }

  save(dao, helper, callback) {
    if (helper) {
      dao.saveHelper(this, callback);
    } else {
      dao.saveBody(this, callback);
    }
  }

  mapForTransmission() {

  }
}

module.exports = OneToOneOperation;
