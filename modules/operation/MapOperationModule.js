const MapOperation = require("../../models/operation/MapOperation");
const HelperOrBodyOperationModule = require('./HelperOrBodyOperationModule');

class MapOperationModule extends HelperOrBodyOperationModule {

  constructor(dao, sender, moduleFactory) {
    super(dao, sender, moduleFactory);
  }

  update(msg, callback) {
    super.update("map", msg, callback)
  }

  add(msg, callback) {
    return super.add(msg, callback, this.factory);
  }

  factory(sources, destination, program) {
    return MapOperation.create(
      sources[0], destination, program
    );
  }

  getAdder(operation, callback, msg) {
    return () => this.addWithHelperOrBody(
      msg.helperId, msg.body, operation, callback
    );
  }

  async addWithHelperOrBody(helperId, body, operation, callback) {
    if (helperId != null) {
      let helper = await this.helperModule.get(helperId);
      operation.addHelper(helper);
      this.dao.addHelper(operation, callback);
    } else {
      operation.addBody(body);
      this.dao.addBody(operation, callback);
    }
  }
}

module.exports = MapOperationModule;
