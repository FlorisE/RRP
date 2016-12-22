const logwrapper = require("../util/logwrapper");
const Helper = require("../models/Helper");
const uuid = require('node-uuid');

class HelperDao {
    constructor(session, sender) {
        this.session = session;
        this.sender = sender;
    }

    getAll() {
        return this.session.run(
            `MATCH (h:Helper) 
             RETURN ${HelperDao.returnPart("h")} as helper`
        );
    }

    get(id, resolve, reject) {
        return this.session.run(
            `MATCH (h:Helper { uuid: {id} }) 
             RETURN ${HelperDao.returnPart("h")} as helper`,
            { id: id }
        ).then(
            (results) => this.mapGet(results, resolve),
            reject
        );
    }

    mapGet(results, resolve) {
        const helper = results.records[0].get("helper");
        resolve(new Helper(helper.id, helper.name, helper.body));
    }

    add(name, body, callback) {
        var cypher = `
CREATE (h:Helper { name: {name}, body: {body}, uuid: {uuid}}) 
RETURN ${HelperDao.returnPart("h")} as helper`;
        var parameters = {
            name: name,
            body: body,
            uuid: uuid.v4()
        };
        return this.session.run(
            cypher, parameters
        ).then(
            (record) => {
                let helper = HelperDao.addHelper(record.get("helper"));
                this.sender.send(helper, callback);
            },
            console.log
        );
    }

    update(id, name, body, callback) {
        var cypher = `
MATCH (h:Helper) 
WHERE h.uuid = {id}
SET h.name = {name}, 
    h.body = {body}
RETURN ${HelperDao.returnPart("h")} as helper`;
        var parameters = {
            id: id,
            name: name,
            body: body
        };
        return this.session.run(cypher, parameters).catch(console.log).then(
            (record) => {
                let helper = HelperDao.addHelper(record.get("helper"));
                this.sender.send(helper, callback);
            },
            console.log
        );
    }

    sendToClient(programId) {
        return (result) => {
            let helperRecords = result.records.map((record) => record.get("helper"));
            let helpers = helperRecords.map(HelperDao.addHelper);
            this.sender.send(helpers);
        };
    }

    static returnPart(helper) {
        return `{
            id: ${helper}.uuid,
            name: ${helper}.name,
            body: ${helper}.body
        }`;
    }

    static mapHelper(helper) {
        return {
            type: "helper",
            action: helper.action,
            id: helper.id,
            name: helper.name,
            body: helper.body
        }
    }

    static addHelper(helper) {
        helper.action = "add";
        return HelperDao.mapHelper(helper);
    }

    static updateHelper(helper) {
        helper.action = "update";
        return HelperDao.mapHelper(helper);
    }
}

module.exports = HelperDao;
