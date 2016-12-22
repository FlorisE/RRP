const MapOperation = require("../../models/operation/MapOperation");
const StreamDao = require("../StreamDao");
const ComplexOperationDao = require('./ComplexOperationDao');

class MapOperationDao extends ComplexOperationDao {

    saveBody(operation, callback) {
        return super.saveBody("map", operation, callback);
    }

    saveHelper(operation, callback) {
        return super.saveHelper("map", operation, callback)
    }

    queryWithBody() {
        return this.query(
            this.matchPartWithBody("src", "map", "dst"),
            this.returnPartWithBody("operation")
        );
    }

    queryWithHelper() {
        return this.query(
            this.matchPartWithHelper("src", "map", "dst"),
            this.returnPartWithHelper("operation")
        );
    }

    map(operation) {
        return new MapOperation(
            operation.get("id"),
            this.streamDao.map(operation.get("src")),
            this.streamDao.map(operation.get("dst")),
            operation.get("programId")
        );
    }
}

module.exports = MapOperationDao;
