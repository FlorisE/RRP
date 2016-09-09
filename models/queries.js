class Queries {
    constructor(session) {
        this.session = session;
    }

    sensors() {
        return this.session.run(
            "MATCH (s:Sensor) " +
            "RETURN { name: s.name, id: id(s) } as sensor"
        )
    }

    streams(programId) {
        return () => {
            var cypher = "MATCH (s:Stream)-[r:program]->(p:Program) " +
                "WHERE id(p) = " + programId + " " +
                "OPTIONAL MATCH (s)-[:sensor]->(sensor:Sensor), " +
                "               (s)-[r:program]->(p:Program) " +
                "WHERE id(p) = " + programId + " " +
                "RETURN { " +
                "         name: s.name, " +
                "         id: id(s), " +
                "         x: s.x, " +
                "         y: s.y, " +
                "         sensorName: sensor.name " +
                "} as stream";
            return this.session.run(cypher);
        };
    }

    relations(programId) {
        return () => {
            var cypher = "" +
                "MATCH (s1:Stream)-[r]->(s2), " +
                "      (s1:Stream)-[r2]->(p:Program) " +
                "WHERE NOT type(r) IN ['program', 'in', 'sensor'] " +
                "      AND id(p) = " + programId + " " +
                "RETURN {source: id(s1), " +
                "        destination: id(s2), " +
                "        name: type(r), " +
                "        lambda: r.lambda, " +
                "        id: id(r), " +
                "        rate: r.rate} as relation";
            return this.session.run(cypher);
        };
    }

    compositeRelations(programId) {
        return () => {
            var cypher = "" +
                "MATCH (s1:Stream)-[:in]->(o:Operation)-[:out]->(s2:Stream), " +
                "      (o)-[:lambda]->(l:Lambda)," +
                "      (s1:Stream)-[r2]->(p:Program) " +
                "WHERE id(p) = " + programId + " " +
                "RETURN {source: id(s1), " +
                "        destination: id(s2), " +
                "        name: o.name, " +
                "        id: id(o), " +
                "        lambdaname: l.name, " +
                "        x: o.x, " +
                "        y: o.y} as relation";
            return this.session.run(cypher);
        };
    }

    lambdas() {
        return () => this.session.run(
            "MATCH (n:Lambda) " +
            "RETURN id(n) as id, " +
            "n.name as name, " +
            "n.body as body"
        );
    }

    availableOperators() {
        return () => this.session.run(
            "MATCH (n {name: 'Available operators'}) " +
            "RETURN labels(n) as labels"
        );
    }

    actuationModules(programId) {
        return () => this.session.run(
            "MATCH (n:ActuationModule)-[:program]->(p:Program) " +
            "WHERE id(p) = " + programId + " " +
            "RETURN { id: id(n), name: n.name, x: n.x, y: n.y } as actuator"
        );
    }
}

module.exports = {
    Queries: Queries
};