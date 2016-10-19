var sender = require('./sender');

class Sensor {
    constructor(id, io, session) {
        this.session = session;
        this.sender = sender(id, io);
    }

    getFromDb() {
        return this.session.run(
            `MATCH (s:Sensor) 
             OPTIONAL MATCH (s)-[pr:parameter]->(p:ParameterDefinition),
                            (p)-[:type]->(t:Type)
             RETURN { 
                 name: s.name, 
                 id: s.uuid
             } as sensor,
             collect({
                 name: p.name,
                 type: t.name,
                 id: p.uuid
             }) as parameters`
        )
    }

    sendToClient() {
        return this.sender(
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
}

module.exports = Sensor;