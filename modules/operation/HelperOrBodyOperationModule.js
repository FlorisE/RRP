const FilterOperation = require('../../models/operation/FilterOperation');
const MapOperation = require('../../models/operation/MapOperation');
const CombineOperation = require('../../models/operation/CombineOperation');
const OperationModule = require('../OperationModule');
const logwrapper = require('../../util/logwrapper');
const Stream = require('../../models/Stream');

class HelperOrBodyOperationModule extends OperationModule {
  constructor(dao, sender, moduleFactory) {
    super(dao, sender);
    this.dao = dao;
    this.streamModule = moduleFactory.getModule("Stream");
    this.programModule = moduleFactory.getModule("Program");
    this.helperModule = moduleFactory.getModule("Helper");
  }

  add(msg, callback, operationFactory) {
    let promises = [
      this.programModule.get(msg.programId),
      this.streamModule.getByName(msg.programId, msg.name)
    ];

    if (msg.sourceId) {
      promises.push(this.streamModule.get(msg.sourceId));
    } else if (msg.sources) {
      msg.sources.forEach(
        (stream) => promises.push(this.streamModule.get(stream))
      );
    }
    let operationName = msg.operation;

    Promise.all(promises).then(
      ([program, destination, ...sources]) =>
      {
        let addDestination = destination === null;

        if (sources.length == 0) {
          throw "At least one source is required.";
        }

        if (destination &&
            (destination.inStreams.size > 0 || destination.sensor))
        {
          throw "Cannot add an input operation to a stream which already " +
          "has an existing input operation or is a sensor stream";
        }

        destination = destination || Stream.create(
          msg.name, msg.x, msg.y, program
        );

        let operation = operationFactory(sources, destination, program, msg);

        let addOperation = this.getAdder(operation, callback, msg);

        if (addDestination) {
          this.streamModule.save(destination).then(
            addOperation,
            logwrapper("HelperOrBodyOperationModule.add save destination")
          );
        } else {
          addOperation();
        }
      },
      logwrapper("HelperOrBodyOperationModule.add")
    ).catch(logwrapper("HelperOrBodyOperationModule.add:promises"));
  }

  update(type, msg, callback) {
    // possible changes:
    // - output name
    // OR
    // - body changed
    // - helper changed
    // - helper to body
    // OR
    // - body to helper
    // OR
    // - input streams changed (many-to-one op)
    // OR
    // - x, y changed (many-to-one op)
    this.dao.get(
      msg.id,
      (operation) => {
        operation.update(this.dao, msg, callback)
      }
    );
  }

  getOperations(programId, operationId) {
    return this.dao.getOperations(programId, operationId);
  }
}

module.exports = HelperOrBodyOperationModule;
