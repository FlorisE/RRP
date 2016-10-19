var sender = require('./sender');
var uuid = require('node-uuid');
var stream = require('./stream');

class Operator {
    constructor(id, io, session) {
        this.id = id;
        this.io = io;
        this.session = session;
        this.sender = sender(id, io);
        this.streamModule = new stream(id, io, session);
    }

    sendToClient() {
        return this.sender(
            (record) => this._mapRelation(record.get("relation"))
        );
    }

    sendAvailableToClient() {
        return this.sender(this._mapOperations);
    }

    getFromDbWithHelper(programId) {
        return () => {
            var cypher = `MATCH (s1:Stream)-[:in]->(o:Operation),
                                (o)-[:out]->(s2:Stream), 
                                (o)-[:helper]->(l:Helper),
                                (s1:Stream)-[r2]->(p:Program) 
                          WHERE p.uuid = '${programId}'  
                          OPTIONAL MATCH (o)-[:draw_at]->(d:Draw)
                          RETURN {source: collect(s1.uuid), 
                                  destination: s2.uuid, 
                                  name: o.name, 
                                  id: o.uuid, 
                                  helperId: l.uuid,
                                  helperName: l.name, 
                                  x: d.x, 
                                  y: d.y} as relation`;
            return this.session.run(cypher);
        };
    }

    getFromDbWithBody(programId) {
        return () => {
            var cypher = `MATCH (s1:Stream)-[r]->(s2), 
                                (s1:Stream)-[r2]->(p:Program), 
                                (ops {name: 'Available operators'}) 
                          WHERE type(r) IN labels(ops) 
                            AND p.uuid = '${programId}' 
                          RETURN {source: s1.uuid, 
                                  destination: s2.uuid, 
                                  name: type(r), 
                                  body: r.body, 
                                  id: r.uuid, 
                                  rate: r.rate} as relation`;
            return this.session.run(cypher);
        };
    }

    getAvailableFromDb() {
        return () => this.session.run(
            `MATCH (n {name: 'Available operators'}) 
             RETURN labels(n) as labels`
        );
    }

    add(msg, callback) {
        this.match = "MATCH (source:Stream), (program:Program) ";
        this.where = `WHERE source.uuid = '${msg.sourceId}' 
                        AND program.uuid = '${msg.programId}' `;

        this.create = `CREATE ( dest:Stream 
                           { 
                              uuid: '${uuid.v4()}',
                              name: '${msg.name}' 
                           }
                       )-[:program]->(program), 
                       (dest)-[:draw_at]->(draw:Draw {x: ${msg.x}, y: ${msg.y}}), `;

        var operators = new Map([
            ["timestamp", this.addTimestamp],
            ["map", this.addWithHelperOrBody],
            ["filter", this.addWithHelperOrBody],
            ["sample", this.addSample],
            ["subscribe", this.addSubscribe]]
        );

        var foundOp = operators.get(msg.operator).bind(this);

        if (foundOp !== undefined) {
            foundOp(msg, callback);
        } else {
            console.log(msg.operator);
        }
    }

    update(msg) {
        this.match = `MATCH (src:Stream)-[op]->(dst:Stream), 
                                 (src)-[:program]->(program:Program), 
                                 (dst)-[:program]->(program) `;
        this.where = `WHERE src.uuid = {sourceId}
                             AND dst.uuid = {destinationId}
                             AND program.uuid = {programId} `;
        this.set = `SET dst.name = {name}`;

        var operators = new Map([
            ["timestamp", this.editTimestamp],
            ["map", this.editMap],
            ["filter", this.editFilter],
            ["sample", this.editSample],
            ["subscribe", this.editSubscribe]
        ]);

        var foundOp = operators.get(msg.operator).bind(this);

        if (foundOp !== undefined) {
            foundOp();
        } else {
            console.log(msg.operator);
        }
    }

    getActuatorReturnPart(label) {
        return `(source)-[r:${label}]->(dest)
                RETURN 
                {
                 id: dest.uuid,
                 name: dest.name,
                 x: draw.x, 
                 y: draw.y, 
                 actuatorName: am.name,
                 programId: program.uuid
                } as retdest, 
                {
                 source: source.uuid, 
                 destination: dest.uuid, 
                 name: type(r), 
                 id: r.uuid, 
                 body: r.body, 
                 rate: r.rate 
                } as relation`;
    }

    getOpPart(label) {
        return `(source)-[r:${label}]->(dest) 
            RETURN 
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
             name: type(r),
             id: r.uuid, 
             body: r.body, 
             rate: r.rate 
            } as relation`;
    }

    addTimestamp(msg, callback) {
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getOpPart(
            `${msg.operator} {uuid: '${uuid.v4()}'}`
        );
        this.finishAdd(callback);
    }

    addWithBody(body, operator, callback) {
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getOpPart(`${operator} {body: '${body}', uuid: '${uuid.v4()}'}`);
        this.finishAdd(callback);
    }

    addWithHelper(helper, sourceId, programId, operator, callback) {
        this.match = `MATCH (src:Stream)-[:program]->(program:Program), 
                                (helper:Helper) `;
        this.where = `WHERE src.uuid = '${sourceId}'
                        AND program.uuid = '${programId}'
                        AND helper.uuid = '${helper}' `;
        this.create += ` (op:Operation:${operator} 
                          {name: '${operator}', uuid: '${uuid.v4()}'}), 
                       (src)-[:in]->(op)-[:out]->(dest),
                       (op)-[:helper]->(helper)`;
        this.return = `RETURN {id: dest.uuid, 
                               name: dest.name, 
                               x: draw.x, 
                               y: draw.y,
                               programId: program.uuid
                              } as retdest, 
                              {source: src.uuid, 
                                 destination: dest.uuid, 
                                 name: op.name, 
                                 id: op.uuid, 
                                 helperName: helper.name, 
                                 x: op.x, 
                                 y: op.y} as relation`;
        this.cypher = this.match + this.where + this.create + this.return;

        this.finishAdd(callback);
    }

    addWithHelperOrBody(msg, callback) {
        if (msg.helper != null) {
            this.addWithHelper(
                msg.helper, msg.sourceId, msg.programId, msg.operator, callback
            );
        } else {
            this.addWithBody(msg.body, msg.operator, callback);
        }
    }

    addSample(msg, callback) {
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getOpPart(
            `${msg.operator} {rate: ${msg.rate}, uuid: '${uuid.v4()}'}`
        );
        this.finishAdd(callback);
    }

    addSubscribe(msg, callback) {
        this.match += ", (am:ActuationModule) ";
        this.where += " AND am.uuid = '" + msg.actuatorId + "' ";
        this.create += "(dest)-[:actuator]->(am), ";
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getActuatorReturnPart(
          `${msg.operator} {uuid: '${uuid.v4()}'}`
        );
        this.finishAdd(callback);
    }

    finishAdd(callback) {
        this.session.run(this.cypher).then(
            function(results) {
                var stream = results.records[0].get("retdest");
                var mappedStream = this._mapStreamAdd(stream);
                this.io.emit(this.id, [mappedStream]);
                var relation = results.records[0].get("relation");
                var mappedRelation = this._mapRelation(relation);
                this.io.emit(this.id, [mappedRelation]);
                if (callback) {
                    callback();
                }
            }.bind(this),
            function(msg) {
                var field = msg.fields[0];
                console.log(`add operator ${field.code}: ${field.message}`);
            }
        );
    }

    finishEdit(msg, callback) {
        var parameters = {
            name: msg.name,
            sourceId: msg.sourceId,
            destinationId: msg.destinationId,
            programId: msg.programId
        };

        this.session.run(this.cypher, parameters).then(
            function(results) {
                var stream = results.records[0].get("retdest");
                var mappedStream = this._mapStreamUpdate(stream);
                this.io.emit(this.id, [mappedStream]);
                var relation = results.records[0].get("relation");
                var mappedRelation = this._mapRelationUpdate(relation);
                this.io.emit(this.id, [mappedRelation]);
                if (callback) {
                    callback();
                }
            }.bind(this),
            (msg) => console.log("edit operator: " + msg)
        );
    }

    editTimestamp() {
        this.cypher = this.match + this.where + this.set;
        this.finishEdit();
    }

    editMap() {

    }

    editFilter() {

    }

    editSample() {

    }

    editSubscribe() {

    }

    updateNAry(msg) {
        var cypher = `MATCH (o:Operation {uuid: {uuid}})-[:draw_at]->(d:Draw)
                      SET d.x = {x}, d.y = {y}`;
        var params = {
            uuid: msg.id,
            x: msg.x,
            y: msg.y
        };

        this.session.run(cypher, params);
    }

    _mapStreamAdd(item) {
        return this.streamModule._mapAddStream(item);
    }

    _mapRelationInternal(record) {
        var ret = {
            type: "operation",
            action: record.action,
            name: record.name,
            source: record.source,
            destination: record.destination,
            id: record.id,
        };
        if (ret.name === "sample") {
            ret.rate = record.rate.low ? record.rate.low : record.rate;
        } else if (ret.name === "combine") {
            ret.x = record.x.low ? record.x.low : record.x;
            ret.y = record.y.low ? record.y.low : record.y;
            ret.helper = record.helper;
        } else if (ret.name === "filter" || ret.name === "map") {
            ret.body = record.body;
            ret.helperId = record.helperId;
            ret.helperName = record.helperName;
        } else if (ret.name === "subscribe" || ret.name === "timestamp") {
        } else {
            console.log(ret.name);
        }
        return ret;
    }

    _mapRelation(record) {
        record.action = "add";
        return this._mapRelationInternal(record);
    }

    _mapRelationUpdate(record) {
        record.action = "update";
        return this._mapRelationInternal(record);
    }

    _mapOperations(record) {
        return {
            type: "operations",
            action: "add",
            operations: record.get("labels")
        }
    }
}

module.exports = Operator;