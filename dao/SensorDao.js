class SensorDao {
    constructor(session, sender) {
        this.session = session;
        this.sender = sender;
    }

    get(id, callback) {
        const sensorPart = id ? `(s:Sensor { uuid: {id} })` : '(s:Sensor)';
        const params = id ? { id: id} : {};
        return this.session.run(`
MATCH ${sensorPart}
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
}) as parameters`,
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
}

module.exports = SensorDao;
