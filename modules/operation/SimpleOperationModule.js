"use strict";
const BaseOperationModule = require("./BaseOperationModule");

class SimpleOperationModule extends BaseOperationModule {

    getDestination(msg, program) {
        return Stream.create(
            msg.name, msg.x, msg.y, program
        );
    }

}

module.exports = SimpleOperationModule;
