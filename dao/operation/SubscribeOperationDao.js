"use strict";
const SimpleOperationDao = require('./SimpleOperationDao');
const SubscribeOperation = require("../../models/operation/SubscribeOperation");

class SubscribeOperationDao extends SimpleOperationDao {

    constructor(session, sender, moduleFactory) {
        super(session, sender, moduleFactory);
        this.streamDao = moduleFactory.loadDao("ActuatorStream");
        this.actuatorStreamModule = moduleFactory.getModule("ActuatorStream");
    }

    makeGetQuery() {
        return super.makeGetQuery("subscribe");
    }

    makeAddQuery() {
        return super.makeAddQuery("subscribe");
    }

    makeSaveQuery() {
        return super.makeSaveQuery("subscribe");
    }

    getModelFromRecord(id, source, destination, program, record, callback) {
        callback(
            new SubscribeOperation(
                id, source, destination, program
            )
        )
    }

    returnPart(src, dst, operation) {
        return super.returnPart(src, dst, operation, `type(${operation})`);
    }

    getDestination(id) {
        return this.actuatorStreamModule.get(id);
    }

}

module.exports = SubscribeOperationDao;
