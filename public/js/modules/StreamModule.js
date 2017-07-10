define(
    [
        '../models/Stream',
        '../util/ObservableMap',
        './Module'
    ],
    function(Stream,
             ObservableMap,
             Module) {

        class StreamModule extends Module {

            constructor(d, connectionHandler) {
                super(d, connectionHandler);
                var self = this;
                this.streams = new ObservableMap([]);
                this.connectionHandler.register("stream", "add",
                    function (item) {
                        return self.addStream(
                            item.id,
                            item.name,
                            item.x,
                            item.y,
                            self.programModule.get(item.programId)
                        )
                    }
                );
                this.connectionHandler.register("stream", "update",
                    (item) => {
                        var stream = this.streams.get(item.id);
                        stream.name(item.name);
                        stream.x(item.x);
                        stream.y(item.y);
                        this.streams.set(
                            item.id, stream
                        )
                    }
                );
                this.connectionHandler.register("stream", "remove",
                    (item) => this.streams.remove(item.id)
                );
            }

            get(id) {
                return this.streams.get(id);
            }

            getAll() {
                return this.streams.values();
            }

            addStream(id, name, x, y, program) {
                var stream = new Stream(this, id, name, x, y, program);
                return this.add(id, stream);
            }

            add(id, stream) {
                this.streams.set(id, stream);
                return stream;
            }

            update(id, stream) {
                this.streams.set(id, stream);
                this.connectionHandler.emit({
                    type: "stream",
                    action: "update",
                    id: stream.id(),
                    x: stream.x(),
                    y: stream.y(),
                    name: stream.name()
                });
            }

            remove(id) {
                this.connectionHandler.emit({
                    type: "stream", action: "remove", id: id
                });
            }

            clear() {
                this.streams.clear();
            }

            register(observer) {
                this.streams.register(observer);
            }

            get programModule() {
                return this._programModule;
            }

            set programModule(programModule) {
                this._programModule = programModule;
            }

            get program() {
                return this._program;
            }

            set program(program) {
                this._program = program;
            }

            save() {
                console.log("save in stream");
            }
        }

        return StreamModule;
    }
);
