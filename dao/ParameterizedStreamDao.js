"use strict";
const uuid = require('node-uuid');
const logwrapper = require('../util/logwrapper');
const StreamDao = require("./StreamDao");

class ParameterizedStreamDao extends StreamDao {
  constructor(session, sender, moduleFactory) {
    super(session, sender, moduleFactory);
  }

  add(id, programId, x, y, name, parameters, streamId, relation, type, callback) {
    streamId = streamId || uuid.v4();

    let template = `
MATCH (p:Program), (item:${type}) 
WHERE p.uuid = {programId} 
  AND item.uuid = {id} 
CREATE (
  str:Stream { 
    uuid: {streamId}, 
    name: {name} 
  })-[:program]->(p), 
  (str)-[:${relation}]->(item), 
  (str)-[:draw_at]->(d:Draw { x: {x}, y: {y}} ) 
WITH item, str
MATCH (item)-[:parameter]->(pd:ParameterDefinition),
      (pd)-[:type]->(pt:Type)
CREATE (str)-[:parameter]->(pi:ParameterInstance),
       (pi)-[:instance_of]->(pd)`;
    let promise = this.session.run(
      template,
      {
        streamId: streamId,
        programId: programId,
        id: id,
        x: x,
        y: y,
        name: name
      }
    );

    return this.getAndSend(
      promise, programId, streamId, relation,
      type, this.mapRecordAdd.bind(this), callback
    );
  }

  getAndSend(promise, programId, streamId, relation, type, mapper, callback) {
    return promise.then(
      () => this.runGetQuery(programId, streamId, relation, type),
      logwrapper("ParameterizedStreamDao.add")
    ).then(
      (result) => {
        if (result.records.length == 0) {
          throw `Program and / or ${type} not found`;
        }
        var record = result.records[0];
        return this.sender.send(mapper(record));
      },
      logwrapper("ParameterizedStreamDao.runGetQuery")
    ).then(
      () => {
        if (callback) callback();
      }
    ).catch(logwrapper("ParamerizedStreamDao.getAndSend"));
  }

  update(id, programId, x, y, name, relation, type, parameters, callback) {
    var self = this;

    var cypher = `
MATCH (stream:Stream { uuid: {id} }),
      (stream)-[:draw_at]->(draw:Draw)
SET stream.name = {name},
    draw.x = {x},
    draw.y = {y}`;
    var attributes = {
      id: id,
      name: name,
      x: x,
      y: y
    };

    this.session.run(cypher, attributes).then(
      () => {
        var parameterQueries = [];

        parameters.forEach(
          function (parameter) {
            var cypher = `
MATCH (s:Stream { uuid: {streamId} })-[:parameter]->(pi:ParameterInstance),
      (pi)-[:instance_of]->(pd:ParameterDefinition)
WHERE pd.uuid = {paramId}
SET pi.value = {value}`;
            var attributes = {
              streamId: id,
              paramId: parameter.id,
              value: parameter.value
            };
            parameterQueries.push(self.session.run(cypher, attributes));
          }
        );

        Promise.all(parameterQueries).then(
          () => {
            this.runGetQuery(programId, id, relation, type).then(
              this.sendUpdateToClient()
            ).then(
              () => {
                if (callback) {
                  callback();
                }
              }
            );
          }
        ).catch(logwrapper("ParameterizedStreamDao.update"));
      }
    );
  }

  getFromDb(programId, id, relation, type, callback) {
    return () => this.runGetQuery(programId, id, relation, type, callback);
  }

  runGetQuery(programId, streamId, relation, type) {
    var cypher = `
MATCH (s:Stream)-[r:program]->(p:Program),
      (s)-[:draw_at]->(d:Draw) 
WHERE p.uuid = {programId} `;

    if (streamId) {
      cypher += `  AND s.uuid = {streamId} `;
    }

    cypher += `OPTIONAL MATCH (s)-[:${relation}]->(item:${type})
                  OPTIONAL MATCH (s)-[:parameter]->(pi:ParameterInstance),
                                 (pi)-[:instance_of]->(pd:ParameterDefinition),
                                 (pd)-[:type]->(type:Type)
                  OPTIONAL MATCH (s)-[:actuator]->(am:Actuator)
                  RETURN { 
                           programId: p.uuid,
                           name: s.name, 
                           id: s.uuid, 
                           x: d.x, 
                           y: d.y, 
                           ${relation}Id: item.uuid,
                           ${relation}Name: item.name, 
                           parameters: collect({
                               value: pi.value,
                               name: pd.name,
                               type: type.name,
                               id: pd.uuid,
                               options: pd.values
                           }) 
                  } as stream`;

    var parameters = {programId: programId};

    if (streamId) {
      parameters.streamId = streamId;
    }

    return this.session.run(cypher, parameters);
  }

  sendUpdateToClient() {
    return this.sender.getSendMethod(
      (record) => {
        var stream = record.get("stream");

        return this.mapUpdateStream(stream);
      }
    );
  }

  mapAddStream(item) {
    let stream = this.mapStream(item);

    stream.action = "add";

    return stream;
  }

  mapUpdateStream(item) {
    let stream = this.mapStream(item);

    stream.action = "update";

    return stream;
  }
}

module.exports = ParameterizedStreamDao;
