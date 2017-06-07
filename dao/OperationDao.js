const uuid = require('node-uuid');
const logwrapper = require('../util/logwrapper');

class OperationDao {

  constructor(session, sender, moduleFactory) {
    this.session = session;
    this.sender = sender;
    this.moduleFactory = moduleFactory;
    this.streamDao = moduleFactory.loadDao("Stream");
  }

  remove(id, callback) {
    let query = `
OPTIONAL MATCH (complexOp:Operation { uuid: {uuid} }) 
OPTIONAL MATCH (:Stream)-[directOp { uuid: {uuid} }]->(:Stream) 
DETACH DELETE complexOp 
DELETE directOp`;
    this.session.run(query, {uuid: id}).then(
      () => {
        if (callback) callback();
      }
    );
  }

  sendOperation(relationMapper, operation) {
    var relations = operation.map(relationMapper);
    this.sender.send(relations);
  }

  sendDestinations(streamMapper, destinations) {
    var streams = destinations.map(streamMapper);
    this.sender.send(streams);
  }

  sendFor(streamMapper=null, relationMapper=null) {
    return (results) => {
      if (streamMapper !== null) {
        this.sendDestinations(
          streamMapper,
          results.records.map(
            (record) => record.get("retdest")
          )
        );
      }

      if (relationMapper !== null) {
        this.sendOperation(
          relationMapper,
          results.records.map(
            (record) => record.get("relation")
          )
        );
      }
    }
  }

  getAvailable() {
    return () => this.session.run(`
MATCH (n {name: 'Available operations'})-[:operator]->(op)
RETURN op.name as name, op.input as input, op.output as output, op.description as description`
    );
  }

  mapOperations(record) {
    return {
      type: "operations",
      action: "add",
      name: record.get("name"),
      input: record.get("input"),
      output: record.get("output"),
      description: record.get("description")
    }
  }

  returnPart(src, dst, operation, name, params = "") {
    // combine params: `x: ${operation}.x, y: ${operation}.y`
    if (params && params !== "") {
      params = ", " + params;
    }

    return `
{
    id: ${operation}.uuid,
    name: ${name},
    sources: collect(${src}.uuid),
    destinations: collect(${dst}.uuid)
    ${params}
}`;
  }

  sendToClient() {
    return this.sender.getSendMethod(
      (record) => this.mapRelationAdd(record.get("relation"))
    );
  }

  finishAdd(promise, callback) {
    return this.finish(
      this.mapStreamAdd.bind(this), this.mapRelationAdd.bind(this),
      promise, callback
    );
  }

  finishEdit(promise, callback) {
    return this.finish(
      this.mapStreamUpdate.bind(this), this.mapRelationUpdate.bind(this),
      promise, callback
    );
  }

  finish(streamMapper, relationMapper, promise, callback) {
    return promise.then(
      this.sendFor(
        streamMapper, relationMapper
      ).bind(this),
      logwrapper("OperationDao.finish:promise")
    ).then(
      () => {
        if (callback) callback();
      },
      logwrapper("OperationDao.finish:send")
    ).catch(logwrapper("OperationDao.finish:callback"));
  }

  mapStreamAdd(item) {
    return this.streamDao.mapAddStream(item);
  }

  mapStreamUpdate(item) {
    return this.streamDao.mapUpdateStream(item);
  }

  mapRelationAdd(record) {
    record.action = "add";
    return this.mapRelationInternal(record);
  }

  mapRelationUpdate(record) {
    record.action = "update";
    return this.mapRelationInternal(record);
  }

  mapRelationInternal(record) {
    var ret = {
      type: "operation",
      action: record.action,
      name: record.name,
      sources: record.sources,
      destinations: record.destinations,
      id: record.id,
      programId: record.programId,
      x: record.x,
      y: record.y
    };

    if (ret.name === "sample" || ret.name === "forgetAfter") {
      ret.rate = record.rate.low ? record.rate.low : record.rate;
    }

    if (ret.name === "combine" || ret.name === "merge") {
      ret.x = record.x.low ? record.x.low : record.x;
      ret.y = record.y.low ? record.y.low : record.y;
    }

    if (ret.name === "filter" ||
        ret.name === "map" ||
        ret.name === "combine")
    {
      ret.body = record.body;
      ret.helperId = record.helperId;
      ret.helperName = record.helperName;
    }

    if (ret.name === "subscribe" || ret.name === "timestamp") {}

    return ret;
  }
}

module.exports = OperationDao;
