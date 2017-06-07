class ModuleFactory {
  constructor(session, sender) {
    this.session = session;
    this.sender = sender;
    this.modules = new Map();
    this.daos = new Map();
  }

  getModule(module) {
    return this.loadModule(this.modulePath, this.getDao.bind(this), module);
  }

  getDao(module) {
    return this.loadDao(module)
  }

  modulePath(module) {
    return `../modules/${module}Module`;
  }

  daoPath(module) {
    return `../dao/${module}Dao`;
  }

  loadModule(pathMapper, daoLoader, moduleName) {
    let moduleNameFirstUpper = this.firstUpper(moduleName);
    let loaded = this.modules.get(moduleNameFirstUpper);
    if (loaded) {
      return loaded;
    }

    let type = require(pathMapper(moduleNameFirstUpper));
    if (type != null) {
      let foundModule = new type(
        daoLoader(moduleNameFirstUpper), this.sender, this
      );
      this.modules.set(moduleNameFirstUpper, foundModule);
      return foundModule;
    }

    return null;
  }

  firstUpper(s) {
    return s[0].toUpperCase() + s.substring(1, s.length);
  }

  loadDao(moduleName, daoMapper) {
    let moduleNameFirstUpper = this.firstUpper(moduleName);
    let loaded = this.daos.get(moduleNameFirstUpper);
    if (loaded) {
      return loaded;
    }

    daoMapper = daoMapper || this.daoPath;

    let type = require(daoMapper(moduleNameFirstUpper));
    if (type != null) {
      let dao = new type(this.session, this.sender, this);
      this.daos.set(moduleNameFirstUpper, dao);
      return dao;
    }
    return null;
  }
}

module.exports = ModuleFactory;
