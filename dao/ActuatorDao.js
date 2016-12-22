"use strict";
const ParameterizedComponentDao = require("./ParameterizedComponentDao");
const Actuator = require("../models/Actuator");


class ActuatorDao extends ParameterizedComponentDao {

    constructor(session, sender, moduleFactory) {
        super(session, sender, moduleFactory);
    }

    get(id, resolve, reject) {
        return super.get(id, resolve, reject, "Actuator");
    }

    getFromDb(programId, callback) {
        return () => this.session.run(
            `MATCH (n:Actuator) 
             RETURN { id: n.uuid, name: n.name } as actuator`
        );
    }

    sendToClient(callback) {
        return this.sender.getSendMethod(
            (record) => this.mapActuators(record.get("actuator")),
            callback
        );
    }

    mapActuators(record) {
        return {
            type: "actuator",
            action: "add",
            id: record.id,
            name: record.name
        };
    }

    createInstance(id, name, parameters) {
        return new Actuator(id, name, parameters);
    }
}

module.exports = ActuatorDao;

