const OperationModuleFactory = require('../util/OperationModuleFactory');

class OperationModule {
  constructor(dao, sender) {
    this.dao = dao;
    this.sender = sender;
  }

  sendToClient() {
    return this.dao.sendToClient();
  }

  sendAvailableToClient() {
    return this.sender.getSendMethod(this.dao.mapOperations);
  }

  getAvailable() {
    return this.dao.getAvailable();
  }

  add(msg, callback) {
    this.execute(msg, "add", callback);
  }

  update(msg, callback) {
    this.execute(msg, "update", callback);
  }

  remove(msg, callback) {
    this.dao.remove(msg.id, callback);
  }

  execute(msg, action, callback) {
    let operation = msg.operation;
    let operationUpper = operation[0].toUpperCase() + operation.slice(1);
    let factory = new OperationModuleFactory(
      this.dao.session, this.dao.sender
    );
    let module = factory.getOperationModule(operationUpper + "Operation");
    let foundOp = module[action].bind(module);

    if (foundOp !== undefined) {
      return foundOp(msg, callback);
    } else {
      console.log(operation);
    }
  }
}

module.exports = OperationModule;
