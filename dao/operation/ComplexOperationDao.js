const OperationDao = require('../OperationDao');
const uuid = require('node-uuid');
const logwrapper = require('../../util/logwrapper');
const FilterOperation = require("../../models/operation/FilterOperation");
const HelperDao = require("../HelperDao");

class ComplexOperationDao extends OperationDao {

    get(id, callback) {
        const bodyQuery = this.queryWithBody();
        const params = { id: id };

        const body = this.session.run( bodyQuery, params );

        const helperQuery = this.queryWithHelper();
        const helper = this.session.run( helperQuery, params );

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
        ).catch(logwrapper("ComplexOperationDao.get"));
    }

    setHelper(id, helperId) {
        var query = `
MATCH (o:Operation { uuid: {id} })-[oh:helper]->(oldHelper:Helper), 
      (newHelper:Helper { uuid: {helperId} }) 
DELETE oh 
CREATE (o)-[:helper]->(newHelper)`;
        return this.session.run(
            query, { id: id, helperId: helperId }
        ).catch(
            logwrapper("ComplexOperationDao.setHelper")
        );
    }

    setBody(id, body) {
        var query = `
MATCH ()-[o { uuid: {id} }]->() 
SET o.body = {body}`;
        return this.session.run(
            query, { id: id, body: body }
        ).catch(
            logwrapper("ComplexOperationDao.setBody")
        );
    }

    helperToBody(id, body, type) {
        var query = `
MATCH (src:Stream)-[:in]->(o:Operation { uuid: {id} }),
      (o)-[:out]->(retdest:Stream),
      (o)-[hr:helper]->(:Helper)
DELETE hr
CREATE (src)-[relation:${type} { uuid: o.uuid, body: {body} }]->(retdest)`;
        return this.session.run(
            query, { id: id, body: body }
        ).catch(
            logwrapper("ComplexOperationDao.helperToBody")
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
            query, { id: id, helperId: helperId }
        ).catch(
            logwrapper("ComplexOperationDao.bodyToHelper")
        );
    }

    addBody(operation, callback) {
        let id = uuid.v4(),
            body = operation.body,
            sourceId = operation.source.id,
            operationName = operation.name,
            destinationId = operation.destination.id;

        let cypher = `
MATCH (source:Stream { uuid: {sourceId} }),
      (source)-[:program]->(program:Program),
      (dest:Stream { uuid: {destinationId} }),
      (dest)-[:draw_at]->(draw:Draw)
CREATE (source)-[op:${operationName} { body: {body}, uuid: {id} }]->(dest)
${this.returnPartWithProperties('body: op.body', 'type(op)')}`;

        let promise = this.session.run(
            cypher,
            {
                id: id,
                body: body,
                sourceId: sourceId,
                destinationId: destinationId,
            }
        );

        return this.finishAdd(promise, callback);
    }

    getOperationWithBody(programId, operationId) {
        return () => {
            var params = {
                programId: programId
            };

            var match = `
MATCH (s1:Stream)-[r]->(s2), 
      (s1:Stream)-[r2]->(p:Program), 
      (ops {name: 'Available operations'}) `;
            var where = `
WHERE type(r) IN labels(ops)
  AND p.uuid = {programId}`;
            var returnV = `
RETURN {
         source: s1.uuid, 
         destination: s2.uuid, 
         name: type(r), 
         body: r.body, 
         id: r.uuid, 
         rate: r.rate
       } as relation`;

            if (operationId) {
                params.operationId = operationId;
                where += ` AND s1.uuid = {operationId} `;
            }

            var cypher = match + where + returnV;
            return this.session.run(cypher, params);
        };
    }

    getOperationWithHelper(programId, operationId) {
        return () => {
            var params = {
                programId: programId
            };

            var match = `MATCH (s1:Stream)-[:in]->(o:Operation),
                         (o)-[:out]->(s2:Stream), 
                         (o)-[:helper]->(l:Helper),
                         (s1:Stream)-[r2]->(p:Program),
                         (o)-[:type]->(t:OperationType) `;
            var where = ` WHERE p.uuid = {programId} `;
            var optionalMatch = ` OPTIONAL MATCH (o)-[:draw_at]->(d:Draw) `;
            var returnV = `RETURN {
                              source: 
                                CASE 
                                  WHEN t.in = '1' THEN s1.uuid 
                                                  ELSE collect(s1.uuid) 
                                end, 
                              destination: s2.uuid, 
                              name: o.name, 
                              id: o.uuid, 
                              helperId: l.uuid,
                              helperName: l.name, 
                              x: d.x, 
                              y: d.y} as relation`;

            if (operationId) {
                params.operationId = operationId;
                where += ` AND s1.uuid = {operationId} `;
            }

            var cypher = match + where + optionalMatch + returnV;
            return this.session.run(cypher, params);
        };
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
            destinationName: operation.destination.name
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
            logwrapper("ComplexOperationDao.save query")
        ).catch(logwrapper("ComplexOperationDao.save query processing"));
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
                  source: source.uuid, 
                  destination: dest.uuid, 
                  name: ${relName},
                  id: op.uuid
                  ${propertiesParam}
                } as relation`;
    }

    matchPart(src, operation, dst, parameters) {
        return `(${src})-[operation:${operation} ${parameters}]->(${dst})`;
    }
}

module.exports = ComplexOperationDao;

