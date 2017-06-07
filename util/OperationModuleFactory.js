const ModuleFactory = require('./ModuleFactory');

class OperationModuleFactory extends ModuleFactory {
  constructor(session, send) {
    super(session, send)
  }

  getOperationModule(module) {
    return this.loadModule(
      this.operationModulePath, this.getOperationDao.bind(this), module
    );
  }

  getOperationDao(module) {
    return this.loadDao(module, this.operationDaoPath);
  }

  operationModulePath(module) {
    return `../modules/operation/${module}Module`;
  }

  operationDaoPath(module) {
    return `../dao/operation/${module}Dao`;
  }
}

module.exports = OperationModuleFactory;
