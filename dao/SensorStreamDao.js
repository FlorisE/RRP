"use strict";
const ParameterizedStreamDao = require('./ParameterizedStreamDao');

class SensorStreamDao extends ParameterizedStreamDao {

    constructor(session, sender, moduleFactory) {
        super(session, sender, moduleFactory);
    }

    add(sensorId, programId, x, y, name, parameters, callback) {
        return super.add(
            sensorId, programId, x, y, name, parameters, null, "sensor", "Sensor", callback
        );
    }

    update(sensorId, programId, x, y, name, parameters, callback) {
        return super.update(
            sensorId, programId, x, y, name, "sensor", "Sensor", parameters, callback
        );
    }

    save(sensorStream) {
        return this.add(
            sensorStream.sensor.id,
            sensorStream.program.id,
            sensorStream.x,
            sensorStream.y,
            sensorStream.name,
            sensorStream.parameters
        );
    }

    mapStream(item) {
        let stream = super.mapStream(item);

        stream.type = "sensorStream";

        return stream;
    }
}

module.exports = SensorStreamDao;
