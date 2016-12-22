class ModuleFactory {
    constructor(session, sender) {
        this.session = session;
        this.sender = sender;
        this.modules = new Map();
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
        let loaded = this.modules.get(moduleName);
        if (loaded) {
            return loaded;
        }

        let type = require(pathMapper(moduleName));
        if (type != null) {
            let foundModule = new type(daoLoader(moduleName), this.sender, this);
            this.modules.set(moduleName, foundModule);
            return foundModule;
        }

        return null;
    }

    loadDao(moduleName, daoMapper) {
        daoMapper = daoMapper || this.daoPath;

        let type = require(daoMapper(moduleName));
        if (type != null) {
            let dao = new type(this.session, this.sender, this);
            return dao;
        }
        return null;
    }
}

module.exports = ModuleFactory;
