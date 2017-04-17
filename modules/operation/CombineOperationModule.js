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

          this.dao.addHelperOrBody(operation, callback);
        }
      );
    } else {
      operation.addBody(body);
      this.dao.addHelperOrBody(operation, callback);
    }
  }
}

module.exports = CombineOperationModule;
