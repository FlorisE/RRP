define(['knockout', './Operation', '../../util/JSPlumbInstance'], function (ko, Operation, jsplumb) {
  "use strict";

  class OneToOneOperation extends Operation {
    constructor(operationModule,
                availableOperationsModule,
                streamModule,
                id,
                programId,
                source,
                destination,
                hasProceduralParameter,
                helperModule,
                body,
                helperId,
                helperName,
                connection) {
      super(
        operationModule,
        availableOperationsModule,
        streamModule,
        id,
        programId,
        hasProceduralParameter,
        helperModule,
        body,
        helperId,
        helperName
      );

      this.source = ko.observable(source);

      this.sourceInstance = this.streamModule.get(
        this.source()
      );

      this.connection = ko.observable(connection);

      this.destination = ko.observable(destination);

      this.destinationInstance = this.id() ? this.streamModule.get(
          this.destination()
        ) : null;

      this.removeOperation = function () {
        this.operationModule.remove(
          this.id(),
          () => {
            $('#add-op').modal('hide');
            jsplumb.detach(this.connection());
          }
        );
      };

      this.in = "1";
      this.out = "1";
    }

    copy() {
      return new OneToOneOperation(
        this.operationModule,
        this.availableOperationsModule,
        this.streamModule,
        this.id(),
        this.programId(),
        this.source(),
        this.destination(),
        this.hasProceduralParameter,
        this.helperModule,
        this.body ? this.body() : null,
        this.helperId ? this.helperId() : null,
        this.helperName ? this.helperName() : null
      );
    }

    modal() {
      super.modal();
      this.outputStreamName = ko.observable(
        this.formatOutputStreamName()
      ).extend({required: true});

      if (this.hasProceduralParameter) {
        this.parameters = ko.observable(this.parameterConverter(this.sourceInstance.name()));
      }

      this.validatorModel = ko.validatedObservable(this.getValidatorModel());

      this.isValid = ko.computed(this.validatorModel.isValid);

      return this;
    }

    getValidatorModel() {
      let validatorModel = super.getValidatorModel();

      validatorModel.outputStreamName = this.outputStreamName;
      validatorModel.body = this.body;

      return validatorModel;
    }

    getCreateMessage() {
      var baseMsg = super.getBaseMessage();
      baseMsg.action = "add";
      baseMsg.sourceId = this.source();
      baseMsg.x = this.calculateX(this.sourceInstance);
      baseMsg.y = this.calculateY(this.sourceInstance);
      return baseMsg;
    }

    calculateX(source) {
      let xOffsetFromStream = $("#stream" + source.id()).width() / 2;
      return xOffsetFromStream + source.x();
    }

    calculateY(source) {
      return source.y() + 100;
    }

    getUpdateMessage() {
      var baseMsg = super.getBaseMessage();
      baseMsg.action = "update";
      baseMsg.x = this.destinationInstance.x();
      baseMsg.y = this.destinationInstance.y();
      baseMsg.sourceId = this.sourceInstance.id();
      baseMsg.destinationId = this.destinationInstance.id();
      return baseMsg;
    }

    setUpdated(id, programId, source, destination, body, helperId, helperName) {
      super.setUpdated(id, programId, body, helperId, helperName);
      this.source(source);
      this.destination(destination);
    }

    formatOutputStreamName() {
      // temporarily disabled for experiment:
      return this.destinationInstance ?
        this.destinationInstance.name() :
        "";
      /*this.suffix() !== "" ?
       this.sourceInstance.name() + this.suffix() :
       null;*/
    }
  }

  return OneToOneOperation;

});