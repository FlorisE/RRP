var HelperOrBodyOperationModule = require('./HelperOrBodyOperationModule');

class MergeOperationModule extends HelperOrBodyOperationModule {

  constructor(dao, sender, moduleFactory) {
    super(dao, sender, moduleFactory);
  }

  update(msg, callback) {
    super.update("merge", msg, callback)
  }

  add(operation, callback) {
    this.dao.add(operation, callback);
  }
}

module.exports = MergeOperationModule;
