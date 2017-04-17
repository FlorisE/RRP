var HelperOrBodyOperationModule = require('./HelperOrBodyOperationModule');

class MapOperationModule extends HelperOrBodyOperationModule {

    constructor(dao, sender, moduleFactory) {
        super(dao, sender, moduleFactory);
    }

    update(msg, callback) {
        super.update("map", msg, callback)
    }
}

module.exports = MapOperationModule;
