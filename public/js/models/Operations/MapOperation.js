define(['knockout', './HelperBodyOperation'], function (ko, HelperBodyOperation) {
        class MapOperation extends HelperBodyOperation {
            constructor(operationModule,
                        availableOperationsModule,
                        streamModule,
                        helperModule,
                        id,
                        source,
                        destination,
                        body,
                        helperId,
                        helperName) {
                super(operationModule,
                      availableOperationsModule,
                      streamModule,
                      helperModule,
                      id,
                      source,
                      destination,
                      body,
                      helperId,
                      helperName);

                this.name("map");
            }

            copy() {
                return new MapOperation(
                    this.operationModule,
                    this.availableOperationsModule,
                    this.streamModule,
                    this.helperModule,
                    this.id(),
                    this.source(),
                    this.destination(),
                    this.body(),
                    this.helperId(),
                    this.helperName()
                )
            }

            modal() {
                super.modal("Mapped");
                return this;
            }
        }

        return MapOperation
    }
);