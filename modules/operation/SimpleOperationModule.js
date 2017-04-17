"use strict";
const BaseOperationModule = require("./BaseOperationModule");
const Stream = require("../../models/Stream");

class SimpleOperationModule extends BaseOperationModule {

    getDestination(msg, program) {
        return Stream.create(
            msg.name, msg.x, msg.y, program
        );
    }

}

module.exports = SimpleOperationModule;
