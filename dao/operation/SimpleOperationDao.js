"use strict";
const OperationDao = require('../OperationDao');
const logwrapper = require('../../util/logwrapper');
const uuid = require("node-uuid");

class SimpleOperationDao extends OperationDao {

    constructor(session, sender, moduleFactory) {
        super(session, sender, moduleFactory);

        this.programModule = moduleFactory.getModule("Program");
        this.streamModule = moduleFactory.getModule("Stream");
    }

    get(id, callback) {
        return this.session.run(
            this.makeGetQuery(),
            { id: id }
        ).then(
            (result) => this.handleResult(result, callback),
            logwrapper("SimpleOperationDao.get")
        );
    }

    add(operation, callback) {
        const query = this.makeAddQuery();
        const params = this.makeAddParams(operation);

        let promise = this.session.run(
            query, params
        );

        return this.finishAdd(promise, callback);
    }

    save(operation, callback) {
        const query = this.makeSaveQuery();
        const params = this.makeSaveParams(operation);

        let promise = this.session.run(
            query, params
        );

        this.finishEdit(promise, callback);
    }

    handleResult(result, callback) {
        if (result.records.length === 0) {
            throw "No record found";
        }
        const record = result.records[0];

        const id = record.get("id");

        const programPromise = this.programModule.get(
            record.get("programId")
        );

        const sourcePromise = this.streamModule.get(
            record.get("sourceId")
        );

        const destinationPromise = this.getDestination(
            record.get("destinationId")
        );

        Promise.all(
            [ sourcePromise, destinationPromise, programPromise ]
        ).then(
            ([source, destination, program]) => {
                this.getModelFromRecord(
                    id, source, destination, program, record, callback
                );
            }
        ).catch(logwrapper("OperationDao.get"));
    }

    getModelFromRecord(source, destination, program, record, callback) {
        throw "getModelFromRecord is abstract";
    }

    makeAddQuery(type, params) {
        let createParams = "";

        if (params) {
            createParams = params + ", ";
        }

        return `
MATCH (source:Stream { uuid: {sourceId} }),
      (source)-[:program]->(program:Program),
      (dest:Stream { uuid: {destinationId} }),
      (dest)-[:draw_at]->(draw:Draw)
CREATE (source)-[op:${type} { ${createParams} uuid: {id} }]->(dest)
RETURN ${this.streamDao.simpleReturnPart("dest", "draw", "program")} as retdest,
       ${this.returnPart("source", "dest", "op")} as relation`
    }

    makeGetQuery(type, params) {
        let returnParams = "";

        if (params) {
            returnParams = params + ",";
        }

        return `
MATCH (source)-[operation:${type} { uuid: {id} }]->(destination),
      (source)-[:program]->(program)
RETURN operation.uuid as id,
       ${returnParams}
       program.uuid as programId,
       source.uuid as sourceId,
       destination.uuid as destinationId`;
    }

    makeSaveQuery(type, params) {
        let getParams = "";

        if (params) {
            getParams = ", " + params;
        }

        return `
MATCH (source)-[operation:${type} { uuid: {id} }]->(destination),
      (destination)-[:draw_at]->(draw:Draw),
      (source)-[:program]->(program)
SET destination.name = {destinationName}
    ${getParams}
RETURN ${this.streamDao.simpleReturnPart("destination", "draw", "program")} as retdest,
       ${this.returnPart("source", "destination", "operation")} as relation`
    }

    makeAddParams(operation) {
        return {
            id: uuid.v4(),
            sourceId: operation.source.id,
            operationName: operation.name,
            destinationId: operation.destination.id
        };
    }

    makeSaveParams(operation) {
        return {
            id: operation.id,
            destinationName: operation.destination.name
        }
    }
}

module.exports = SimpleOperationDao;
