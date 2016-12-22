define([
        '../util/dragger',
        '../util/JSPlumbInstance'
    ],
    function(Dragger,
             jsplumb)
    {

    class Stream {

        constructor(streamModule, id, name, x, y, program) {
            var self = this;
            this.streamModule = streamModule;
            this.program = program;

            this.streamClass = "stream";

            this.menuVisible = ko.observable(false);
            this.id = ko.observable(id);
            this.name = ko.observable(name);
            this.x = ko.observable(x);
            this.y = ko.observable(y);

            this.xpx = ko.computed(() => this.x() + "px");
            this.ypx = ko.computed(() => this.y() + "px");

            this.addable = true;
            this.edittable = false;
            this.deletable = true;

            this.in = ko.computed(function () {
                return self.program.operations().filter(
                    (operation) => operation.destination() == self.id()
                );
            }, this);

            this.out = ko.computed(function () {
                return self.program.operations().filter(
                    (operation) => {
                        if (operation["source"]) {
                            return operation.source() == self.id();
                        } else if (operation["sources"]) {
                            return operation.sources().find(
                                (source) => source === self.id()
                            );
                        }
                    }
                );
            }, this);

            this.deleteClicked = function(operation) {
                jsplumb.detachAllConnections(
                    $('#stream' + self.id())
                );
                self.streamModule.delete(self.id());
                return true;
            };
        }

        draw() {
            var self = this;
            var dragger = null;
            var m = new Mottle({ smartClicks:true });

            m.on($("#stream" + self.id() + " > div.stream-item"), "tap", function(e) {
                if (e.ctrlKey) {
                    jsplumb.addToDragSelection(el);
                } else {
                    var targetState = !self.menuVisible();
                    self.program.hideAllMenus();
                    self.menuVisible(targetState);
                    return true;
                }
            });

            jsplumb.draggable(
                $("#stream" + this.id()),
                {
                    start: function (params) {
                        dragger = new Dragger(
                            self.x(),
                            self.y(),
                            self.update.bind(self),
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

        update() {
            this.streamModule.update(this.id(), this);
        }
    }

    return Stream;
});