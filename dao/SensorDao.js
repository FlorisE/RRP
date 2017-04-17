const Sensor = require('../models/Sensor');
const ParameterDefinition = require('../models/ParameterDefinition');

class SensorDao {
    constructor(session, sender) {
        this.session = session;
        this.sender = sender;
    }

    get(id, resolve, reject) {
        if (id) {
            return this.getSingle(id, resolve, reject);
        } else {
            return this.getAll(resolve, reject);
        }
    }

    getAll(resolve, reject) {
        const sensorPart = '(s:Sensor)';
        const params = {};

        return this.doGetQuery(sensorPart, params).then((result) => this.mapAll(result, resolve, reject));
    }

    getSingle(id, resolve, reject) {
        const sensorPart = `(s:Sensor { uuid: {id} })`;
        const params = { id: id };

        return this.doGetQuery(sensorPart, params).then((result) => this.mapSingle(result, resolve, reject));
    }

    mapAll(result, resolve, reject) {
        resolve(result.records.map(this.map));
    }

    mapSingle(result, resolve, reject) {
        resolve(this.map(result.records[0]));
    }

    map(record) {
        let sensor = record.get("sensor");
        let parameters = (record.get("parameters") || []).map(
            (parameter) => new ParameterDefinition(parameter.id, parameter.name, parameter.type)
        );
        return new Sensor(sensor.id, sensor.name, parameters)
    }

    doGetQuery(sensorPart, params) {
        return this.session.run(`
MATCH ${sensorPart}
OPTIONAL MATCH (s)-[pr:parameter]->(p:ParameterDefinition),
               (p)-[:type]->(t:Type)
RETURN { 
 name: s.name, 
 id: s.uuid
} as sensor,
CASE WHEN p IS NOT NULL THEN collect({
 name: p.name,
 type: t.name,
 id: p.uuid
}) END AS parameters`,
            params
        );
    }

    sendToClient() {
        return this.sender.getSendMethod(
            function (record) {
                var sensor = record.get("sensor");
                var parameters = record.get("parameters");

                return {
                    type: "sensor",
                    action: "add",
                    id: sensor.id,
                    name: sensor.name,
                    parameters: parameters.filter(
                        (parameter) => parameter.name != null
                    )
                };
            }
        );
    }

    send(sensor) {
        this.sender.send(
            {
                type: "sensor",
                action: "add",
                id: sensor.id,
                name: sensor.name,
                parameters: sensor.parameters
            }
        );
    }
}

module.exports = SensorDao;
