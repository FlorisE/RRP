"use strict";
const logwrapper = require("../../util/logwrapper");
const Stream = require("../../models/Stream");

class BaseOperationModule {

    constructor(dao, sender, moduleFactory) {
        this.dao = dao;
        this.streamModule = moduleFactory.getModule("Stream");
        this.programModule = moduleFactory.getModule("Program");
        this.helperModule = moduleFactory.getModule("Helper");
    }

    add(msg, callback) {
        let program = this.programModule.get(msg.programId),
            source = this.streamModule.get(msg.sourceId);

        Promise.all([program, source]).then(
            ([program, source]) => {
                let destination = this.getDestination(msg, program);

                destination.then(
                  (destination) => {
                      let operation = this.createOperationFromMsg(
                        source, destination, program, msg
                      );

                      this.dao.add(
                        operation, callback
                      );
                    }
                );
            },
          logwrapper("BaseOperationModule.add:Query")
        ).catch(logwrapper("BaseOperationModule.add:save"));
    }

    update(msg, callback) {
        this.dao.get(msg.id, (operation) => {
            this.updateOperation(msg, operation);

            this.dao.save(operation, callback);
        });
    }

    updateOperation(msg, operation) {
        if (msg.name) {
            operation.destination.name = msg.name;
        }
    }
}

module.exports = BaseOperationModule;
