var mappers = require('./mappers');
var sender = require('./sender');

class Actuator {
    constructor(id, io, session) {
        this.id = id;
        this.io = io;
        this.session = session;
        this.maps = mappers.Mappers;
        this.sender = sender(id, io);
    }

    getFromDb(programId) {
        return () => this.session.run(
            `MATCH (n:ActuationModule) 
             RETURN { id: n.uuid, name: n.name } as actuator`
        );
    }

    sendToClient() {
        return this.sender(
            (record) => this.maps.mapOutputModules(record.get("actuator"))
        );
    }
}

module.exports = {
    Actuator: Actuator
};