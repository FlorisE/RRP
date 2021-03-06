const FilterOperation = require("../../models/operation/FilterOperation");
const HelperOrBodyOperationModule = require('./HelperOrBodyOperationModule');

class FilterOperationModule extends HelperOrBodyOperationModule {

  constructor(dao, sender, moduleFactory) {
    super(dao, sender, moduleFactory);
  }

  update(msg, callback) {
    super.update("filter", msg, callback)
  }

  add(msg, callback) {
    return super.add(msg, callback, this.factory);
  }

  factory(sources, destination, program) {
    return FilterOperation.create(
      sources[0], destination, program
    );
  }

  getAdder(operation, callback, msg) {
    return () => this.addWithHelperOrBody(
      msg.helperId, msg.body, operation, callback
    );
  }

  addWithHelperOrBody(helperId, body, operation, callback) {
    if (helperId != null) {
      this.helperModule.get(helperId).then(
        (helper) => {
          operation.addHelper(helper);

          this.dao.addHelper(operation, callback);
        }
      );
    } else {
      operation.addBody(body);
      this.dao.addBody(operation, callback);
    }
  }
}

module.exports = FilterOperationModule;
