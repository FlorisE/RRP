class SensorModule {
    constructor(dao) {
        this.dao = dao;
    }

    getFromDb() {
        return this.dao.get();
    }

    sendToClient() {
        return this.dao.sendToClient();
    }
}

module.exports = SensorModule;
