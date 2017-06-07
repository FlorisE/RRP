const CombineOperation = require("../../models/operation/CombineOperation");
var HelperOrBodyOperationModule = require('./HelperOrBodyOperationModule');

class CombineOperationModule extends HelperOrBodyOperationModule {

  constructor(dao, sender, moduleFactory) {
    super(dao, sender, moduleFactory);
  }

  update(msg, callback) {
    super.update("combine", msg, callback)
  }

  addWithHelperOrBody(helperId, body, operation, callback) {
    if (helperId != null) {
      this.helperModule.get(helperId).then(
        (helper) => {
          operation.addHelper(helper);

          this.dao.add(operation, callback);
        }
      );
    } else {
      operation.addBody(body);
      this.dao.add(operation, callback);
    }
  }

  add(msg, callback) {
    return super.add(msg, callback, this.factory);
  }

  factory(sources, destination, program, msg) {
    return CombineOperation.create(
      sources, destination, program, msg.opx, msg.opy
    );
  }

  getAdder(operation, callback, msg) {
    return () => this.addWithHelperOrBody(
      msg.helperId, msg.body, operation, callback
    );
  }
}

module.exports = CombineOperationModule;
