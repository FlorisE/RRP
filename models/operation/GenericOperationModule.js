class GenericOperationModule {

    constructor(dao, sender, moduleFactory) {
        this.dao = dao;
        this.sender = sender;
        this.moduleFactory = moduleFactory;
    }

    get(id) {

    }
}

module.exports = GenericOperationModule;
