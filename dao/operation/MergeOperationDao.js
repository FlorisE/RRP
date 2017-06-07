const MergeOperation = require("../../models/operation/MergeOperation");
const ManyToOneOperationDao = require("./ManyToOneOperationDao");
const StreamDao = require("../StreamDao");
const logwrapper = require("../../util/logwrapper");
const uuid = require('node-uuid');

class MergeOperationDao extends ManyToOneOperationDao {

  get(id, callback) {
    return super.get(id, "merge", callback);
  }

  map(operation) {
    return new MergeOperation(
      operation.id,
      operation.inStreams.map(this.streamDao.map),
      this.streamDao.map(operation.outStream),
      operation.programId,
      operation.x,
      operation.y
    )
  }

  query() {
    return super.query(
      this.matchPart("src", "merge", "dst"),
      this.returnPart("operation")
    );
  }

  sendUpdate(value) {
    super.sendUpdate(value, "merge");
  }
}

module.exports = MergeOperationDao;
