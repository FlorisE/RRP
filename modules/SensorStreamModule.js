class SensorStreamModule {

    constructor(dao) {
        this.dao = dao;
    }

    add(msg, callback) {
        this.dao.add(
            msg.sensorId, msg.programId, msg.x, msg.y, msg.name, msg.parameters, callback
        );
    }

    update(msg, callback) {
        this.dao.update(
            msg.id, msg.programId, msg.x, msg.y, msg.name, msg.parameters, callback
        );
    }

    save(sensorStream) {
        return this.dao.save(sensorStream);
    }

}

module.exports = SensorStreamModule;