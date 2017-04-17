const CombineOperation = require("../../models/operation/CombineOperation");
const ManyToOneOperationDao = require("./ManyToOneOperationDao");
const StreamDao = require("../StreamDao");
const logwrapper = require("../../util/logwrapper");
const uuid = require('node-uuid');

class CombineOperationDao extends ManyToOneOperationDao {

  get(id, callback) {
    return super.get(id, "combine", callback);
  }

  map(operation) {
    return new CombineOperation(
      operation.id,
      operation.inStreams.map(this.streamDao.map),
      this.streamDao.map(operation.outStream),
      operation.programId,
      operation.x,
      operation.y
    )
  }

  queryWithBody() {
    return super.query(
      this.matchPartWithBody("src", "combine", "dst"),
      this.returnPartWithBody("operation")
    );
  }

  queryWithHelper() {
    return super.query(
      this.matchPartWithHelper("src", "combine", "dst"),
      this.returnPartWithHelper("operation")
    );
  }

  sendUpdate(value) {
    super.sendUpdate(value, "combine");
  }
}

module.exports = CombineOperationDao;
