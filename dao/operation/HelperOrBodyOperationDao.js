const OperationDao = require('../OperationDao');
const uuid = require('node-uuid');
const logwrapper = require('../../util/logwrapper');
const FilterOperation = require("../../models/operation/FilterOperation");
const HelperDao = require("../HelperDao");

class HelperOrBodyOperationDao extends OperationDao {

  get(id, callback) {
    const bodyQuery = this.queryWithBody();
    const params = {id: id};

    const body = this.session.run(bodyQuery, params);

    const helperQuery = this.queryWithHelper();
    const helper = this.session.run(helperQuery, params);

    Promise.all([body, helper]).then(
      function (values) {
        let value = values.find((val) => val.records.length === 1);

        if (!value) throw `No operation found with id ${id}`;

        var record = value.records[0];

        callback((record.keys.indexOf("helper") > 0) ?
          this.mapHelper(record) :
          this.mapBody(record)
        );
      }.bind(this)
    ).catch(logwrapper("HelperOrBodyOperationDao.get"));
  }

  setHelper(id, helperId) {
    var query = `
MATCH (o:Operation { uuid: {id} })-[oh:helper]->(oldHelper:Helper), 
      (newHelper:Helper { uuid: {helperId} }) 
DELETE oh 
CREATE (o)-[:helper]->(newHelper)`;
    return this.session.run(
      query, {id: id, helperId: helperId}
    ).catch(
      logwrapper("HelperOrBodyOperationDao.setHelper")
    );
  }

  setBody(id, body) {
    var query = `
MATCH ()-[o { uuid: {id} }]->() 
SET o.body = {body}`;
    return this.session.run(
      query, {id: id, body: body}
    ).catch(
      logwrapper("HelperOrBodyOperationDao.setBody")
    );
  }

  helperToBody(id, body, type) {
    var query = `
MATCH (src:Stream)-[:in]->(o:Operation { uuid: {id} }),
      (o)-[:out]->(retdest:Stream),
      (o)-[hr:helper]->(:Helper)
CREATE (src)-[relation:${type} { uuid: o.uuid, body: {body} }]->(retdest)
DETACH DELETE o`;
    return this.session.run(
      query, {id: id, body: body}
    ).catch(
      logwrapper("HelperOrBodyOperationDao.helperToBody")
    );
  }

  bodyToHelper(id, helperId, type) {
    var query = `
MATCH (source)-[o { uuid: {id} }]->(destination), 
      (helper:Helper { uuid: {helperId} }),
      (ot:OperationType {name: '${type}' })
CREATE (newOp:Operation:${type} { uuid: o.uuid, name: type(o) }),
       (newOp)-[:helper]->(helper),
       (newOp)-[:type]->(ot),
       (source)-[:in]->(newOp)-[:out]->(destination)
DELETE o`;
    return this.session.run(
      query, {id: id, helperId: helperId}
    ).catch(
      logwrapper("HelperOrBodyOperationDao.bodyToHelper")
    );
  }

  addBody(operation, callback) {
    let id = uuid.v4(),
      body = operation.body,
      operationName = operation.name,
      destinationId = operation.destination.id;

    let wherePart;
    let multipleSources = false;
    if (operation.source) {
      wherePart = `source.uuid = "${operation.source.id}"`;
    } else if (operation.sources) {
      wherePart = operation.sources.map(
        (source) => `source.uuid = "${source.id}"`
      ).join(" or ");
      multipleSources = true;
    } else {
      throw "Either source or sources has to be specified.";
    }

    let cypher = `
MATCH (source:Stream),
      (source)-[:program]->(program:Program),
      (dest:Stream { uuid: {destinationId} }),
      (dest)-[:draw_at]->(draw:Draw)
WHERE ${wherePart}
CREATE (source)-[op:${operationName} { body: {body}, uuid: {id} }]->(dest)
${this.returnPartWithProperties('body: op.body', 'type(op)')}`;

    let promise = this.session.run(
      cypher,
      {
        id: id,
        body: body,
        destinationId: destinationId,
      }
    );

    return this.finishAdd(promise, callback);
  }

  addBasic(operation, callback) {
    let id = uuid.v4(),
      sourceId = operation.sources.map((source) => source.id),
      operationName = operation.name,
      destinationId = operation.destination.id;

    let cypher = `
MATCH (source:Stream { uuid: {sourceId} }),
      (source)-[:program]->(program:Program),
      (dest:Stream { uuid: {destinationId} }),
      (dest)-[:draw_at]->(draw:Draw)
CREATE (source)-[op:${operationName} { uuid: {id} }]->(dest)
${this.returnPartWithProperties('', 'type(op)')}`;

    let promise = this.session.run(
      cypher,
      {
        id: id,
        sourceId: sourceId,
        destinationId: destinationId,
      }
    );

    return this.finishAdd(promise, callback);
  }

  getOperations(programId, operationId) {
    return () => {
      var params = {
        programId: programId
      };
      if (operationId) {
        params.operationId = operationId;
      }

      var cypher = `
MATCH (p:Program { uuid: {programId} }),
      (isb:Stream)-[:program]->(p),
      (isb)-[r${operationId ? '{ uuid: {operationId} }' : ''}]->(osb:Stream),
      (ops {name: 'Available operations'}) 
WHERE type(r) IN labels(ops)
RETURN {
         sources: collect(distinct isb.uuid), 
         destinations: collect(distinct osb.uuid), 
         name: type(r), 
         body: r.body, 
         id: r.uuid, 
         rate: r.rate,
         programId: p.uuid
       } AS relation
UNION
MATCH (p:Program { uuid: {programId} }),
      (ish:Stream)-[:program]->(p),
      (ish)-[:in]->(o:Operation${operationId ? '{ uuid: {operationId} }' : ''}),
      (o)-[:out]->(osh:Stream), 
      (o)-[:type]->(t:OperationType)
OPTIONAL MATCH (o)-[:helper]->(l:Helper)
OPTIONAL MATCH (o)-[:draw_at]->(d:Draw)
RETURN { 
	sources: collect(distinct ish.uuid), 
	destinations: collect(distinct osh.uuid), 
	name: o.name, 
	id: o.uuid, 
	helperId: l.uuid,
	helperName: l.name, 
	body: o.body,
	x: d.x, 
	y: d.y,
	programId: p.uuid
} AS relation`;
      return this.session.run(cypher, params);
    }
  }

  addHelper(operation, callback) {
    let sourceId = operation.source.id,
      destinationId = operation.destination.id,
      helperId = operation.helper.id,
      operationName = operation.name;

    let cypher = `
MATCH (source:Stream { uuid: {sourceId} }),
      (source)-[:program]->(program:Program),
      (helper:Helper { uuid: {helperId} }) ,
      (dest:Stream { uuid: {destinationId} }),
      (dest)-[:draw_at]->(draw:Draw),
      (ot:OperationType {name: {operationName} })
CREATE (op:Operation:${operationName} {name: {operationName}, uuid: {id}}), 
       (source)-[:in]->(op)-[:out]->(dest),
       (op)-[:type]->(ot),
       (op)-[:helper]->(helper)
${this.returnPartWithProperties(`helperId: helper.uuid, helperName: helper.name`,
      'op.name')}`;

    let promise = this.session.run(
      cypher,
      {
        id: uuid.v4(),
        helperId: helperId,
        sourceId: sourceId,
        operationName: operationName,
        destinationId: destinationId
      }
    );

    return this.finishAdd(promise, callback);
  }

  saveBody(type, operation, callback) {
    var matchPart = `(src:Stream)-[o { uuid: {id} }]->(dst:Stream),
      (dst)-[:draw_at]->(d:Draw),
      (dst)-[:program]->(p:Program)`;
    var query = this.queryAdd(type, matchPart, false);
    this.save(query, operation, callback);
  }

  saveHelper(type, operation, callback) {
    var matchPart = `
(src:Stream)-[:in]->(o:Operation { uuid: {id} }),
(o)-[:out]->(dst:Stream),
(dst)-[:draw_at]->(d:Draw),
(dst)-[:program]->(p:Program),
(o)-[:helper]->(h:Helper)`;
    this.save(this.queryAdd(type, matchPart, true), operation, callback);
  }

  save(query, operation, callback) {
    var params = {
      id: operation.id,
      destinationName: operation.destination.name,
      x: operation.x,
      y: operation.y
    };
    return this.session.run(query, params).then(
      (result) => {
        let record = result.records[0];
        let stream = this.mapStreamUpdate(record.get("dst"));
        this.sender.send(stream);

        let operation = this.mapRelationUpdate(
          record.get("operation")
        );
        this.sender.send(operation);

        if (callback) {
          callback();
        }
      },
      logwrapper("HelperOrBodyOperationDao.save query")
    ).catch(logwrapper("HelperOrBodyOperationDao.save query processing"));
  }

  query(matchPart, returnPart) {
    return `
MATCH ${this.streamDao.buildMatchPart(null, "src", "drawSrc", "programSrc")},
      ${this.streamDao.buildMatchPart(null, "dst", "drawDst", "programDst")},
      ${matchPart}
${this.streamDao.buildOptionalMatches(
      "src", "sensorSrc", "piSrc", "pdSrc", "typeSrc", "amSrc"
    )}
${this.streamDao.buildOptionalMatches(
      "dst", "sensorDst", "piDst", "pdDst", "typeDst", "amDst"
    )}
${returnPart}`;
  }

  queryAdd(type, matchPart, isHelper) {
    let operationReturnPart;
    if (isHelper) {
      operationReturnPart = this.returnPart(
        "src", "dst", "o", "o.name",
        `helperId: h.uuid, helperName: h.name`
      );
    } else {
      operationReturnPart = this.returnPart(
        "src", "dst", "o", "type(o)",
        `body: o.body`
      );
    }
    return `
MATCH ${matchPart}
SET dst.name = {destinationName}
RETURN ${this.streamDao.simpleReturnPart("dst", "d", "p")} as dst, 
       ${operationReturnPart} as operation`;
  }

  matchPartWithBody(src, operation, dst) {
    return this.matchPart(src, operation, dst, '{uuid: {id}}');
  }

  matchPartWithHelper(src, operation, dst) {
    return `
(${src})-[:in]->(operation:${operation} {uuid: {id}}),
(operation)-[:out]->(${dst}),
(operation)-[:helper]->(helper:Helper)`;
  }

  returnPartWithBody(operation) {
    // operation is the temporary name which we use in the query
    return `
RETURN ${operation}.uuid as id,
       ${operation}.body as body,
       programSrc.uuid as programId,
       ${this.streamDao.returnPart("src", "drawSrc", "programSrc", "sensorSrc",
      "amSrc", "piSrc", "pdSrc", "typeSrc", "src")} as src, 
       ${this.streamDao.returnPart("dst", "drawDst", "programDst", "sensorDst",
      "amDst", "piDst", "pdDst", "typeDst", "dst")} as dst`;
  }

  returnPartWithHelper(operation) {
    // operation is the temporary name which we use in the query
    return `
RETURN ${operation}.uuid as id,
       ${HelperDao.returnPart("helper")} as helper,
       programSrc.uuid as programId,
       ${this.streamDao.returnPart("src", "drawSrc", "programSrc", "sensorSrc",
      "amSrc", "piSrc", "pdSrc", "typeSrc", "src")} as src, 
       ${this.streamDao.returnPart("dst", "drawDst", "programDst", "sensorDst",
      "amDst", "piDst", "pdDst", "typeDst", "dst")} as dst`;
  }

  mapBody(operation) {
    const op = this.map(operation);
    const body = operation.get("body");

    op.addBody(body);

    return op;
  }

  mapHelper(operation) {
    const op = this.map(operation);
    const helper = operation.get("helper");

    op.addHelper(helper);

    return op;
  }

  returnPartWithProperties(properties, relName) {
    let propertiesParam = "";

    if (properties) {
      propertiesParam = ", " + properties;
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
                  sources: collect(source.uuid), 
                  destinations: collect(dest.uuid), 
                  name: ${relName},
                  id: op.uuid
                  ${propertiesParam}
                } as relation`;
  }

  matchPart(src, operation, dst, parameters) {
    return `(${src})-[operation:${operation} ${parameters}]->(${dst})`;
  }

  removeInputs(operation, streamIds) {
    let matchRel = streamIds.map(
      (id, index) => `(s${index}:Stream { uuid: "${id}" })-[r${index}]->(o)`
    ).join(", ");

    let del = streamIds.map(
      (id, index) => `r${index}`
    ).join(", ");

    return this.session.run(`
      MATCH (o:Operation { uuid: {id} }),
            ${matchRel}
      DELETE ${del}`,
      { id: operation }
    );
  }

  addInputs(operation, streamIds) {
    let matchStreams = streamIds.map(
      (id, index) => `(s${index}:Stream { uuid: "${id}" })`
    ).join(", ");

    let createStreams = streamIds.map(
      (id, index) => `(s${index})-[:in]->(o)`
    ).join(", ");

    return this.session.run(`
      MATCH (o:Operation { uuid: {id} }),
            ${matchStreams}
      CREATE ${createStreams}`,
      { id: operation }
    );
  }
}

module.exports = HelperOrBodyOperationDao;

