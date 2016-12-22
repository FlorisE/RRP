class ActuatorModule {
    constructor(dao) {
        this.dao = dao;
    }

    get(id) {
        return new Promise(
            (resolve, reject) => this.dao.get(id, resolve, reject)
        );
    }

    getFromDb(programId) {
        return this.dao.getFromDb(programId);
    }

    sendToClient() {
        return this.dao.sendToClient();
    }
}

module.exports = ActuatorModule;
