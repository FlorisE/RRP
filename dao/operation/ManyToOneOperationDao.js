const HelperOrBodyOperationDao = require("./HelperOrBodyOperationDao");
const StreamDao = require("../StreamDao");
const logwrapper = require("../../util/logwrapper");
const uuid = require('node-uuid');

class ManyToOneOperationDao extends HelperOrBodyOperationDao {

  get(id, operation, callback) {
    return this.session.run(`
MATCH (o:Operation:${operation} { uuid: {id} }),
      (o)-[:draw_at]->(draw:Draw),
      (in:Stream)-[:in]->(o), 
      (in)-[:draw_at]->(ind:Draw),
      (o)-[:out]->(out:Stream), 
      (out)-[:draw_at]->(outd:Draw),
      (o)-[:type]->(ot:OperationType),
      (out)-[:program]->(p:Program) 
OPTIONAL MATCH (o)-[:helper]->(h:Helper)
OPTIONAL MATCH (in)-[:sensor]->(s:Sensor)
OPTIONAL MATCH (in)-[:actuator]->(a:Actuator)
OPTIONAL MATCH (out)-[:sensor]->(outs:Sensor)
OPTIONAL MATCH (out)-[:actuator]->(outa:Actuator)
OPTIONAL MATCH (out)-[:parameter]->(pi:ParameterInstance),
               (pi)-[:instance_of]->(pd:ParameterDefinition),
               (pd)-[:type]->(type:Type)
RETURN {
  id: o.uuid, 
  body: o.body,
  inStreams: collect(
  {
    id: in.uuid,
    name: in.name,
    x: ind.x,
    y: ind.y,
    program: p.uuid,
    sensor: s.uuid,
    actuator: a.uuid
  }),
  outStream: {
    id: out.uuid,
    name: out.name,
    x: outd.x,
    y: outd.y,
    program: p.uuid,
    sensor: outs.uuid,
    actuator: outa.uuid
  }, 
  helper: CASE WHEN h IS NOT NULL THEN {
      id: h.uuid, 
      name: h.name
  } ELSE NULL END,
  type: ot,
  programId: p.uuid, 
  sensorId: outs.uuid,
  sensorName: outs.name, 
  actuatorId: outa.uuid,
  actuatorName: outa.name,
  parameters: collect({
      value: pi.value,
      name: pd.name,
      type: type.name,
      id: pd.uuid
  }),
  x: draw.x,
  y: draw.y
} as record`,
      { id: id }
    ).then(
      (value) => {
        if (value.records.length !== 1) throw `No operation found with id ${id}`;

        var record = value.records[0].get("record");

        if (callback) {
          if (record.helper) {
            callback(this.mapHelper(record));
          } else if (record.body) {
            callback(this.mapBody(record))
          } else {
            callback(this.map(record))
          }
        }
      },
      logwrapper("ManyToOneOperationDao.get:Query")
    );
  }

  mapHelper(operation) {
    const op = this.map(operation);
    const helper = operation.helper;

    op.addHelper(helper);

    return op;
  }

  mapBody(operation) {
    const op = this.map(operation);
    const body = operation.body;

    op.addBody(body);

    return op;
  }

  saveBody(operation, callback) {
    var query = `
MATCH (o:Operation {uuid: {id} })-[:draw_at]->(d:Draw) 
SET o.name = {name},
    o.body = {body}
    d.x = {x},
    d.y = {y}`;
    let parameters = {
      id: operation.id,
      name: operation.name,
      x: operation.x,
      y: operation.y,
      body: operation.body
    };

    return this.saveAndSend(query, parameters, operation, callback);
  }

  saveHelper(operation, callback) {
    var query = `
MATCH (o:Operation {uuid: {id} })-[:draw_at]->(draw:Draw),
      (o)-[:out]->(dest:Stream)
SET o.name = {name},
    draw.x = {x},
    draw.y = {y},
    dest.name = {destinationName}`;
    let parameters = {
      id: operation.id,
      name: operation.name,
      x: operation.x,
      y: operation.y,
      destinationName: operation.destination.name
    };

    return this.saveAndSend(query, parameters, operation, callback);
  }

  saveAndSend(query, parameters, operation, callback) {
    return this.session.run(query, parameters).then(
      this.get(
        operation.id,
        (record) => this.add(
          record,
          () => this.sendUpdate(record)
        )
      ),
      logwrapper("ManyToOneOperationDao.saveAndSend:Query")
    ).then(
      () => {
        if (callback) {
          callback();
        }
      },
      logwrapper("ManyToOneOperationDao.saveAndSend:sendResult")
    ).catch(
      logwrapper("ManyToOneOperationDao.saveAndSend:Callback")
    );
  }

  saveRegular(operation, callback) {
    let query = `
MATCH (o:Operation {uuid: {id} })-[:draw_at]->(d:Draw),
      (o)-[:out]->(s:Stream)
SET d.x = {x},
    d.y = {y},
    s.name = {destinationName}`;
    let params = {
      id: operation.id,
      x: operation.x,
      y: operation.y,
      destinationName: operation.destination.name
    };
    this.saveAndSend(query, params, operation, callback);
  }

  mapStreamUpdate(item) {
    return this.streamDao.mapUpdateStream(item);
  }

  add(operation, callback) {
    let sourceIds = operation.sources.map((stream) => stream.id);

    let sourcesQuery = "";
    let linkSources = "";
    let returnSources = "";
    for (let i = 0; i < sourceIds.length; i++) {
      if (i != 0) {
        sourcesQuery += ', ';
        linkSources += ', ';
        returnSources += ', ';
      }

      sourcesQuery += `(source${i}:Stream { uuid: "${sourceIds[i]}" })`;
      linkSources += `(source${i})-[:in]->(op)`;
      returnSources += "source" + i + ".uuid";
    }

    let cypher = this.getCreateQuery(
      sourcesQuery, operation, operation.name, linkSources, returnSources
    );

    let params = {
      id: uuid.v4(),
      operationName: operation.name,
      destinationId: operation.destination.id,
      opx: operation.x,
      opy: operation.y
    };

    if (operation.hasHelper()) {
      params.helperId = operation.helper.id;
    }

    if (operation.hasBody()) {
      params.body = operation.body;
    }

    let promise = this.session.run(
      cypher,
      params
    );

    return this.sendAdd(promise, callback);
  }

  getCreateQuery(sourcesQuery, operation, operationName, linkSources, returnSources) {
    return `
MATCH ${sourcesQuery},
      (program:Program { uuid: "${operation.program.id}"}),
      ${operation.hasHelper() ? '(helper:Helper { uuid: {helperId} }) ,' : ''}
      (dest:Stream { uuid: {destinationId} }),
      (dest)-[:draw_at]->(draw:Draw),
      (ot:OperationType {name: {operationName} })
CREATE (op:Operation:${operationName} {name: {operationName}, uuid: {id} ${operation.hasBody() ? ', body: {body}' : '' }}), 
       ${linkSources},
       (op)-[:out]->(dest),
       (op)-[:type]->(ot),
       ${operation.hasHelper() ? '(op)-[:helper]->(helper),' : ''}
       (op)-[:draw_at]->(opdraw:Draw { x: {opx}, y: {opy} })
${this.returnPartWithProperties(operation.hasHelper() ? `helperId: helper.uuid, helperName: helper.name` : '',
      'op.name', returnSources)}`;
  }

  sendAdd(promise, callback) {
    return this.finish(
      this.mapStreamAdd.bind(this), this.mapRelationAdd.bind(this),
      promise, callback
    );
  }

  sendUpdate(value, operation) {
    let outStream = value.destination;

    this.sender.send({
      action: "update",
      actuatorId: outStream.actuatorId,
      actuatorName: outStream.actuatorId,
      id: outStream.id,
      name: outStream.name,
      parameters: outStream.parameters ?
        outStream.parameters.map(this.streamDao.mapParameter) :
        null,
      programId: outStream.program,
      sensorId: outStream.sensorId,
      sensorName: outStream.sensorName,
      type: "stream",
      x: outStream.x,
      y: outStream.y
    });

    this.sender.send({
      id: value.id,
      action: "update",
      body: value.body,
      sources: value.sources.map((stream) => stream.id),
      destinations: [value.destination.id],
      helperId: value.helper ? value.helper.id : null,
      helperName: value.helper ? value.helper.name : null,
      name: operation,
      type: "operation",
      programId: value.program,
      x: value.x,
      y: value.y
    });
  }

  returnPartWithProperties(properties, relName, sources) {
    let propertiesParam = "";

    if (properties) {
      propertiesParam =  ", " + properties;
    }

    return `RETURN 
                {
                  id: dest.uuid, 
                  name: dest.name, 
                  x: draw.x,
                  y: draw.y,
                  programId: program.uuid
                } as retdest, 
                {
                  sources: [${sources}], 
                  destinations: collect(dest.uuid), 
                  name: ${relName},
                  id: op.uuid,
                  x: opdraw.x,
                  y: opdraw.y
                  ${propertiesParam}
                } as relation`;
  }

  setBody(id, body) {
    var query = `
MATCH (o { uuid: {id} }) 
SET o.body = {body}`;
    return this.session.run(
      query, {id: id, body: body}
    ).catch(
      logwrapper("ManyToOneOperationDao.setBody")
    );
  }
}

module.exports = ManyToOneOperationDao;
