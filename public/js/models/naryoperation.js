define(['./dragger'], function (Dragger) {
    class NAryOperation {
        constructor(jsplumb, connectionHandler, operation) {
            this.jsplumb = jsplumb;
            this.connectionHandler = connectionHandler;
            this.operation = operation;
        }

        nary() {
            var operation = this.operation;
            var dragger = new Dragger();

            this.jsplumb.draggable(
                $("#operator" + operation.id),
                {
                    start: function (params) {
                        t = this.connectionHandler.transmitter;
                        dragger = new Dragger(
                            operation.x,
                            operation.y,
                            t.updateNAry.bind(t),
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
            this.jsplumb.connect({
                source: this.jsplumb.addEndpoint(
                    "operator" + operation.id,
                    {
                        endpoint: "Blank"
                    }
                ),
                target: this.jsplumb.addEndpoint(
                    "stream" + operation.destination.id,
                    {
                        endpoint: "Blank",
                        anchor: "TopCenter"
                    }
                )
            });
            this.addInForNAry();
        }

        addInForNAry() {
            this.jsplumb.connect({
                source: "stream" + this.operation.source.id,
                target: this.jsplumb.addEndpoint(
                    "operator" + this.operation.id,
                    {
                        endpoint: "Blank",
                        anchor: "TopCenter"
                    }
                )
            });
        }
    }

    return NAryOperation
});