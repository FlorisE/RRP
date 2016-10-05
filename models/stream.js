var mappers = require('./mappers');
var sender = require('./sender');
var uuid = require('node-uuid');

class Stream {
    constructor(id, io, session) {
        this.io = io;
        this.id = id;
        this.session = session;
        this.maps = mappers.Mappers;
        this.sender = sender(id, io);
    }

    getFromDb(programId) {
        return () => {
            var cypher = `MATCH (s:Stream)-[r:program]->(p:Program),
                                (s)-[:draw_at]->(d:Draw) 
                          WHERE p.uuid = '${programId}' 
                          OPTIONAL MATCH (s)-[:sensor]->(sensor:Sensor), 
                                         (s)-[r:program]->(p:Program) 
                          WHERE p.uuid = '${programId}' 
                          OPTIONAL MATCH (s)-[:actuator]->(am:ActuationModule), 
                                         (s)-[r:program]->(p:Program) 
                          WHERE p.uuid = '${programId}' 
                          RETURN { 
                                   name: s.name, 
                                   id: s.uuid, 
                                   x: d.x, 
                                   y: d.y, 
                                   sensorId: sensor.uuid,
                                   sensorName: sensor.name, 
                                   actuatorId: am.uuid,
                                   actuatorName: am.name 
                          } as stream`;
            return this.session.run(cypher);
        };
    }

    sendToClient() {
        return this.sender(
            (record) => this.maps.mapStream(record.get("stream"))
        );
    }

    update(msg) {
        this.session.run(
            `MATCH (n:Stream)-[:draw_at]->(d:Draw) 
             WHERE n.uuid = '${msg.id}' 
             SET d.x = ${msg.x}, d.y = ${msg.y}, n.name = '${msg.name}'`
        );
    }

    add(msg) {
        var template;

        msg.uuid = uuid.v4();

        if ("sensorId" in msg) {
            template = "MATCH (p:Program), (sensor:Sensor) " +
                "WHERE p.uuid = {programId} " +
                "  AND sensor.uuid = {sensorId} " +
                "CREATE (" +
                "  str:Stream { " +
                "    uuid: {uuid}, " +
                "    name: {name} " +
                "  })-[:program]->(p), " +
                "  (str)-[:sensor]->(sensor), " +
                " (str)-[:draw_at]->(d:Draw { x: {x}, y: {y}} ) " +
                "RETURN { " +
                "  name: str.name, " +
                "  id: str.uuid, " +
                "  x: d.x, " +
                "  y: d.y," +
                "  sensorName: sensor.name" +
                "} as stream";
        } else {
            template = "MATCH (p:Program) " +
                "WHERE p.uuid = {programId} " +
                "CREATE " +
                " (str:Stream { " +
                "   uuid: {uuid}, " +
                "   name: {name}" +
                " })-[:program]->(p), " +
                " (str)-[:draw_at]->(d:Draw { x: {x}, y: {y}} ) " +
                "RETURN { " +
                "  name: str.name, " +
                "  id: str.uuid, " +
                "  x: d.x, " +
                "  y: d.y " +
                "} as stream";
        }
        this.session.run(template, msg).catch(
            (error) => console.log(error)
        ).then(
            this.sendToClient()
        );
    }

    remove(msg) {
        return this.session.run(
            `MATCH (o:Operation)-[:out]->(s:Stream)
             WHERE s.uuid = '${msg.id}' 
             DETACH DELETE o`
        ).then(
            () => this.session.run("MATCH (s:Stream)-[:draw_at]->(d:Draw) " +
                "WHERE s.uuid = '" + msg.id + "' " +
                "DETACH DELETE d"),
            console.log
        ).then(
            () => this.session.run("MATCH (d:Stream) " +
                              "WHERE d.uuid = '" + msg.id + "' " +
                              "DETACH DELETE d"),
            console.log
        ).then(
            () => {
                msg = {
                    type: "stream",
                    action: "remove",
                    id: msg.id
                };
                this.io.emit(this.id, [msg])
            },
            console.log
        );
    }
}

module.exports = {
    Stream: Stream
};