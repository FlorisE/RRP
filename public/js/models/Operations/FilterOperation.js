define(['knockout', './HelperBodyOperation'], function (ko, HelperBodyOperation) {
        class FilterOperation extends HelperBodyOperation {
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

                this.name("filter");
            }

            copy() {
                return new FilterOperation(
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
                super.modal("Filtered");
                return this;
            }
        }

        return FilterOperation
    }
);