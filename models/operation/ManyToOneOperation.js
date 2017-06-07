"use strict";
const uuid = require('node-uuid');
const Operation = require('./Operation');

class ManyToOneOperation extends Operation {

  constructor(id/* : uuid */,
              sources/* : Stream[] */,
              destination/* : Stream */,
              program/* : Program */,
              x/* : Int */,
              y/* : Int */) {
    super(id, program);
    this.sources = sources;
    this.destination = destination;
    this.x = x;
    this.y = y;
  }

  static create(sources/* : Stream[] */,
                destination/* : Stream[] */,
                program/* : Program */,
                x/* Int */,
                y/* Int */) {
    return new ManyToOneOperation(uuid.v4(), sources, destination, program, x, y);
  }

  getUpdatePromises(newValues, dao) {
    let promises = [];

    let changesToInputStreams = this.getChangesToInputStreams(newValues, dao);
    if (changesToInputStreams !== null) {
      promises.push(...changesToInputStreams);
    }

    return promises;
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

    let promises = this.getUpdatePromises(newValues, dao);

    if (promises.length > 0) {
      Promise.all(promises).then(
        () => this.save(dao, newValues.helper, callback)
      );
    } else {
      this.save(dao, newValues.helper, callback);
    }
  }

  getChangesToInputStreams(newValues, dao) {
    let sourceIds = this.sources.map(
      (source) => source.id
    );

    let promises = [];

    let toBeRemovedIds = sourceIds.filter(
      (id) => newValues.sources.indexOf(id) === -1
    );
    let toBeAddedIds = newValues.sources.filter(
      (id) => sourceIds.indexOf(id) === -1
    );

    if (toBeRemovedIds.length > 0) {
      promises.push(
        dao.removeInputs(this.id, toBeRemovedIds)
      );
    }

    if (toBeAddedIds.length > 0) {
      promises.push(
        dao.addInputs(this.id, toBeAddedIds)
      );
    }

    return promises;
  }

  save(dao, helper, callback) {
    dao.save(this, callback);
  }
}

module.exports = ManyToOneOperation;
