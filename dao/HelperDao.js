const logwrapper = require("../util/logwrapper");
const Helper = require("../models/Helper");
const uuid = require('node-uuid');

class HelperDao {
  constructor(session, sender) {
    this.session = session;
    this.sender = sender;
  }

  async loadAll() {
    try {
      let runQuery = await this.session.run(
        `MATCH (h:Helper) 
         RETURN ${HelperDao.returnPart("h")} as helper`
      );
      return runQuery.records.map(
        (record) => {
          let helper = record.get("helper");
          return new Helper(helper.id, helper.name, helper.parameterName, helper.body);
        }
      );
    } catch (err) {
      console.log("HelperDao.loadAll: " + err);
    }
  }

  async get(id) {
    try {
      let runQuery = await this.session.run(
        `MATCH (h:Helper { uuid: {id} }) 
         RETURN ${HelperDao.returnPart("h")} as helper`,
        {id: id}
      );
      let helper = runQuery.records[0].get("helper");
      return new Helper(helper.id, helper.name, helper.parameterName, helper.body);
    } catch (err) {
      console.log("HelperDao.get: " + err);
    }
  }

  async add(name, parameterName, body, callback) {
    let cypher = `
CREATE (
  h:Helper { 
    name: {name}, 
    body: {body}, 
    parameterName: {parameterName}, 
    uuid: {uuid}
  }
) 
RETURN ${HelperDao.returnPart("h")} as helper`;
    let parameters = {
      name: name,
      parameterName: parameterName,
      body: body,
      uuid: uuid.v4()
    };
    try {
      let runQuery = await this.session.run(
        cypher, parameters
      );
      if (runQuery.records.length === 1) {
        let helper = runQuery.records[0].get("helper");
        this.sender.send(
          HelperDao.createHelperAddMessage(helper),
          callback
        );
      } else {
        console.log("HelperDao.add: No helper returned by add operation");
      }
    } catch (err) {
      console.log("HelperDao.add: " + err);
    }
  }

  async remove(id, callback) {
    const cypher = `
MATCH (h:Helper) 
WHERE h.uuid = {id}
DETACH DELETE h`;
    const parameter = { id: id };
    try {
      let removeQuery = await this.session.run(cypher, parameter);
      this.sender.send(
        {
          type: 'helper',
          action: 'remove',
          id: id
        },
        callback
      )
    } catch (err) {
      logwrapper(err);
    }
  }

  async update(id, name, parameterName, body, callback) {
    const cypher = `
MATCH (h:Helper) 
WHERE h.uuid = {id}
SET h.name = {name},
    h.parameterName = {parameterName},
    h.body = {body}
RETURN ${HelperDao.returnPart("h")} as helper`;
    const parameters = {
      id: id,
      name: name,
      parameterName: parameterName,
      body: body
    };
    try {
      const runQuery = await this.session.run(cypher, parameters);
      if (runQuery.records.length === 1) {
        let helper = runQuery.records[0].get("helper");
        this.sender.send(
          HelperDao.createHelperUpdateMessage(helper),
          callback
        );
      }
    } catch (err) {
      console.log("HelperDao.update: " + err);
    }
  }

  static returnPart(helper) {
    return `{
            id: ${helper}.uuid,
            name: ${helper}.name,
            parameterName: ${helper}.parameterName,
            body: ${helper}.body
        }`;
  }

  static mapHelper(helper, action) {
    return {
      type: "helper",
      action: action,
      id: helper.id,
      name: helper.name,
      parameterName: helper.parameterName,
      body: helper.body
    }
  }

  static createHelperAddMessage(helper) {
    return HelperDao.mapHelper(helper, "add");
  }

  static createHelperUpdateMessage(helper) {
    return HelperDao.mapHelper(helper, "update");
  }

  send(helperMsg, callback) {
    this.sender.send(helperMsg, callback);
  }
}

module.exports = HelperDao;
