define(
  [
    './ActuatorModule',
    './ActuatorStreamModule',
    './AvailableOperationsModule',
    './EditorModule',
    './HelperModule',
    './OperationModule',
    './ProgramModule',
    './SensorModule',
    './SensorStreamModule',
    './StreamModule',
    '../util/FullExtend'
  ],
  function (ActuatorModule,
            ActuatorStreamModule,
            AvailableOperationsModule,
            EditorModule,
            HelperModule,
            OperationModule,
            ProgramModule,
            SensorModule,
            SensorStreamModule,
            StreamModule,
            fullExtend) {

    class DependencyInjector {
      constructor(connectionHandler) {
        this.observers = [];

        this.actuatorModule = new ActuatorModule(this, connectionHandler);
        this.availableOperationsModule = new AvailableOperationsModule(
            this, connectionHandler
        );
        this.editorModule = new EditorModule(this, connectionHandler);
        this.helperModule = new HelperModule(this, connectionHandler);
        this.operationModule = new OperationModule(this, connectionHandler);
        this.programModule = new ProgramModule(this, connectionHandler);
        this.sensorModule = new SensorModule(this, connectionHandler);
        this.streamModule = new StreamModule(this, connectionHandler);
        this.sensorStreamModule = new SensorStreamModule(
            this, connectionHandler
        );
        this.actuatorStreamModule = new ActuatorStreamModule(
            this, connectionHandler
        );

        this.finished();
      }

      finished() {
        this.observers.forEach((observer) => observer.inject());
      }

    }

    return DependencyInjector;
  }
);
