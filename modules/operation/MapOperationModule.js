var ComplexOperationModule = require('./ComplexOperationModule');

class MapOperationModule extends ComplexOperationModule {

    constructor(dao, sender, moduleFactory) {
        super(dao, sender, moduleFactory);
    }

    update(msg, callback) {
        super.update("map", msg, callback)
    }
}

module.exports = MapOperationModule;
