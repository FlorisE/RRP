var sender = require('./sender');
var uuid = require('node-uuid');

class Helper {
    constructor(id, io, session) {
        this.io = io;
        this.id = id;
        this.session = session;
        this.send = sender(id, io);
    }

    getFromDb() {
        return () => this.session.run(
            `MATCH (n:Helper) 
             RETURN n.uuid as id, 
                    n.name as name, 
                    n.body as body`
        );
    }

    sendToClient() {
        return this.send(this._addHelper.bind(this));
    }

    _mapHelper(record) {
        return {
            type: "helper",
            action: record.action,
            id: record.get("id"),
            name: record.get("name"),
            body: record.get("body")
        }
    }

    _addHelper(record) {
        record.action = "add";
        return this._mapHelper(record);
    }

    _updateHelper(record) {
        record.action = "update";
        return this._mapHelper(record);
    }

    add(msg) {
        var cypher = `CREATE (n:Helper { name: {name},
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
                    results.records.map(this.maps.addHelper)
                )
        );
    }

    update(msg) {
        var cypher = `MATCH (l:Helper) 
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
                    results.records.map(this.maps.updateHelper)
                ),
            console.log
        );
    }
}

module.exports = Helper;