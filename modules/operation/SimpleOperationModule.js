"use strict";
const BaseOperationModule = require("./BaseOperationModule");
const Stream = require("../../models/Stream");

class SimpleOperationModule extends BaseOperationModule {

  getDestination(msg, program) {
    let destination = this.streamModule.getByName(program.id, msg.name);

    return destination.then(
      (existingDestination) => {
        if (existingDestination !== null) {
          return existingDestination;
        } else {
          let stream = Stream.create(
            msg.name, msg.x, msg.y, program
          );
          this.streamModule.save(stream);
          return stream;
        }
      }
    );
  }

}

module.exports = SimpleOperationModule;
