const ForgetAfterOperation = require("../../models/operation/ForgetAfterOperation");
const SimpleOperationModule = require("./SimpleOperationModule");

class ForgetAfterOperationModule extends SimpleOperationModule {

  createOperationFromMsg(source, destination, program, msg) {
    return ForgetAfterOperation.create(
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

module.exports = ForgetAfterOperationModule;
