var mappers = require('./mappers');
var sender = require('./sender');
var uuid = require('node-uuid');

class Lambda {
    constructor(id, io, session) {
        this.id = id;
        this.io = io;
        this.session = session;
        this.maps = mappers.Mappers;
    }

    getExecutor(target) {
        return this[target];
    }

    add(msg) {
        var cypher = `CREATE (n:Lambda { name: {name},
                                         body: {body},
                                         uuid: {uuid}}) 
                      RETURN n.uuid as id, n.name as name, n.body as body`;
        var parameters = {
            name: msg.name,
            body: msg.body,
            uuid: uuid.v4()
        };
        return this.session.run(cypher, parameters).catch(
            function(error) {
                console.log(error);
            }
        ).then(
            (results) =>
                this.io.emit(
                    this.id,
                    results.records.map(this.maps.addLambda)
                )
        );
    }

    update(msg) {
        var cypher = `MATCH (l:Lambda) 
                      WHERE l.uuid = {id}
                      SET l.name = {name}, 
                          l.body = {body}
                      RETURN l.uuid as id, l.name as name, l.body as body`;
        var parameters = {
            id: msg.id,
            name: msg.name,
            body: msg.body
        };
        this.session.run(cypher, parameters).catch(console.log).then(
            (results) =>
                this.io.emit(
                    this.id,
                    results.records.map(this.maps.updateLambda)
                ),
            console.log
        );
    }
}

module.exports = {
    Lambda: Lambda
};