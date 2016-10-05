var mappers = require('./mappers');
var sender = require('./sender');

class Sensor {
    constructor(id, io, session) {
        this.session = session;
        this.maps = mappers.Mappers;
        this.sender = sender(id, io);
    }

    getFromDb() {
        return this.session.run(
            "MATCH (s:Sensor) RETURN { name: s.name, id: s.uuid} as sensor"
        )
    }

    sendToClient() {
        return this.sender(
            (record) => this.maps.mapSensor(record.get("sensor"))
        );
    }
}

module.exports = {
    Sensor: Sensor
};