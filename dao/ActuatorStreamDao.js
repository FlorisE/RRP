"use strict";
const ParameterizedStreamDao = require('./ParameterizedStreamDao');
const Stream = require("../models/Stream");
const logwrapper = require("../util/logwrapper");

class ActuatorStreamDao extends ParameterizedStreamDao {

  constructor(session, sender, moduleFactory) {
    super(session, sender, moduleFactory);
  }

  /*!! removed get !!*/

  add(actuatorId, programId, x, y, name, parameters, destinationId, callback) {
    return super.add(
      actuatorId, programId, x, y, name, parameters, destinationId,
      "actuator", "Actuator", callback
    );
  }

  update(actuatorId, programId, x, y, name, parameters, callback) {
    return super.update(
      actuatorId, programId, x, y, name, "actuator", "Actuator", parameters,
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

  /*!! removed mapGet !!*/
}

module.exports = ActuatorStreamDao;
