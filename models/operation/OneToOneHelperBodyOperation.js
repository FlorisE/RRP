"use strict";
const OneToOneOperation = require("./OneToOneOperation");
const uuid = require('node-uuid');

class OneToOneHelperBodyOperation extends OneToOneOperation {

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
    super.update(newValues);

    if (newValues.x) {
      this.x = newValues.x;
    }

    if (newValues.y) {
      this.y = newValues.y;
    }

    let mutation;

    if (this.body && newValues.helperId)  // body to helper
    {
      mutation = dao.bodyToHelper(this.id, newValues.helperId, this.name);
    }
    else if (this.body && newValues.body)  // body changed
    {
      mutation = dao.setBody(this.id, newValues.body);
    }
    else if (this.helper && newValues.body)  // helper to body
    {
      mutation = dao.helperToBody(this.id, newValues.body, this.name);
    }
    else if (this.helper && newValues.helperId)  // helper changed
    {
      mutation = dao.setHelper(this.id, newValues.helperId);
    }

    if (mutation) {
      mutation.then(
        () => this.save(dao, newValues.helperId, callback)
      );
    } else {
      this.save(dao, newValues.helperId, callback);
    }
  }

  save(dao, helper, callback) {
    if (helper) {
      dao.saveHelper(this, callback);
    } else {
      dao.saveBody(this, callback);
    }
  }
}

module.exports = OneToOneHelperBodyOperation;
