var HelperOrBodyOperationModule = require('./HelperOrBodyOperationModule');

class FilterOperationModule extends HelperOrBodyOperationModule {

    constructor(dao, sender, moduleFactory) {
        super(dao, sender, moduleFactory);
    }

    update(msg, callback) {
        super.update("filter", msg, callback)
    }
}

module.exports = FilterOperationModule;
