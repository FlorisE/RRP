var mappers = require('./mappers');
var sender = require('./sender');

var uuid = require('node-uuid');

class Helper {
    constructor(id, io, session) {
        this.io = io;
        this.id = id;
        this.session = session;
        this.sender = sender(id, io);
        this.maps = mappers.Mappers;
    }

    getFromDb() {
        return () => this.session.run(
            `MATCH (n:Lambda) 
             RETURN n.uuid as id, 
                    n.name as name, 
                    n.body as body`
        );
    }

    sendToClient() {
        return this.sender(this.maps.addLambda);
    }

}

module.exports = {
    Helper: Helper
};