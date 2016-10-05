var mappers = require('./mappers');
var sender = require('./sender');
var uuid = require('node-uuid');

class Operator {
    constructor(id, io, session) {
        this.id = id;
        this.io = io;
        this.session = session;
        this.sender = sender(id, io);
        this.maps = mappers.Mappers;
    }

    sendToClient() {
        return this.sender(
            (record) => this.maps.mapRelation(record.get("relation"))
        );
    }

    sendAvailableToClient() {
        return this.sender(this.maps.mapOperations);
    }

    getFromDbWithHelper(programId) {
        return () => {
            var cypher = `MATCH (s1:Stream)-[:in]->(o:Operation),
                                (o)-[:out]->(s2:Stream), 
                                (o)-[:lambda]->(l:Lambda),
                                (s1:Stream)-[r2]->(p:Program) 
                          WHERE p.uuid = '${programId}'  
                          OPTIONAL MATCH (o)-[:draw_at]->(d:Draw)
                          RETURN {source: s1.uuid, 
                                  destination: s2.uuid, 
                                  name: o.name, 
                                  id: o.uuid, 
                                  lambdaId: l.uuid,
                                  lambdaName: l.name, 
                                  x: d.x, 
                                  y: d.y} as relation`;
            return this.session.run(cypher);
        };
    }

    getFromDbWithLambda(programId) {
        return () => {
            var cypher = `MATCH (s1:Stream)-[r]->(s2), 
                                (s1:Stream)-[r2]->(p:Program), 
                                (ops {name: 'Available operators'}) 
                          WHERE type(r) IN labels(ops) 
                            AND p.uuid = '${programId}' 
                          RETURN {source: s1.uuid, 
                                  destination: s2.uuid, 
                                  name: type(r), 
                                  lambda: r.lambda, 
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

    add(msg) {
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

        var operators = new Map(
            ["timestamp", this.addTimestamp],
            ["map", this.addWithHelperOrLambda],
            ["filter", this.addWithHelperOrLambda],
            ["sample", this.addSample],
            ["subscribe", this.addSubscribe]
        );

        var foundOp = operators.get(msg.operator);

        if (foundOp !== undefined) {
            foundOp(msg);
        } else {
            console.log(msg.operator);
        }
    }

    edit(msg) {
        this.match = `MATCH (src:Stream)-[op]->(dst:Stream), 
                                 (src)-[:program]->(program:Program), 
                                 (dst)-[:program]->(program) `;
        this.where = `WHERE src.uuid = {sourceId}
                             AND dst.uuid = {destinationId}
                             AND program.uuid = {programId} `;
        this.set = `SET dst.name = {name}`;

        var operators = new Map(
            ["timestamp", this.editTimestamp],
            ["map", this.editMap],
            ["filter", this.editFilter],
            ["sample", this.editSample],
            ["subscribe", this.editSubscribe]
        );

        var foundOp = operators.get(msg.operator);

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
                 actuatorName: am.name 
                } as retdest, 
                {
                 source: source.uuid, 
                 destination: dest.uuid, 
                 name: type(r), 
                 id: r.uuid, 
                 lambda: r.lambda, 
                 rate: r.rate 
                } as relation`;
    }

    getOpPart(label) {
        return `(source)-[r:${label} {uuid: '${uuid.v4()}'}]->(dest) 
            RETURN 
            {
             id: dest.uuid, 
             name: dest.name, 
             x: draw.x,
             y: draw.y 
            } as retdest, 
            {
             source: source.uuid, 
             destination: dest.uuid, 
             name: type(r),
             id: r.uuid, 
             lambda: r.lambda, 
             rate: r.rate 
            } as relation`;
    }

    addTimestamp(msg) {
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getOpPart(msg.operator);
        this.finishAdd();
    }

    addWithLambda(lambda, operator) {
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getOpPart(`${operator} {lambda: '${lambda}'}`);
        this.finishAdd();
    }

    addWithHelper(helper, sourceId, programId, operator) {
        this.match = `MATCH (src:Stream)-[:program]->(program:Program), 
                                (lambda:Lambda) `;
        this.where = `WHERE src.uuid = '${sourceId}'
                        AND program.uuid = '${programId}'
                        AND lambda.uuid = '${helper}' `;
        this.create += ` (op:Operation:${operator} 
                          {name: '${operator}'}), 
                       (src)-[:in]->(op)-[:out]->(dest),
                       (op)-[:lambda]->(lambda)`;
        this.return = `RETURN {id: dest.uuid, 
                               name: dest.name, 
                               x: draw.x, 
                               y: draw.y 
                              } as retdest, 
                              {source: src.uuid, 
                                 destination: dest.uuid, 
                                 name: op.name, 
                                 id: op.uuid, 
                                 lambdaname: lambda.name, 
                                 x: op.x, 
                                 y: op.y} as relation`;
        this.cypher = this.match + this.where + this.create + this.return;

        this.finishAdd();
    }

    addWithHelperOrLambda(msg) {
        if (msg.helper != null) {
            this.addWithHelper(
                msg.helper, msg.sourceId, msg.programId, msg.operator
            );
        } else {
            this.addWithLambda(msg.lambda, msg.operator);
        }
    }

    addSample(msg) {
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getOpPart(
            `${msg.operator} {rate: '${msg.rate}'}`
        );
        this.finishAdd(msg);
    }

    addSubscribe(msg) {
        this.match += ", (am:ActuationModule) ";
        this.where += " AND am.uuid = '" + msg.actuatorId + "' ";
        this.create += "(dest)-[:actuator]->(am), ";
        this.cypher = this.match + this.where + this.create;
        this.cypher += this.getActuatorReturnPart(msg.operator);
        this.finishAdd();
    }

    finishAdd() {
        this.session.run(this.cypher).then(
            function(results) {
                var stream = results.records[0].get("retdest");
                var mappedStream = this.maps.mapStream(stream);
                this.io.emit(this.id, [mappedStream]);
                var relation = results.records[0].get("relation");
                var mappedRelation = this.maps.mapRelation(relation);
                this.io.emit(this.id, [mappedRelation]);
            }.bind(this),
            function(msg) {
                var field = msg.fields[0];
                console.log(`add operator ${field.code}: ${field.message}`);
            }
        );
    }

    finishEdit(msg) {
        var parameters = {
            name: msg.name,
            sourceId: msg.sourceId,
            destinationId: msg.destinationId,
            programId: msg.programId
        };

        this.session.run(this.cypher, parameters).then(
            function(results) {
                var stream = results.records[0].get("retdest");
                var mappedStream = this.maps.mapStreamUpdate(stream);
                this.io.emit(this.id, [mappedStream]);
                var relation = results.records[0].get("relation");
                var mappedRelation = this.maps.mapRelationUpdate(relation);
                this.io.emit(this.id, [mappedRelation]);
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
}

module.exports = {
    Operator: Operator
};