const SampleOperation = require("../../models/operation/SampleOperation");
const SimpleOperationModule = require("./SimpleOperationModule");

class SampleOperationModule extends SimpleOperationModule {

    createOperationFromMsg(source, destination, program, msg) {
        return SampleOperation.create(
            source, destination, program, msg.rate
        );
    }

    updateOperation(msg, operation) {
        super.updateOperation(msg, operation);

        if (msg.rate) {
            operation.rate = msg.rate;
        }
    }

}

module.exports = SampleOperationModule;
