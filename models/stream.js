var Sender = require('./sender');
var uuid = require('node-uuid');

class Stream {
  constructor(id, io, session) {
    this.io = io;
    this.id = id;
    this.session = session;
    this.send = Sender(id, io);
  }

  runGetSensorQuery(programId, streamId) {
    var cypher = `MATCH (s:Stream)-[r:program]->(p:Program),
                          (s)-[:draw_at]->(d:Draw) 
                  WHERE p.uuid = {programId} `;

    if (streamId) {
      cypher +=  `  AND s.uuid = {streamId} `;
    }

    cypher +=    `OPTIONAL MATCH (s)-[:sensor]->(sensor:Sensor)
                  OPTIONAL MATCH (s)-[:parameter]->(pi:ParameterInstance),
                                 (pi)-[:instance_of]->(pd:ParameterDefinition),
                                 (pd)-[:type]->(type:Type)
                  OPTIONAL MATCH (s)-[:actuator]->(am:ActuationModule)
                  RETURN { 
                           programId: p.uuid,
                           name: s.name, 
                           id: s.uuid, 
                           x: d.x, 
                           y: d.y, 
                           sensorId: sensor.uuid,
                           sensorName: sensor.name, 
                           actuatorId: am.uuid,
                           actuatorName: am.name,
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

  getFromDb(programId, sensorId) {
    return () => this.runGetSensorQuery(programId, sensorId);
  }

  sendToClient() {
    var self = this;
    return this.send(
      function (record)
      {
        var stream = record.get("stream");

        if (stream.sensorId)
        {
          return self._mapAddSensorStream(stream);
        }
        else if (stream.actuatorId)
        {
          return self._mapAddActuatorStream(stream);
        }
        else
        {
          return self._mapAddStream(stream);
        }
      }
    );
  }

  sendUpdateToClient() {
    var self = this;
    return this.send(
      function (record)
      {
        var stream = record.get("stream");

        if (stream.sensorId)
        {
          return self._mapUpdateSensorStream(stream);
        }
        else if (stream.actuatorId)
        {
          return self._mapUpdateActuatorStream(stream);
        }
        else
        {
          return self._mapUpdateStream(stream);
        }
      }
    );
  }

  update(msg) {
    this.session.run(
      `MATCH (n:Stream)-[:draw_at]->(d:Draw) 
       WHERE n.uuid = '${msg.id}' 
       SET d.x = ${msg.x}, d.y = ${msg.y}, n.name = '${msg.name}'`
    );
  }

  updateStreamSensor(msg, callback) {
    var self = this;

    var cypher = `MATCH (s:Stream)
                  WHERE s.uuid = {id}
                  SET s.name = {name}`;
    var attributes = {
      id: msg.id,
      name: msg.name
    };

    this.session.run(cypher, attributes).then(
      () => {
        var parameterQueries = [];

        msg.parameters.forEach(
          function (parameter) {
            var cypher = `MATCH (s:Stream)-[:parameter]->(pi:ParameterInstance),
                                (pi)-[:instance_of]->(pd:ParameterDefinition)
                          WHERE pd.uuid = {id}
                          SET pi.value = {value}`;
            var attributes = {
              id: parameter.id,
              value: parameter.value
            };
            parameterQueries.push(self.session.run(cypher, attributes));
          }
        );

        Promise.all(parameterQueries).then(
          () => {
            this.runGetSensorQuery(msg.programId, msg.id).then(
              this.sendUpdateToClient()
            ).then(
              () => {
                if (callback) { callback(); }
              }
            );
          }
        );
      }
    );
  }

  addSensor(msg, callback) {
    var self = this;
    msg.uuid = uuid.v4();

    var template = `
        MATCH (p:Program), (sensor:Sensor) 
        WHERE p.uuid = {programId} 
          AND sensor.uuid = {sensorId} 
        OPTIONAL MATCH (sensor)-[:parameter]->(pd:ParameterDefinition),
                       (pd)-[:type]->(pt:Type)
        CREATE (
          str:Stream { 
            uuid: {uuid}, 
            name: {name} 
          })-[:program]->(p), 
          (str)-[:sensor]->(sensor), 
          (str)-[:draw_at]->(d:Draw { x: {x}, y: {y}} ) 
        FOREACH (parameterDefinition 
            IN CASE WHEN pd IS NOT NULL THEN pd ELSE [] END |
                CREATE (str)-[:parameter]->(pi:ParameterInstance),
                    (pi)-[:instance_of]->(pd))`;
    self.session.run(template, msg).then(
      () => this.runGetSensorQuery(msg.programId, msg.uuid).then(
        this.sendToClient()
      )
    );
  }

  add(msg, callback) {
    var self = this;
    msg.uuid = uuid.v4();

    var template = "MATCH (p:Program) " +
      "WHERE p.uuid = {programId} " +
      "CREATE " +
      " (str:Stream { " +
      "   uuid: {uuid}, " +
      "   name: {name}" +
      " })-[:program]->(p), " +
      " (str)-[:draw_at]->(d:Draw { x: {x}, y: {y}} ) " +
      "RETURN { " +
      "  name: str.name, " +
      "  id: str.uuid, " +
      "  x: d.x, " +
      "  y: d.y " +
      "} as stream";
    this.session.run(template, msg).then(
      function (record) {
        self.send(
          (record) => this._mapStream(record.get("stream"))
        );
      },
      console.log
    );
  }

  remove(msg) {
    return this.session.run(
      `MATCH (s:Stream {uuid: {streamId}}) 
       OPTIONAL MATCH (o:Operation)-[:out]->(s:Stream) 
       OPTIONAL MATCH (s:Stream)-[:draw_at]->(d:Draw) 
       OPTIONAL MATCH (s:Stream)-[:parameter]->(pi:ParameterInstance) 
       DETACH DELETE o, d, pi`, {streamId: msg.id}
    ).then(
      () => this.session.run("MATCH (d:Stream) " +
        "WHERE d.uuid = '" + msg.id + "' " +
        "DETACH DELETE d"),
      console.log
    ).then(
      () => {
        msg = {
          type: "stream",
          action: "remove",
          id: msg.id
        };
        this.io.emit(this.id, [msg])
      },
      console.log
    );
  }

  _mapStream(item) {
    return {
      type: "stream",
      action: item.action,
      programId: item.programId,
      id: item.id,
      name: item.name,
      x: item.x.low ? item.x.low : item.x,
      y: item.y.low ? item.y.low : item.y
    };
  }

  _mapAddStream(item) {
    item.action = "add";
    return this._mapStream(item);
  }

  _mapUpdateStream(item) {
    item.action = "update";
    return this._mapStream(item);
  }

  _mapAddActuatorStream(item) {
    item.action = "add";
    return this._mapActuatorStream(item);
  }

  _mapUpdateActuatorStream(item) {
    item.action = "update";
    return this._mapActuatorStream(item);
  }

  _mapActuatorStream(item) {
    return {
      type: "actuatorStream",
      action: item.action,
      programId: item.programId,
      id: item.id,
      name: item.name,
      x: item.x["low"] !== undefined ? item.x.low : item.x,
      y: item.y["low"] !== undefined ? item.y.low : item.y,
      parameters: item.parameters,
      actuatorId: item.actuatorId,
      actuatorName: item.actuatorName
    };
  }

  _mapAddSensorStream(item) {
    item.action = "add";
    return this._mapSensorStream(item);
  }

  _mapUpdateSensorStream(item) {
    item.action = "update";
    return this._mapSensorStream(item);
  }

  _mapSensorStream(item) {
    return {
      type: "sensorStream",
      action: item.action,
      programId: item.programId,
      id: item.id,
      name: item.name,
      x: item.x["low"] !== undefined ? item.x.low : item.x,
      y: item.y["low"] !== undefined ? item.y.low : item.y,
      parameters: item.parameters,
      sensorId: item.sensorId,
      sensorName: item.sensorName
    };
  }
}

module.exports = Stream;