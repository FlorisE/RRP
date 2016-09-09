class Sender {
    constructor(id, io, maps) {
        this.id = id;
        this.io = io;
        this.maps = maps;
    }

    send(mapper) {
        return (results) => this.io.emit(
            this.id,
            results.records.map(mapper)
        );
    }

    sensors() {
        return this.send(
            (record) => this.maps.mapSensor(record.get("sensor"))
        );
    }

    streams() {
        return this.send(
            (record) => this.maps.mapStream(record.get("stream"))
        );
    }

    relations() {
        return this.send(
            (record) => this.maps.mapRelation(record.get("relation"))
        );
    }

    compositeRelations() {
        return this.send(
            (record) => this.maps.mapRelation(record.get("relation"))
        );
    }

    lambdas() {
        return this.send(this.maps.mapLambda);
    }

    availableOperators() {
        return this.send(this.maps.mapOperations);
    }

    outputModules() {
        return this.send(
            (record) => this.maps.mapOutputModules(record.get("actuator"))
        );
    }
}

module.exports = {
    Sender: Sender
};