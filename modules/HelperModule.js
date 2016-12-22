var uuid = require('node-uuid');

class HelperModule {
    constructor(dao) {
        this.dao = dao;
    }

    getAll() {
        return this.dao.getAll();
    }

    get(id) {
        return new Promise(
            (resolve, reject) => this.dao.get(id, resolve, reject)
        );
    }

    sendToClient() {
        return this.dao.sendToClient();
    }

    add(msg, callback) {
        return this.dao.add(msg.name, msg.body, callback);
    }

    update(msg, callback) {
        return this.dao.update(msg.id, msg.name, msg.body, callback);
    }
}

module.exports = HelperModule;
