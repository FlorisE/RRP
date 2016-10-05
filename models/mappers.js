class Mappers {
    static mapSensor(item) {
        return {
            type: "sensor",
            action: "add",
            id: item.id,
            name: item.name
        };
    }

    static mapProgram(record) {
        return {
            type: "program",
            action: "add",
            id: record.get("id"),
            name: record.get("name")
        }
    }

    static mapStreamInternal(item) {
        return {
            type: "stream",
            action: item.action,
            id: item.id,
            name: item.name,
            x: item.x.low,
            y: item.y.low,
            sensorId: item.sensorId,
            sensorName: item.sensorName,
            actuatorId: item.actuatorId,
            actuatorName: item.actuatorName
        };
    }

    static mapStream(item) {
        item.action = "add";
        return this.mapStreamInternal(item);
    }

    static mapStreamUpdate(item) {
        item.action = "update";
        return this.mapStreamInternal(item);
    }

    static mapRelationInternal(record) {
        var ret = {
            type: "operation",
            action: record.action,
            name: record.name,
            source: record.source,
            destination: record.destination,
            id: record.id,
        };
        if (ret.name === "sample") {
            ret.rate = record.rate.low;
        } else if (ret.name === "combine") {
            ret.x = record.x;
            ret.y = record.y;
            ret.lambda = record.lambda;
        } else if (ret.name === "filter" || ret.name === "map") {
            ret.lambda = record.lambda;
            ret.lambdaId = record.lambdaId;
            ret.lambdaName = record.lambdaName;
        } else if (ret.name === "subscribe" || ret.name === "timestamp") {
        } else {
            console.log(ret.name);
        }
        return ret;
    }

    static mapRelation(record) {
        record.action = "add";
        return this.mapRelationInternal(record);
    }

    static mapRelationUpdate(record) {
        record.action = "update";
        return this.mapRelationInternal(record);
    }

    static mapLambda(record) {
        return {
            type: "lambda",
            action: record.action,
            id: record.get("id"),
            name: record.get("name"),
            body: record.get("body")
        }
    }

    static addLambda(record) {
        record.action = "add";
        return Mappers.mapLambda(record);
    }

    static updateLambda(record) {
        record.action = "update";
        return Mappers.mapLambda(record);
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
            id: record.id,
            name: record.name
        };
    }
}

module.exports = {
    Mappers: Mappers
};