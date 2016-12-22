const logwrapper = require('../util/logwrapper');

class StreamModule {

    constructor(dao, sender) {
        this.dao = dao;
        this.sender = sender;
    }

    get(id) {
        return new Promise(
            (resolve, reject) => this.dao.get(id, resolve, reject)
        );
    }

    read(id) {
        this.get(id).then(this.sender.send)
    }

    add(msg, callback) {
        this.dao.add(msg.name, msg.x, msg.y, msg.programId, callback);
    }

    update(msg, callback) {
        this.dao.update(msg.id, msg.x, msg.y, msg.name, callback);
    }

    remove(msg, callback) {
        this.dao.remove(msg.id, callback);
    }

    getFromDb(programId, callback) {
        return this.dao.getFromDb(programId, null, callback);
    }

    sendToClient() {
        return this.dao.sendToClient();
    }

    save(stream) {
        return this.dao.save(stream);
    }

}

module.exports = StreamModule;