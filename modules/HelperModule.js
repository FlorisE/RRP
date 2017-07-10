var uuid = require('node-uuid');

class HelperModule {
  constructor(dao) {
    this.dao = dao;
  }

  async loadAll(msg, callback) {
    try {
      let helpers = await this.dao.loadAll();
      for (let helper of helpers) {
        this.dao.send(
          {
            type: "helper",
            action: "add",
            id: helper.id,
            name: helper.name,
            parameterName: helper.parameterName,
            body: helper.body
          }
        )
      }
      if (callback) callback();
    } catch (err) {
      console.log("HelperModule.loadAll: " + err);
    }
  }

  get(id) {
    return new Promise(
      (resolve, reject) => this.dao.get(id, resolve, reject)
    );
  }

  add(msg, callback) {
    return this.dao.add(msg.name, msg.parameterName, msg.body, callback);
  }

  remove(msg, callback) {
    return this.dao.remove(msg.id, callback);
  }

  update(msg, callback) {
    return this.dao.update(msg.id, msg.name, msg.parameterName, msg.body, callback);
  }
}

module.exports = HelperModule;
