var mappers = require('./mappers');
var senderModule = require('./sender');

class Stream {
    constructor(driver, io, id) {
        this.driver = driver;
        this.io = io;
        this.id = id;
        this.maps = mappers.Mappers;
    }

    getExecutor(target) {
        if (target === "add-operator") {
            return this.addOperator;
        } else {
            return this[target];
        }
    }

    update(msg) {
        var session = this.driver.session();
        session.run(
            "MATCH (n) WHERE ID(n) = " + msg.id + "  SET n.x = " + msg.x +
            " , n.y = " + msg.y + ", n.name = '" + msg.name + "'"
        ).subscribe({
            onCompleted: function () {
                session.close();
            },
            onError: function (error) {
                console.log(error);
            }
        });

    }

    getOpPart(label) {
        return "(source)-[r:" + label + "]->(dest) " +
            "RETURN " +
            "{" +
            " id: ID(dest), " +
            " name: dest.name, " +
            " x: dest.x, " +
            " y: dest.y " +
            "} as retdest, " +
            "{" +
            " source: id(source), " +
            " destination: id(dest), " +
            " name: type(r), " +
            " id: id(r), " +
            " lambda: r.lambda, " +
            " rate: r.rate " +
            "} as relation";
    }

    add(msg) {
        var sender = new senderModule.Sender(this.id, this.io, this.maps);
        var session = this.driver.session();
        var template;

        if ("sensorId" in msg) {
            template = "MATCH (p:Program), (sensor:Sensor) " +
                "WHERE ID(p) = {programId} " +
                "  AND ID(sensor) = {sensorId} " +
                "CREATE (" +
                "  str:Stream { " +
                "    x: {x}, " +
                "    y: {y}, " +
                "    name: {name} " +
                "  })-[:program]->(p), " +
                "  (str)-[:sensor]->(sensor) " +
                "RETURN { " +
                "  name: str.name, " +
                "  id: ID(str), " +
                "  x: str.x, " +
                "  y: str.y," +
                "  sensorName: sensor.name" +
                "} as stream";
        } else {
            template = "MATCH (p:Program) " +
                "WHERE ID(p) = {programId} " +
                "CREATE " +
                "(str:Stream { " +
                "  x: {x}, " +
                "  y: {y} ," +
                "  name: {name}" +
                "})-[:program]->(p) " +
                "RETURN { " +
                "  name: str.name, " +
                "  id: ID(str), " +
                "  x: str.x, " +
                "  y: str.y " +
                "} as stream";
        }
        session.run(template, msg).catch(
            (error) => console.log(error)
        ).then(
            sender.streams()
        );
    }

    addOperator(msg) {
        var self = this;
        var session = this.driver.session();
        var cypher = "MATCH (source:Stream), (program:Program) " +
            "WHERE ID(source) = " + msg.sourceId + " " +
            "  AND ID(program) = " + msg.programId + " " +
            "CREATE ( dest:Stream { " +
            "        x: " + msg.x + ", " +
            "        y: " + msg.y + ", " +
            "        name: '" + msg.name + "'" +
            " } )-[:program]->(program), ";
        var complete = true;
        switch (msg.operator) {
            case "timestamp":
                cypher += this.getOpPart(msg.operator);
                break;
            case "map":
            case "filter":
                cypher += this.getOpPart(msg.operator + " {lambda: '" + msg.lambda +"'}");
                break;
            case "samples":
                cypher += this.getOpPart(msg.operator + " {rate: '" + msg.rate +"'}");
                break;
            default:
                complete = false;
                console.log(msg.operator);
        }
        if (complete) {
            session.run(cypher).then(function(results) {
                var stream = results.records[0].get("retdest");
                var mappedStream = self.maps.mapStream(stream);
                self.io.emit(self.id, [mappedStream]);
                var relation = results.records[0].get("relation");
                var mappedRelation = self.maps.mapRelation(relation);
                self.io.emit(self.id, [mappedRelation]);
            });
        }
    }

    remove(msg) {
        var session = this.driver.session();
        return session.run(
            "MATCH (o)-[r]->(s:Stream) " +
            "WHERE id(s) = " + msg.id + " " +
            "DELETE r"
        ).catch(
            (error) => console.log(error)
        ).then(
            () => session.run("MATCH (s:Stream)-[r]->(t) " +
                              "WHERE id(s) = " + msg.id + " " +
                              "DELETE r")
        ).catch(
            (error) => console.log(error)
        ).then(
            () => session.run("MATCH (d:Stream) " +
                              "WHERE id(d) = " + msg.id + " " +
                              "DELETE d")
        ).catch(
            (error) => console.log(error)
        ).then(
            () => {
                msg = {
                    type: "stream",
                    action: "remove",
                    id: msg.id
                };
                this.io.emit(this.id, [msg])
            }
        );
    }
}

class Operator {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static fromJSON(operator) {
        switch (operator.type) {
            case "sample":
                return Sample.fromJSON(operator);
            default:
                return new Operator(operator.id, operator.name);
        }
    }
}

class Sample extends Operator {
    constructor(id, name, rate) {
        super(id, name);
        this.rate = rate;
    }

    static fromJSON(sample) {
        return new Sample(sample.id, sample.name, sample.rate);
    }
}

class Filter extends Operator {

}

module.exports = {
    Stream: Stream
};