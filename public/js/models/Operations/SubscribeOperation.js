define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {

    class SubscribeOperation extends OneToOneOperation {
      constructor(
        operationModule,
        availableOperationsModule,
        streamModule,
        id,
        programId,
        source,
        destination,
        connection
      ) {
        super(
          operationModule,
          availableOperationsModule,
          streamModule,
          id,
          programId,
          source,
          destination,
          false,
          null,
          null,
          null,
          null,
          connection
        );
        this.name("subscribe");
        this.suffix("Subscribed");
        this.programModule = this.streamModule.programModule;
        this.editorModule = this.programModule.editorModule;
        this.editor = this.editorModule.getEditor();
        this.defaultActuator = this.editor.availableActuators()[0];
        this.selectedOutputModule = ko.observable(
          destination ? this.destinationInstance.actuator : this.defaultActuator
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
          this.destination(),
          this.connection()
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

      formatOutputStreamName() {
        return this.selectedOutputModule() ?
          this.selectedOutputModule().name() :
          null;
      }
    }

    return SubscribeOperation
  }
);
