define(
    [
        'knockout',
        '../util/ObservableMap',
        'models/Program',
        './Module',
        '../util/ObservableMapToKOObservableArray'
    ],
    function(ko,
             ObservableMap,
             Program,
             Module,
             mtoa) {

        class ProgramModule extends Module {

            constructor(d, connectionHandler) {
                super(d, connectionHandler);
                this.programs = new ObservableMap([]);
                this.observers = [];

                this.connectionHandler.register(
                    "program", "add",
                    (entry) => this.add(
                        entry.id, entry.name, entry.neo4jId
                    )
                );
                this.connectionHandler.register(
                    "program", "remove",
                    (entry) => this.delete(
                        entry.id, entry.name, entry.neo4jId
                    )
                );
            }

            get(id) {
                return this.programs.get(id);
            }

            getAll() {
                return this.programs.values();
            }

            create(name, callback) {
                this.connectionHandler.emit(
                    {
                        type: 'program',
                        action: 'add',
                        name: name
                    },
                    callback
                );
            }

            instantiate(name) {
                return new Program(this.d.streamModule,
                                   this.d.operationModule,
                                   this.d.editorModule,
                                   this,
                                   null,
                                   name);
            }

            add(id, name, neo4jId) {
                var program = new Program(this.d.streamModule,
                                          this.d.operationModule,
                                          this.d.editorModule,
                                          this,
                                          id,
                                          name,
                                          neo4jId);

                mtoa(this.d.streamModule, program.streams);
                this.programs.set(id, program);
                return program;
            }

            update(id, program) {
                this.programs.set(id, program);
            }

            remove(id, callback) {
                this.connectionHandler.emit(
                    {
                        type: 'program',
                        action: 'delete',
                        id: id
                    },
                    callback
                );
            }

            delete(id) {
                return this.programs.delete(id);
            }

            clear() {
                this.programs.clear();
            }

            register(observer) {
                this.programs.register(observer);
                this.observers.push(observer);
            }

            loadAll() {
                var self = this;
                this.connectionHandler.emit(
                    {
                        type: "program",
                        action: "loadAll"
                    }
                );
            }

            load(id) {
                var self = this;
                this.get(id).load();
                this.connectionHandler.emit(
                    {
                        type: "program",
                        action: "load",
                        id: id
                    }
                );
            }
        }

        return ProgramModule;
    }
);
