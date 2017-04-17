define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {

    class SubscribeOperation extends OneToOneOperation {
      constructor(
        operationModule,
        availableOperationsModule,
        streamModule,
        id,
        programId,
        source,
        destination
      ) {
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
        this.name("subscribe");
        this.suffix("Subscribed");
        this.selectedOutputModule = ko.observable(
          destination ? this.destinationInstance.actuator : null
        );

        super.initLabel();
      }

      copy() {
        return new SubscribeOperation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.id(),
          this.programId(),
          this.source(),
          this.destination()
        );
      }

      getCreateMessage() {
        var base = super.getCreateMessage();
        base.actuatorId = this.selectedOutputModule().id();
        base.name = this.selectedOutputModule().name();
        return base;
      }

      getUpdateMessage() {
        let base = super.getUpdateMessage();

        base.actuatorId = this.selectedOutputModule().id();

        return base;
      }

      modal() {
        super.modal();
        this.outputStreamName = ko.observable(
          this.selectedOutputModule()
        );
        return this;
      }
    }

    return SubscribeOperation
  }
);
