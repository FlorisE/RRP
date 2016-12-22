"use strict";
const SimpleOperationDao = require('./SimpleOperationDao');
const TimestampOperation = require("../../models/operation/TimestampOperation");

class TimestampOperationDao extends SimpleOperationDao {

    makeGetQuery() {
        return super.makeGetQuery("timestamp");
    }

    makeAddQuery() {
        return super.makeAddQuery("timestamp");
    }

    makeSaveQuery() {
        return super.makeSaveQuery("timestamp");
    }

    getModelFromRecord(id, source, destination, program, record, callback) {
        callback(
            new TimestampOperation(
                id, source, destination, program
            )
        )
    }

    returnPart(src, dst, operation) {
        return super.returnPart(src, dst, operation, `type(${operation})`);
    }

    getDestination(id) {
        return this.streamModule.get(id);
    }
}

module.exports = TimestampOperationDao;
