"use strict";
const ManyToOneOperation = require("./ManyToOneOperation");
const uuid = require('node-uuid');

class ManyToOneHelperBodyOperation extends ManyToOneOperation {

  constructor(id/* : uuid */,
              sources/* : Stream[] */,
              destination/* : Stream */,
              program/* : Program */,
              x/* : Int */,
              y/* : Int */)
  {
    super(id, sources, destination, program, x, y);
  }

  addBody(body /* : string */) {
    this.body = body;
    return this;
  }

  hasBody() {
    return this.body !== undefined;
  }

  addHelper(helper /* : Helper */) {
    this.helper = helper;
    return this;
  }

  hasHelper() {
    return this.helper !== undefined;
  }

  static create(sources/* : Stream */,
                destination/* : Stream */,
                program/* : Program */,
                x/* Int */,
                y/* Int */) {
    return new ManyToOneHelperBodyOperation(uuid.v4(), sources, destination, program, x, y);
  }

  getUpdatePromises(newValues, dao) {
    let promises = super.getUpdatePromises(newValues, dao);

    let changesToBodyOrHelper = this.getChangesToBodyOrHelper(newValues, dao);
    if (changesToBodyOrHelper !== null) {
      promises.push(changesToBodyOrHelper);
    }

    return promises;
  }

  getChangesToBodyOrHelper(newValues, dao) {
    if (this.body && newValues.helperId)  // body to helper
    {
      return dao.bodyToHelper(this.id, newValues.helperId, type);
    }
    else if (this.body && newValues.body)  // body changed
    {
      return dao.setBody(this.id, newValues.body);
    }
    else if (this.helper && newValues.body)  // helper to body
    {
      return dao.helperToBody(this.id, newValues.body, type);
    }
    else if (this.helper && newValues.helperId)  // helper changed
    {
      return dao.setHelper(this.id, newValues.helperId);
    }
    return null;
  }

  save(dao, helper, callback) {
    if (helper !== null) {
      dao.saveHelper(this, callback);
    } else {
      dao.saveBody(this, callback);
    }
  }
}

module.exports = ManyToOneHelperBodyOperation;
