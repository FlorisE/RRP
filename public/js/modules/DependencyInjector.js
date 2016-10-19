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
      constructor() {
        this.observers = [];

        this.actuatorModule = new ActuatorModule(this);
        this.availableOperationsModule = new AvailableOperationsModule(this);
        this.editorModule = new EditorModule(this);
        this.helperModule = new HelperModule(this);
        this.operationModule = new OperationModule(this);
        this.programModule = new ProgramModule(this);
        this.sensorModule = new SensorModule(this);
        this.streamModule = new StreamModule(this);
        this.sensorStreamModule = new SensorStreamModule(this);
        this.actuatorStreamModule = new ActuatorStreamModule(this);

        this.finished();
      }

      finished() {
        this.observers.forEach((observer) => observer.inject());
      }

    }

    return new DependencyInjector();
  }
);