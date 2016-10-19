var sender = require('./sender');

class Actuator {
    constructor(id, io, session) {
        this.id = id;
        this.io = io;
        this.session = session;
        this.send = sender(id, io);
    }

    getFromDb(programId) {
        return () => this.session.run(
            `MATCH (n:ActuationModule) 
             RETURN { id: n.uuid, name: n.name } as actuator`
        );
    }

    sendToClient() {
        return this.send(
            (record) => this._mapActuators(record.get("actuator"))
        );
    }

    _mapActuators(record) {
        return {
            type: "actuator",
            action: "add",
            id: record.id,
            name: record.name
        };
    }
}

module.exports = Actuator;