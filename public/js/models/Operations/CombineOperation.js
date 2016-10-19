define([
    'knockout',
    '../../util/JSPlumbInstance',
    '../../util/dragger'
    ],
    function(ko,
             jsplumb,
             Dragger) {

        class CombineOperation {
            constructor(
                operationModule,
                availableOperationsModule,
                streamModule,
                id,
                sources,
                destination,
                x,
                y
            ) {
                this.operationModule = operationModule;
                this.availableOperationsModule = availableOperationsModule;
                this.streamModule = streamModule;

                this.id = ko.observable(id);
                this.sources = ko.observableArray(sources);
                this.destination = ko.observable(destination);
                this.name = ko.observable("combine");
                this.x = ko.observable(x);
                this.y = ko.observable(y);

                this.xpx = ko.computed(() => this.x() + "px");
                this.ypx = ko.computed(() => this.y() + "px");
            }

            draw() {
                this.enableDragging();
                this.connectOut();
                this.connectIn();
            }

            addSource(source) {
                this.sources.push(source);
                this.connectIn();
            }

            enableDragging() {
                var dragger = new Dragger();
                var self = this;
                jsplumb.draggable(
                    $("#operator" + this.id()),
                    {
                        start: function (params) {
                            dragger = new Dragger(
                                self.x(),
                                self.y(),
                                (operation) => self.update(operation.id(), operation),
                                params.el
                            );
                        },
                        drag: function (params) {
                            dragger.dragMove(params.pos[0], params.pos[1]);
                        },
                        stop: function (params) {
                            dragger.dragStop(params.pos[0], params.pos[1]);
                        }
                    }
                );
            }

            connectOut() {
                jsplumb.connect({
                    source: jsplumb.addEndpoint(
                        "operator" + this.id(),
                        {
                            endpoint: "Blank"
                        }
                    ),
                    target: jsplumb.addEndpoint(
                        "stream" + this.destination(),
                        {
                            endpoint: "Blank",
                            anchor: "TopCenter"
                        }
                    )
                });
            }

            connectIn() {
                var self = this;
                this.sources().forEach(function(source) {
                    jsplumb.connect({
                        source: "stream" + source,
                        target: jsplumb.addEndpoint(
                            "operator" + self.id(),
                            {
                                endpoint: "Blank",
                                anchor: "TopCenter"
                            }
                        )
                    });
                });
            }

            update() {
                this.operationModule.saveUpdated(this.getUpdateMessage());
                this.operationModule.update(this.id(), this);
            }

            getUpdateMessage() {
                return {
                    type: "operator",
                    action: "updateNAry",
                    id: this.id(),
                    operator: this.name(),
                    x: this.x(),
                    y: this.y()
                }
            }

            copy() {
                var operation = new CombineOperation(
                    this.operationModule,
                    this.availableOperationsModule,
                    this.streamModule,
                    this.id(),
                    this.source(),
                    this.destination(),
                    this.x(),
                    this.y()
                )
            }

            modal() {

            }
        }

        return CombineOperation
    }
);