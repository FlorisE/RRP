const FilterOperation = require("../../models/operation/FilterOperation");
const StreamDao = require("../StreamDao");
const HelperOrBodyOperationDao = require('./HelperOrBodyOperationDao');

class FilterOperationDao extends HelperOrBodyOperationDao {

  saveBody(operation, callback) {
    return super.saveBody("filter", operation, callback);
  }

  saveHelper(operation, callback) {
    return super.saveHelper("filter", operation, callback)
  }

  queryWithBody() {
    return this.query(
      this.matchPartWithBody("src", "filter", "dst"),
      this.returnPartWithBody("operation")
    );
  }

  queryWithHelper() {
    return this.query(
      this.matchPartWithHelper("src", "filter", "dst"),
      this.returnPartWithHelper("operation")
    );
  }

  map(operation) {
    return new FilterOperation(
      operation.get("id"),
      this.streamDao.map(operation.get("src")),
      this.streamDao.map(operation.get("dst")),
      operation.get("programId")
    );
  }
}

module.exports = FilterOperationDao;
