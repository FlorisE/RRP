"use strict";
const SingleStreamOutputOperation = require("./SingleStreamOutputOperation");
const uuid = require('node-uuid');

class OneToOneHelperBodyOperation extends SingleStreamOutputOperation {

  constructor(id/* : uuid */,
              source/* : Stream */,
              destination/* : Stream */,
              program/* : Program */) {
    super(id, source, destination, program);
  }

  addBody(body /* : string */) {
    this.body = body;
    return this;
  }

  addHelper(helper /* : Helper */) {
    this.helper = helper;
    return this;
  }

  static create(source/* : Stream */,
                destination/* : Stream */,
                program/* : Program */) {
    return new OneToOneHelperBodyOperation(uuid.v4(), source, destination, program);
  }

  update(dao, newValues, callback) {
    if (newValues.name && newValues.name != this.destination.name) {
      this.destination.name = newValues.name;
    }

    if (newValues.x) {
      this.x = newValues.x;
    }

    if (newValues.y) {
      this.y = newValues.y;
    }

    let mutation;

    if (this.body && newValues.helperId)  // body to helper
    {
      mutation = dao.bodyToHelper(this.id, newValues.helperId, type);
    }
    else if (this.body && newValues.body)  // body changed
    {
      mutation = dao.setBody(this.id, newValues.body);
    }
    else if (this.helper && newValues.body)  // helper to body
    {
      mutation = dao.helperToBody(this.id, newValues.body, type);
    }
    else if (this.helper && newValues.helperId)  // helper changed
    {
      mutation = dao.setHelper(this.id, newValues.helperId);
    }

    if (mutation) {
      mutation.then(
        () => this.save(dao, newValues.helper, callback)
      );
    } else {
      this.save(dao, newValues.helper, callback);
    }
  }

  save(dao, helper, callback) {
    if (helper !== null) {
      dao.saveHelper(this, callback);
    } else {
      dao.saveBody(this, callback);
    }
  }
}

module.exports = OneToOneHelperBodyOperation;
