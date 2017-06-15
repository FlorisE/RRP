"use strict";
const SimpleOperationDao = require('./SimpleOperationDao');
const OperationDao = require('../OperationDao');
const uuid = require('node-uuid');
const logwrapper = require('../../util/logwrapper');
const SampleOperation = require("../../models/operation/SampleOperation");

class SampleOperationDao extends SimpleOperationDao {

    makeGetQuery() {
        return super.makeGetQuery("sample", "operation.rate as rate");
    }

    makeAddQuery() {
        return super.makeAddQuery("sample", "rate: {rate}");
    }

    makeSaveQuery() {
        return super.makeSaveQuery("sample", "operation.rate = {rate}");
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
            new SampleOperation(
                id, source, destination, program, rate
            )
        )
    }

    returnPart(src, dst, operation) {
        return super.returnPart(
            src, dst, operation, `type(${operation})`, `rate: ${operation}.rate`
        );
    }
}

module.exports = SampleOperationDao;
