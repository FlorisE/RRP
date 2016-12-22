var ComplexOperationModule = require('./ComplexOperationModule');

class FilterOperationModule extends ComplexOperationModule {

    constructor(dao, sender, moduleFactory) {
        super(dao, sender, moduleFactory);
    }

    update(msg, callback) {
        super.update("filter", msg, callback)
    }
}

module.exports = FilterOperationModule;
