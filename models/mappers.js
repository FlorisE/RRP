class Mappers {
    static mapSensor(item) {
        return {
            type: "sensor",
            action: "add",
            id: item.id.low,
            name: item.name
        };
    }

    static mapProgram(record) {
        return {
            type: "program",
            action: "add",
            id: record.get("id").low,
            name: record.get("name")
        }
    }

    static mapStream(item) {
        return {
            type: "stream",
            action: "add",
            id: item.id.low,
            name: item.name,
            x: typeof(item.x) === "number" ? item.x : item.x.toInt(),
            y: typeof(item.y) === "number" ? item.y : item.y.toInt(),
            sensorName: item.sensorName
        };
    }

    static mapRelation(record) {
        var ret = {
            type: "operation",
            action: "add",
            name: record.name,
            source: record.source.low,
            destination: record.destination.low,
            id: record.id.low
        };
        if (ret.name === "samples") {
            ret.rate = record.rate ? record.rate.low : null;
        } else if (ret.name === "combinator") {
            ret.x = record.x ? record.x.low : 0;
            ret.y = record.y ? record.y.low : 0;
            ret.lambda = record.lambda;
        } else if (ret.name === "filter" || ret.name === "map") {
            ret.lambda = record.lambda;
        } else if (ret.name === "subscribe" || ret.name === "timestamp") {
        } else {
            console.log(ret.name);
        }
        return ret;
    }

    static mapLambda(record) {
        return {
            type: "lambda",
            action: "add",
            id: record.get("id").low,
            name: record.get("name"),
            body: record.get("body")
        }
    }

    static mapOperations(record) {
        return {
            type: "operations",
            action: "add",
            operations: record.get("labels")
        }
    }

    static mapOutputModules(record) {
        return {
            type: "output_module",
            action: "add",
            id: record.id.low,
            x: record.x.low,
            y: record.y.low,
            name: record.name
        };
    }
}

module.exports = {
    Mappers: Mappers
};