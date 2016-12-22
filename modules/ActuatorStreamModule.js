class ActuatorStreamModule {

    constructor(dao) {
        this.dao = dao;
    }

    get(id, callback) {
        return new Promise(
            (resolve, reject) => this.dao.get(id, resolve, reject)
        );
    }

    add(msg, callback) {
        this.dao.add(
            msg.actuatorId, msg.programId, msg.x, msg.y, msg.name,
            msg.parameters, callback
        );
    }

    update(msg, callback) {
        this.dao.update(
            msg.id, msg.programId, msg.x, msg.y, msg.name, msg.parameters,
            callback
        );
    }

    save(actuatorStream) {
        return this.dao.save(actuatorStream);
    }

    actuatorChangedTo(destinationId, actuatorId, programId, callback) {
        return this.dao.actuatorChangedTo(
            destinationId, actuatorId, programId, callback
        );
    }

}

module.exports = ActuatorStreamModule;