define(['knockout', './Operation'], function (ko, Operation) {
    "use strict";

    class OneToOneOperation extends Operation {
        constructor(
          operationModule,
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
          helperName
        ) {
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

          this.destination = ko.observable(destination);

          this.destinationInstance = this.id() ? this.streamModule.get(
            this.destination()
          ) : null;

          this.programId = ko.observable(programId);
        }

        copy() {
            return new OneToOneOperation(
                this.operationModule,
                this.availableOperationsModule,
                this.streamModule,
                this.id(),
                this.source(),
                this.destination()
            );
        }

        modal() {
          super.modal();
          this.outputStreamName = ko.observable(
            this.destinationInstance ? this.destinationInstance.name() : null
          );
          return this;
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

        setUpdated(id, body, source, destination, helperId, helperName) {
          super.setUpdated(id, body, helperId, helperName, programId);
          this.source(source);
          this.destination(destination);
        }
    }

    return OneToOneOperation;

});