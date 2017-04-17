define(
  [
    'knockout',
    './Operation',
    '../../util/JSPlumbInstance',
    '../../util/dragger'
  ],
  function (ko,
            Operation,
            jsplumb,
            Dragger) {
  "use strict";

  class ManyToOneOperation extends Operation {
    constructor(operationModule,
                availableOperationsModule,
                streamModule,
                editorModule,
                programModule,
                id,
                programId,
                sources,
                destination,
                x,
                y,
                hasProceduralParameter,
                helperModule,
                body,
                helperId,
                helperName) {
      super(
        operationModule,
        availableOperationsModule,
        streamModule,
        id,
        programId,
        hasProceduralParameter,
        helperModule,
        body,
        helperId,
        helperName
      );

      this.editorModule = editorModule;
      this.programModule = programModule;
      this.sources = ko.observableArray(sources);
      this.destination = ko.observable(destination);
      this.x = ko.observable(x);
      this.y = ko.observable(y);

      this.sourceInstances = sources.map(
        (source) => {
          return this.streamModule.get(source);
        }
      );

      if (this.id()) {
        this.destinationInstance = this.streamModule.get(
          this.destination()
        );
      }

      this.program = programModule.get(programId);

      this.inputStreams = ko.observableArray(this.sourceInstances);

      this.selectedStreamToAdd = ko.observable(null);
      this.xpx = ko.computed(() => this.x() + "px");
      this.ypx = ko.computed(() => this.y() + "px");

      this.outputStreamName = ko.observable(
        this.destinationInstance ?
          this.destinationInstance.name() :
          null
      );
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
      var m = new Mottle({ smartClicks:true });

      m.on($("#operation" + self.id()), "tap", function(e) {
        $('#add-op').modal();
        let editor = self.editorModule.getEditor();
        let element = $("#operation" + self.id());
        let data = ko.dataFor(element[0]);
        editor.operationModal(
          self.editorModule.createOperationModal(data, element)
        );
      });

      jsplumb.draggable(
        $("#operation" + this.id()),
        {
          start: function (params) {
            dragger = new Dragger(
              self.x(),
              self.y(),
              (operation) => self.save(operation.id(), operation),
              params.el
            );
            $("#operation" + self.id()).removeAttr("data-toggle");
          },
          drag: function (params) {
            dragger.dragMove(params.pos[0], params.pos[1]);
          },
          stop: function (params) {
            dragger.dragStop(params.pos[0], params.pos[1]);
            $("#operation" + self.id()).attr("data-toggle", "modal");
          }
        }
      );
    }

    drag() {
      return {
        type: "operation",
        action: "drag",
        id: this.id(),
        x: this.x(),
        y: this.y()
      }
    }

    connectOut() {
      jsplumb.connect({
        source: jsplumb.addEndpoint(
          "operation" + this.id(),
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
      this.sources().forEach(function (source) {
        jsplumb.connect({
          source: "stream" + source,
          target: jsplumb.addEndpoint(
            "operation" + self.id(),
            {
              endpoint: "Blank",
              anchor: "TopCenter"
            }
          )
        });
      });
    }

    copy() {
      return new ManyToOneOperation(
        this.operationModule,
        this.availableOperationsModule,
        this.streamModule,
        this.id(),
        this.sources(),
        this.destination()
      );
    }

    modal() {
      super.modal();

      const self = this;

      this.availableInputStreams = ko.computed(() =>
        this.program.streams().filter(
          (stream) => this.inputStreams().find(
            (instance) => instance === stream
          ) === undefined && stream !== this.destinationInstance
        )
      );

      this.appendItem = function() {
        this.inputStreams.push(this.selectedStreamToAdd());
      };
      this.removeItem = function(stream) {
        self.inputStreams.remove(stream);
      };

      return this;
    }

    getCreateMessage() {
      var baseMsg = super.getBaseMessage();
      baseMsg.action = "add";
      baseMsg.sources = this.inputStreams().map((stream) => stream.id());
      baseMsg.x = this.calculateX(this.inputStreams());
      baseMsg.y = this.calculateY(this.inputStreams());
      baseMsg.opx = baseMsg.x;
      baseMsg.opy = baseMsg.y - 50;
      return baseMsg;
    }

    calculateX(streams) {
      // return average X of all streams
      return Math.ceil(
        streams.reduce(
          (accum, stream) => accum + (stream.x() / streams.length),
          0)
      );
    }

    calculateY(streams) {
      // return y value of the lowest stream on the page, plus 100
      return streams.reduce(
        (accum, stream) => stream.y() > accum
          ? stream.y()
          : accum, 0) + 100;
    }

    getUpdateMessage() {
      var baseMsg = super.getBaseMessage();
      baseMsg.action = "update";
      baseMsg.x = this.x();
      baseMsg.y = this.y();
      baseMsg.sources = this.inputStreams().map(
        (source) => source.id()
      );
      baseMsg.destinationId = this.destinationInstance.id();
      return baseMsg;
    }

    setUpdated(id, sources, destination, body, helperId, helperName, programId) {
      super.setUpdated(id, body, helperId, helperName, programId);
      this.sources(sources);
      this.destination(destination);
    }

    change() {
      this.operationModule.saveUpdated(this.getUpdateMessage());
      this.operationModule.update(this.id(), this);
    }
  }

  return ManyToOneOperation;

});