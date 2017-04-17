const Stream = require('../models/Stream');
const SensorStream = require('../models/SensorStream');
const ActuatorStream = require('../models/ActuatorStream');
const ProgramDao = require('./ProgramDao');
const logwrapper = require('../util/logwrapper');
const uuid = require('node-uuid');

class StreamDao {

    constructor(session, sender, moduleFactory) {
        this.session = session;
        this.sender = sender;

        this.matchPart = `(stream:Stream {uuid: {id}})-[:program]->(program:Program), 
                          (stream)-[:draw_at]->(draw:Draw)`;

        this.programModule = moduleFactory.getModule("Program");
        this.sensorModule = moduleFactory.getModule("Sensor");

        this.moduleFactory = moduleFactory;
    }

    get(id, resolve, reject) {
        return this.session.run(`
MATCH (stream:Stream { uuid: {id} }),
      (stream)-[:program]->(program:Program),
      (stream)-[:draw_at]->(draw:Draw)
OPTIONAL MATCH (directInStream:Stream)-->(stream)
OPTIONAL MATCH (indirectInStream:Stream)-[:in]->()-[:out]->(stream)
OPTIONAL MATCH (stream)-[:sensor]->(sensor:Sensor)
RETURN stream, program, draw, directInStream, collect(indirectInStream) as indirectInStreams, sensor`,
            {id: id}
        ).then(
            (results) => this.mapGet(results, resolve),
            reject
        );
    }

    getByName(programId, name, resolve, reject) {
        return this.session.run(`
MATCH (stream:Stream { name: {name} }),
      (stream)-[:program]->(program:Program { uuid: {programId} }),
      (stream)-[:draw_at]->(draw:Draw)
OPTIONAL MATCH (directInStream:Stream)-->(stream)
OPTIONAL MATCH (indirectInStream:Stream)-[:in]->()-[:out]->(stream)
OPTIONAL MATCH (stream)-[:sensor]->(sensor:Sensor)
RETURN stream, program, draw, directInStream, collect(indirectInStream) as indirectInStreams, sensor`,
            {
                name: name,
                programId: programId
            }
        ).then(
            (results) => this.mapGet(results, resolve),
            reject
        );
    }

    save(stream) {
        return this.session.run(
            this.addQuery(),
            {
                id: stream.id,
                name: stream.name,
                x: stream.x,
                y: stream.y,
                programId: stream.program.id
            }
        )
    }

    checkForExistingDestination(programId, destinationName) {
        let query = `
MATCH (p:Program { uuid: {programId} }), 
      (stream:Stream { name: {destinationName} })-[:program]->(p) 
OPTIONAL MATCH (stream)-[:sensor]->(sensor:Sensor) 
OPTIONAL MATCH (instream:Stream)-[*]->(stream) 
RETURN p, stream, count(instream), count(sensor)`;
        return this.session.run(
            query, 
            { 
                programId: programId, 
                destinationName: destinationName
            }
        );
    }

    /*add(name, x, y, programId, callback) {
        var self = this;
        const id = uuid.v4();

        this.checkForExistingDestination(programId, name).then((results) => {
            let query = this.addQuery(
                `${this.simpleReturnPart("str", "d", "p")} as stream`
            );
            this.session.run(
                query,
                {
                    id: id,
                    name: name,
                    x: x,
                    y: y,
                    programId: programId
                }
            ).then(
                this.sender.getSendMethod(this.mapStream, callback),
                console.log
            );
        }, console.log);
    }*/

    addQuery(withReturn) {
        let query = `
MATCH (p:Program) 
WHERE p.uuid = {programId} 
CREATE 
 (str:Stream { 
   uuid: {id}, 
   name: {name}
 })-[:program]->(p), 
 (str)-[:draw_at]->(d:Draw { x: {x}, y: {y}} )`;
        if (withReturn) {
            query += "\nRETURN " + withReturn;
        }
        return query;
    }

    update(id, x, y, name, callback) {
        this.session.run(`
MATCH (n:Stream)-[:draw_at]->(d:Draw) 
WHERE n.uuid = {id} 
SET d.x = {x}, d.y = {y}, n.name = {name}`,
            {
                id: id,
                x: x,
                y: y,
                name: name
            }
        );
    }

    remove(id) {
        return this.session.run(`
MATCH (s:Stream {uuid: {streamId}}) 
OPTIONAL MATCH (o:Operation)-[:out]->(s:Stream) 
OPTIONAL MATCH (s:Stream)-[:draw_at]->(d:Draw) 
OPTIONAL MATCH (s:Stream)-[:parameter]->(pi:ParameterInstance) 
DETACH DELETE o, d, pi`, {streamId: id}
        ).then(
            () => this.session.run(`
MATCH (d:Stream)
WHERE d.uuid = {id}
DETACH DELETE d`,
                {id: id}),
            console.log
        ).then(
            () => {
                let msg = {
                    type: "stream",
                    action: "remove",
                    id: id
                };
                this.sender.send([msg]);
            },
            console.log
        );
    }

    mapGet(results, resolve) {
        if (results.records.length === 0) {
          resolve(null);
          return;
        }

        try {
            let record = results.records[0];
            let stream = record.get("stream");
            let uuid, name;
            ({uuid, name} = stream.properties);

            let programRecord = record.get("program");
            let programPromise = this.programModule.get(
                programRecord.properties["uuid"]
            );

            let streamModule = this.moduleFactory.getModule("Stream");
            let directInStreamRecord = record.get("directInStream");

            let directInStreamPromise = !directInStreamRecord ? null : streamModule.get(
                directInStreamRecord.properties["uuid"]
            );

            let indirectInStreamRecords = record.get("indirectInStreams");
            let indirectInStreamsPromises = indirectInStreamRecords.map(
                (indirectInStreamRecord) => streamModule.get(
                    indirectInStreamRecord.properties["uuid"]
                )
            );

            let sensorRecord = record.get("sensor");
            let sensorPromise = !sensorRecord ? null : this.sensorModule.single(
                sensorRecord.properties["uuid"]
            );

            let promises = [
                programPromise,
                directInStreamPromise,
                sensorPromise
            ];

            promises.push(...indirectInStreamsPromises);

            promises = promises.filter((item) => item !== null);

            Promise.all(promises).then(
                (results) => {
                    let rowCount = 0;

                    let program = results[rowCount];

                    rowCount++;

                    let directInStream = null;
                    if (directInStreamRecord) {
                        directInStream = results[rowCount];
                        rowCount++;
                    }

                    let sensor = null;
                    if (sensorRecord) {
                        sensor = results[rowCount];
                        rowCount++;
                    }

                    let indirectInStreams = [];
                    while(rowCount < results.length) {
                        indirectInStreams.push(results[rowCount]);
                        rowCount++
                    }

                    let inStreams = indirectInStreams;
                    if (directInStream)
                        indirectInStreams.push(directInStream);

                    let drawRecord = record.get("draw");
                    let x, y;
                    ({x, y} = drawRecord.properties);

                    if (sensor) {
                        resolve(new SensorStream(uuid, name, x, y, program, inStreams, sensor, null));
                    //} else if (actuator) {
                    } else {
                        resolve(new Stream(uuid, name, x, y, program, inStreams));
                    }


                }
            ).catch(logwrapper("StreamDao.mapGet"));
        } catch (error) {
            console.log(error);
        }
    }

    simpleReturnPart(stream, draw, program) {
        return `
{
    name: ${stream}.name,
    id: ${stream}.uuid,
    programId: ${program}.uuid,
    x: ${draw}.x,
    y: ${draw}.y
}`;
    }

    buildMatchPart(streamId, stream, draw, program) {
        let streamPart = streamId ?
            `(${stream}:Stream {uuid: ${streamId}})` :
            `(${stream}:Stream)`;
        return `${streamPart}-[:program]->(${program}:Program), 
                (${stream})-[:draw_at]->(${draw}:Draw)`;
    }

    buildOptionalMatches(stream, sensor, pi, pd, type, am) {
        return `OPTIONAL MATCH (${stream})-[:sensor]->(${sensor}:Sensor)
                OPTIONAL MATCH (${stream})-[:parameter]->(${pi}:ParameterInstance),
                               (pi)-[:instance_of]->(${pd}:ParameterDefinition),
                               (pd)-[:type]->(${type}:Type)
                OPTIONAL MATCH (${stream})-[:actuator]->(${am}:ActuatorS)`;
    }

    returnPart(stream, draw, program, sensor, am, pi, pd, type) {
        return `
{ 
    id: ${stream}.uuid,
    name: ${stream}.name, 
    x: ${draw}.x, 
    y: ${draw}.y, 
    program: {
        id: ${program}.uuid,
        name: ${program}.name
    },
    sensor: {
        id: ${sensor}.uuid,
        name: ${sensor}.name
    },
    actuator: {
        id: ${am}.uuid,
        name: ${am}.name
    },
    parameters: collect({
        value: ${pi}.value,
        name: ${pd}.name,
        type: ${type}.name,
        id: ${pd}.uuid
    }) 
}`;
    }

    map(stream) {
        return new Stream(
            stream.id,
            stream.name,
            stream.x,
            stream.y,
            stream.program,
            stream.sensor,
            stream.actuator,
            stream.parameters
            //ProgramDao.get(programId)
        );
    }

    getFromDb(programId, id, callback) {
        return () => this.runGetQuery(programId, id, callback);
    }

    runGetQuery(programId, streamId, relation, type) {
        var cypher = `
MATCH (s:Stream)-[r:program]->(p:Program),
      (s)-[:draw_at]->(d:Draw) 
WHERE p.uuid = {programId} `;

        if (streamId) {
            cypher += `  AND s.uuid = {streamId} `;
        }

        cypher += `
OPTIONAL MATCH (s)-[:sensor]->(sensor:Sensor)
OPTIONAL MATCH (s)-[:actuator]->(actuator:Actuator)
OPTIONAL MATCH (s)-[:parameter]->(pi:ParameterInstance),
             (pi)-[:instance_of]->(pd:ParameterDefinition),
             (pd)-[:type]->(type:Type)
RETURN { 
       programId: p.uuid,
       name: s.name, 
       id: s.uuid, 
       x: d.x, 
       y: d.y, 
       sensorId: sensor.uuid,
       sensorName: sensor.name, 
       actuatorId: actuator.uuid,
       actuatorName: actuator.name,
       parameters: collect({
           value: pi.value,
           name: pd.name,
           type: type.name,
           id: pd.uuid
       }) 
} as stream`;

        var parameters = {programId: programId};

        if (streamId) {
            parameters.streamId = streamId;
        }

        return this.session.run(cypher, parameters);
    }

    sendToClient() {
        return this.sender.getSendMethod(
            this.mapRecordAdd.bind(this)
        );
    }

    mapRecordAdd(record) {
        var stream = record.get("stream");

        return this.mapAddStream(stream);
    }

    mapRecordUpdate(record) {
        var stream = record.get("stream");

        return this.mapUpdateStream(stream);
    }

    mapAddStream(item) {
        let stream = this.mapStream(item);
        stream.action = "add";
        stream.type = this.getType(item);
        return stream;
    }

    mapUpdateStream(item) {
        let stream = this.mapStream(item);
        stream.action = "update";
        stream.type = this.getType(item);
        return stream;
    }

    mapStream(item) {
        return {
            action: item.action,
            programId: item.programId,
            id: item.id,
            name: item.name,
            x: item.x["low"] !== undefined ? item.x.low : item.x,
            y: item.y["low"] !== undefined ? item.y.low : item.y,
            parameters: item.parameters ? item.parameters.map(this.mapParameter) : null,
            sensorId: item.sensorId,
            sensorName: item.sensorName,
            actuatorId: item.actuatorId,
            actuatorName: item.actuatorName
        };
    }

    mapParameter(parameter) {
        let returnValue = {
            id: parameter.id,
            name: parameter.name,
            type: parameter.type
        };
        if (parameter.value && parameter.type === "integer") {
            returnValue.value = parameter.value["low"] !== undefined ? parameter.value.low : parameter.value
        }
        return returnValue;
    }

    getType(stream) {
        if (stream.sensorId) {
            return "sensorStream";
        } else if (stream.actuatorId) {
            return "actuatorStream";
        } else {
            return "stream";
        }
    }
}

module.exports = StreamDao;
