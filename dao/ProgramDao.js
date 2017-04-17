const Program = require('../models/Program');
const logwrapper = require('../util/logwrapper');
const uuid = require('node-uuid');

class ProgramDao {

    constructor(session, sender) {
        this.session = session;
        this.sender = sender;
    }

    add(name, callback) {
        let id = uuid.v4();
        var cypher = `CREATE (n:Program { name: {name}, 
                                          uuid: {id}}) 
                      RETURN n.uuid as id, n.name as name`;
        return this.session.run(
            cypher, { id: id, name: name}
        ).then(
            this.sender.getSendMethod(this.mapProgram, callback),
            logwrapper("ProgramDao.add")
        );
    }

    single(id, resolve, reject) {
        return this.session.run(
            "MATCH (p:Program { uuid: {id} }) RETURN p",
            { id: id }
        ).then(
            (result) => this.mapSingle(result, resolve),
            reject
        );
    }

    remove(id, resolve, reject) {
        return this.session.run(
            `MATCH (p:Program { uuid: {id} })
             OPTIONAL MATCH (s:Stream)-[:program]->(p)
             OPTIONAL MATCH (p)-[:parameter]->(param:Parameter) 
             DETACH DELETE p, s, param`,
            { id: id }
        ).then(
            () => {
                let msg = {
                    type: "program",
                    action: "remove",
                    id: id
                };
                this.sender.send([msg]);
                resolve();
            },
            reject
        );
    }

    mapSingle(result, resolve) {
        var record = result.records[0];
        var program = record.get("p");
        var uuid, name;
        ({uuid, name} = program.properties);
        resolve(new Program(uuid, name));
    }

    all() {
        return this.session.run(
            "MATCH (p:Program) RETURN p, id(p)"
        ).then(
            (result) => {
                return result.records.map(
                    record => {
                        let program = record.get("p");
                        let neo4jId = record.get("id(p)").low;
                        let uuid, name;
                        ({uuid, name} = program.properties);
                        return new Program(uuid, name, neo4jId);
                    }
                );
            },
            logwrapper("ProgramDao.all")
        );
    }

    mapProgram(record) {
        return {
            type: "program",
            action: "add",
            id: record.get("id"),
            name: record.get("name")
        }
    }
}

module.exports = ProgramDao;
