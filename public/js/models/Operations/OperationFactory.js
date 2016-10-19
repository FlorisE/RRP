define(
    [
        './SampleOperation',
        './CombineOperation',
        './FilterOperation',
        './MapOperation',
        './SubscribeOperation',
        './TimestampOperation'
    ],
    function (SampleOperation,
              CombineOperation,
              FilterOperation,
              MapOperation,
              SubscribeOperation,
              TimestampOperation)
    {

        class OperationFactory {
            constructor(d) {
                this.d = d;
            }

            create (type, operation={}) {
                switch(type) {
                    case "sample":
                        return this.createSample(operation.id, operation.source, operation.destination, operation.rate);
                    case "combine":
                        return this.createCombine(operation.id, operation.source, operation.destination, operation.x, operation.y);
                    case "filter":
                        return this.createFilter(operation.id, operation.source, operation.destination, operation.body, operation.helperId, operation.helperName);
                    case "map":
                        return this.createMap(operation.id, operation.source, operation.destination, operation.body, operation.helperId, operation.helperName);
                    case "subscribe":
                        return this.createSubscribe(operation.id, operation.source, operation.destination);
                    case "timestamp":
                        return this.createTimestamp(operation.id, operation.source, operation.destination);
                    default:
                        console.log('Unknown operation: ' + operation.name);
                }
            }

            createSample(id, source, destination, rate) {
                return new SampleOperation(
                    this.d.operationModule,
                    this.d.availableOperationsModule,
                    this.d.streamModule,
                    id,
                    source,
                    destination,
                    rate
                );
            }

            createCombine(id, source, destination, x, y) {
                return new CombineOperation(
                    this.d.operationModule,
                    this.d.availableOperationsModule,
                    this.d.streamModule,
                    id,
                    source,
                    destination,
                    x,
                    y
                );
            }

            createFilter(id, source, destination, body, helperId, helperName) {
                return new FilterOperation(
                    this.d.operationModule,
                    this.d.availableOperationsModule,
                    this.d.streamModule,
                    this.d.helperModule,
                    id,
                    source,
                    destination,
                    body,
                    helperId,
                    helperName
                );
            }

            createMap(id, source, destination, body, helperId, helperName) {
                return new MapOperation(
                    this.d.operationModule,
                    this.d.availableOperationsModule,
                    this.d.streamModule,
                    this.d.helperModule,
                    id,
                    source,
                    destination,
                    body,
                    helperId,
                    helperName
                );
            }

            createSubscribe(id, source, destination) {
                return new SubscribeOperation(
                    this.d.operationModule,
                    this.d.availableOperationsModule,
                    this.d.streamModule,
                    id,
                    source,
                    destination
                );
            }

            createTimestamp(id, source, destination) {
                return new TimestampOperation(
                    this.d.operationModule,
                    this.d.availableOperationsModule,
                    this.d.streamModule,
                    id,
                    source,
                    destination
                );
            }

            set operationModule(operationModule) {
                this._operationModule = operationModule;
            }

            get operationModule() {
                return this._operationModule;
            }

            set helperModule(helperModule) {
                this._helperModule = helperModule;
            }

            get helperModule() {
                return this._helperModule;
            }
        }

        return OperationFactory;
    }
);