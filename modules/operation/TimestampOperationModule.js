const TimestampOperation = require("../../models/operation/TimestampOperation");
const SimpleOperationModule = require("./SimpleOperationModule");

class TimestampOperationModule extends SimpleOperationModule {

    createOperationFromMsg(source, destination, program) {
        return TimestampOperation.create(
            source, destination, program
        );
    }

}

module.exports = TimestampOperationModule;
