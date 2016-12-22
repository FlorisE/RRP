"use strict";
const ParameterDefinition = require("../models/ParameterDefinition");

class ParameterizedComponentDao {

    constructor(session, sender, moduleFactory) {
        this.session = session;
        this.sender = sender;
    }

    get(id, resolve, reject, type) {
        return this.session.run(`
MATCH (item:${type} {uuid: {id}})
OPTIONAL MATCH (item)-[:parameter]->(pd),
               (pd)-[:type]-(type)
RETURN item,
       CASE WHEN pd IS NOT NULL THEN collect({
         name: pd.name,
         type: type.name,
         id: pd.uuid
        }) END as parameters`,
            {id: id}
        ).then(
            (results) => this.mapGet(results, resolve),
            reject
        );
    }

    mapGet(results, resolve) {
        try {
            let record = results.records[0];
            let item = record.get("item");
            let uuid, name;
            ({uuid, name} = item.properties);

            let parametersValue = record.get("parameters") || [];
            let parameters = parametersValue.map(this.convertParameter);

            resolve(this.createInstance(uuid, name, parameters));
        } catch (error) {
            console.log(error);
        }
    }

    convertParameter(parameter) {
        let id, name, type;
        ({id, name, type} = parameter);

        return new ParameterDefinition(id, name, type);
    }

}

module.exports = ParameterizedComponentDao;
