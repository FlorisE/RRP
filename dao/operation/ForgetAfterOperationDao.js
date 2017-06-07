"use strict";
const SimpleOperationDao = require('./SimpleOperationDao');
const OperationDao = require('../OperationDao');
const uuid = require('node-uuid');
const logwrapper = require('../../util/logwrapper');
const ForgetAfterOperation = require("../../models/operation/ForgetAfterOperation");

class ForgetAfterOperationDao extends SimpleOperationDao {

  makeGetQuery() {
    return super.makeGetQuery("forgetAfter", "operation.rate as rate");
  }

  makeAddQuery() {
    return super.makeAddQuery("forgetAfter", "rate: {rate}");
  }

  makeSaveQuery() {
    return super.makeSaveQuery("forgetAfter", "operation.rate = {rate}");
  }

  makeAddParams(operation) {
    let params = super.makeAddParams(operation);

    params.rate = operation.rate;

    return params;
  }

  makeSaveParams(operation) {
    let params = super.makeSaveParams(operation);

    params.rate = operation.rate;

    return params;
  }

  getModelFromRecord(id, source, destination, program, record, callback) {
    const rate = record.get("rate");

    callback(
      new ForgetAfterOperation(
        id, source, destination, program, rate
      )
    )
  }

  returnPart(src, dst, operation) {
    return super.returnPart(
      src, dst, operation, `type(${operation})`, `rate: ${operation}.rate`
    );
  }

  getDestination(id) {
    return this.streamModule.get(id);
  }
}

module.exports = ForgetAfterOperationDao;
