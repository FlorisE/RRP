const logwrapper = require('../util/logwrapper');

class SensorModule {
    constructor(dao) {
        this.dao = dao;
    }

    getFromDb() {
        let promise = new Promise(
            (resolve, reject) => this.dao.get(null, resolve, reject)
        ).catch(logwrapper("SensorModule.getFromDb"));
        return promise;
    }

    single(id) {
        let promise = new Promise(
            (resolve, reject) => this.dao.get(id, resolve, reject)
        ).catch(logwrapper("SensorModule.single"));
        return promise;
    }

    sendToClient() {
        return this.dao.sendToClient();
    }

    sendAddMultiple(sensors) {
        sensors.forEach(this.dao.send.bind(this.dao));
    }

    sendAddSingle() {
        return (sensor) => this.dao.send(sensor);
    }
}

module.exports = SensorModule;
