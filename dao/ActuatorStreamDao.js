"use strict";
const ParameterizedStreamDao = require('./ParameterizedStreamDao');
const Stream = require("../models/Stream");
const logwrapper = require("../util/logwrapper");

class ActuatorStreamDao extends ParameterizedStreamDao {

    constructor(session, sender, moduleFactory) {
        super(session, sender, moduleFactory);
    }

    get(id, resolve, reject) {
        return this.session.run(`
MATCH (stream:Stream {uuid: {id}}),
      (stream)-[:program]->(program:Program),
      (stream)-[:draw_at]->(draw:Draw)
RETURN stream, program, draw`,
            {id: id}
        ).then(
            (results) => this.mapGet(results, resolve),
            reject
        );
    }

    add(actuatorId, programId, x, y, name, parameters, destinationId, callback) {
        return super.add(
            actuatorId, programId, x, y, name, parameters, destinationId,
            "actuator", "Actuator", callback
        );
    }

    update(actuatorId, name, parameters, programId, callback) {
        return super.update(
            actuatorId, name, parameters, programId, "actuator", "Actuator",
            callback
        );
    }

    save(actuatorStream) {
        return this.add(
            actuatorStream.actuator.id,
            actuatorStream.program.id,
            actuatorStream.x,
            actuatorStream.y,
            actuatorStream.name,
            actuatorStream.parameters,
            actuatorStream.id
        );
    }

    actuatorChangedTo(actuatorStreamId, actuatorId, programId, callback) {
        let cypher = `
MATCH (actuatorStream:Stream { uuid: {actuatorStreamId} }),
      (actuatorStream)-[oldActuator:actuator]->(:Actuator),
      (newActuator:Actuator { uuid: {actuatorId} })
DELETE oldActuator
SET actuatorStream.name = newActuator.name 
CREATE (actuatorStream)-[:actuator]->(newActuator)`;
        let params = {
            actuatorStreamId: actuatorStreamId,
            actuatorId: actuatorId
        };
        let promise = this.session.run(cypher, params);
        return this.getAndSend(
            promise, programId, actuatorStreamId,
            "actuator", "Actuator", this.mapRecordUpdate.bind(this), callback
        );
    }

    mapStream(item) {
        let stream = super.mapStream(item);

        stream.type = "actuatorStream";

        return stream;
    }

    mapGet(results, resolve) {
        try {
            let record = results.records[0];
            let stream = record.get("stream");
            let uuid, name;
            ({uuid, name} = stream.properties);

            let programRecord = record.get("program");
            let programPromise = this.programModule.get(
                programRecord.properties["uuid"]
            );
            programPromise.then(
                (program) => {
                    let drawRecord = record.get("draw");
                    let x, y;
                    ({x, y} = drawRecord.properties);

                    resolve(new Stream(uuid, name, x, y, program));
                }
            ).catch(logwrapper("StreamDao.mapGet"));
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = ActuatorStreamDao;
