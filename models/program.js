var mappers = require('./mappers');
var queriesModule = require('./queries');
var senderModule = require('./sender');

class Program {
    constructor(driver, io, id) {
        this.driver = driver;
        this.io = io;
        this.id = id;
        this.maps = mappers.Mappers;
    }

    getExecutor(target) {
        if (target === "get-all") {
            return this.getAll;
        } else {
            return this[target];
        }
    }

    add(msg) {
        var session = this.driver.session();
        var cypher = "CREATE (n:Program { name: '" + msg.name + "'}) " +
                      "RETURN id(n) as id, n.name as name";
        return session.run(cypher).catch(
            function(error) {
                console.log(error);
            }
        ).then(
            (results) =>
                this.io.emit(
                    id,
                    results.records.map(mapProgram)
                )
        );
    }

    getAll(msg) {
        var session = this.driver.session();
        session.run(
            "MATCH (n:Program) " +
            "RETURN id(n) as id, n.name as name"
        ).then(
            (results) =>
                this.io.emit(
                    this.id,
                    results.records.map(this.maps.mapProgram)
                )
        ).catch(function(error) {
            console.log(error);
        }).then(
            () => {
                session.close();
                logTime("Finished get programs");
            }
        );
    }

    get(msg) {
        if (!msg) {
            throw "Message required";
        }

        var programId = msg.id;

        if (programId < 0) {
            throw "Invalid program id";
        }

        var session = this.driver.session();
        var queries = new queriesModule.Queries(session);
        var sender = new senderModule.Sender(this.id, this.io, this.maps);
        queries.sensors().catch(
            (error) => console.log(error)
        ).then(
            sender.sensors()
        ).then(
            queries.streams(programId)
        ).catch(
            (error) => console.log(error)
        ).then(
            sender.streams()
        ).then(
            queries.actuationModules(programId)
        ).catch(
            (error) => console.log(error)
        ).then(
            sender.outputModules(programId)
        ).then(
            queries.relations(programId)
        ).catch(
            (error) => console.log(error)
        ).then(
            sender.relations()
        ).then(
            queries.compositeRelations(programId)
        ).catch(
            (error) => console.log(error)
        ).then(
            sender.compositeRelations()
        ).then(
            queries.lambdas()
        ).catch(
            (error) => console.log(error)
        ).then(
            sender.lambdas()
        ).then(
            queries.availableOperators()
        ).catch(
            (error) => console.log(error)
        ).then(
            sender.availableOperators()
        ).then(
            () => {
                session.close();
                logTime("Finished get");
            }
        );
    }
}

module.exports = {
    Program: Program
};