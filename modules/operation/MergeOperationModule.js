const HelperOrBodyOperationModule = require('./HelperOrBodyOperationModule');
const MergeOperation = require('../../models/operation/MergeOperation');

class MergeOperationModule extends HelperOrBodyOperationModule {

  constructor(dao, sender, moduleFactory) {
    super(dao, sender, moduleFactory);
  }

  update(msg, callback) {
    super.update("merge", msg, callback)
  }

  add(msg, callback) {
    super.add(msg, callback, this.factory);
  }

  factory(sources, destination, program, msg) {
    return MergeOperation.create(
      sources, destination, program, msg.opx, msg.opy
    );
  }

  getAdder(operation, callback, msg) {
    return () => this.dao.add(operation, callback);
  }
}

module.exports = MergeOperationModule;
