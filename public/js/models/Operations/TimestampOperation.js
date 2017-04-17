define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {

    class TimestampOperation extends OneToOneOperation {
      constructor(operationModule,
                  availableOperationsModule,
                  streamModule,
                  id,
                  programId,
                  source,
                  destination) {
        super(
          operationModule,
          availableOperationsModule,
          streamModule,
          id,
          programId,
          source,
          destination,
          false
        );

        this.name("timestamp");
        this.suffix("Timestamped");

        super.initLabel();
      }

      copy() {
        return new TimestampOperation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.id(),
          this.programId(),
          this.source(),
          this.destination()
        );
      }

      modal() {
        super.modal();
        if (!this.id()) {
          this.outputStreamName = ko.observable(
            this.sourceInstance.name() + this.suffix()
          );
        }
        return this;
      }
    }

    return TimestampOperation
  }
);