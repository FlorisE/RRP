define(
  [
    './SampleOperation',
    './ForgetAfterOperation',
    './CombineOperation',
    './FilterOperation',
    './MapOperation',
    './SubscribeOperation',
    './TimestampOperation',
    './MergeOperation'
  ],
  function (SampleOperation,
            ForgetAfterOperation,
            CombineOperation,
            FilterOperation,
            MapOperation,
            SubscribeOperation,
            TimestampOperation,
            MergeOperation) {

    class OperationFactory {
      constructor(d) {
        this.d = d;
      }

      create(type, operation = {}) {
        let id = operation.id,
            programId = operation.programId;

        let firstOrNull = (list) => list ?
          list.length > 0 ?
            list[0] :
            null :
          null;

        switch (type) {
          case "sample":
            return this.createSample(
              id, programId, firstOrNull(operation.sources),
              firstOrNull(operation.destinations), operation.rate
            );
          case "forgetAfter":
            return this.createForgetAfter(
              id, programId, firstOrNull(operation.sources),
              firstOrNull(operation.destinations), operation.rate
            );
          case "combine":
            return this.createCombine(
              id, programId, operation.sources,
              firstOrNull(operation.destinations), operation.x, operation.y,
              operation.body, operation.helperId, operation.helperName
            );
          case "filter":
            return this.createFilter(
              id, programId, firstOrNull(operation.sources),
              firstOrNull(operation.destinations), operation.body,
              operation.helperId, operation.helperName
            );
          case "map":
            return this.createMap(
              id, programId, firstOrNull(operation.sources),
              firstOrNull(operation.destinations), operation.body,
              operation.helperId, operation.helperName
            );
          case "subscribe":
            return this.createSubscribe(
              id, programId, firstOrNull(operation.sources),
              firstOrNull(operation.destinations)
            );
          case "timestamp":
            return this.createTimestamp(
              id, programId, firstOrNull(operation.sources),
              firstOrNull(operation.destinations)
            );
          case "merge":
            return this.createMerge(
              id, programId, operation.sources,
              firstOrNull(operation.destinations), operation.x, operation.y
            );
          default:
            console.log('Unknown operation: ' + operation.name);
        }
      }

      update(type, current, updated) {
        switch (type) {
          case "sample":
            return this.updateSample(current, updated);
          case "forgetAfter":
            return this.updateForgetAfter(current, updated);
          case "combine":
            return this.updateCombine(current, updated);
          case "filter":
            return this.updateFilter(current, updated);
          case "map":
            return this.updateMap(current, updated);
          case "subscribe":
            return this.updateSubscribe(current, updated);
          case "timestamp":
            return this.updateTimestamp(current, updated);
          case "merge":
            return this.updateMerge(current, updated);
          default:
            console.log('Unknown operation: ' + operation.name);
        }
      }

      createSample(id, programId, source, destination, rate) {
        return new SampleOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          id,
          programId,
          source,
          destination,
          rate
        );
      }

      updateSample(current, updated) {
        return current.setUpdated(updated.id, updated.rate, updated.sources[0], updated.destinations[0]);
      }

      createForgetAfter(id, programId, source, destination, rate) {
        return new ForgetAfterOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          id,
          programId,
          source,
          destination,
          rate
        );
      }

      updateForgetAfter(current, updated) {
        return current.setUpdated(updated.id, updated.rate, updated.sources[0], updated.destinations[0]);
      }

      createCombine(id, programId, sources, destination, x, y, body, helperId, helperName) {
        return new CombineOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          this.d.editorModule,
          this.d.programModule,
          this.d.helperModule,
          id,
          programId,
          sources,
          destination,
          x,
          y,
          body,
          helperId,
          helperName
        );
      }

      updateCombine(current, updated) {
        return current.setUpdated(
          updated.id, updated.programId, updated.sources,
          updated.destinations[0], updated.body,
          updated.helperId, updated.helperName
        );
      }

      createMerge(id, programId, sources, destination, x, y) {
        return new MergeOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          this.d.editorModule,
          this.d.programModule,
          id,
          programId,
          sources,
          destination,
          x,
          y
        );
      }

      updateMerge(current, updated) {
        return current.setUpdated(
          updated.id, updated.programId, updated.sources, updated.destinations[0]
        );
      }

      createFilter(id, programId, source, destination, body, helperId, helperName) {
        return new FilterOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          this.d.helperModule,
          id,
          programId,
          source,
          destination,
          body,
          helperId,
          helperName
        );
      }

      updateFilter(current, updated) {
        return current.setUpdated(
          updated.id, updated.programId, updated.sources[0],
          updated.destinations[0], updated.body,
          updated.helperId, updated.helperName
        );
      }

      createMap(id, programId, source, destination, body, helperId, helperName) {
        return new MapOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          this.d.helperModule,
          id,
          programId,
          source,
          destination,
          body,
          helperId,
          helperName
        );
      }

      updateMap(current, updated) {
        return current.setUpdated(
          updated.id, updated.programId, updated.sources[0],
          updated.destinations[0], updated.body,
          updated.helperId, updated.helperName
        );
      }

      createSubscribe(id, programId, source, destination) {
        return new SubscribeOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          id,
          programId,
          source,
          destination
        );
      }

      updateSubscribe(current, updated) {

      }

      createTimestamp(id, programId, source, destination) {
        return new TimestampOperation(
          this.d.operationModule,
          this.d.availableOperationsModule,
          this.d.streamModule,
          id,
          programId,
          source,
          destination
        );
      }

      updateTimestamp(current, updated) {

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
