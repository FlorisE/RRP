define(['knockout'], function (ko) {

    class Operation {
      constructor(operationModule,
                  availableOperationsModule,
                  streamModule,
                  id,
                  programId,
                  hasProceduralParameter,
                  helperModule,
                  body,
                  helperId,
                  helperName) {
        this.operationModule = operationModule;
        this.streamModule = streamModule;
        this.id = ko.observable(id);
        this.name = ko.observable(); // this should be set by an
                                     // implementing class
        this.suffix = ko.observable();
        this.programId = ko.observable(programId);

        this.deleteOperation = function () {
          this.operationModule.remove(
            this.id(),
            () => $('#add-op').modal('hide')
          );
        };

        this.hasProceduralParameter = hasProceduralParameter;

        if (hasProceduralParameter) {
          this.helperModule = helperModule;
          this.body = ko.observable(body);
          this.helperId = ko.observable(helperId);
          this.helperName = ko.observable(helperName);

          this.bodyOrHelper = ko.observable(
            this.helperName() ? "helper" : "body"
          );

          this.hasHelper = ko.computed(
            () => this.bodyOrHelper() === "helper"
          );

          this.hasBody = ko.computed(
            () => this.bodyOrHelper() === "body"
          );

          this.selectedHelper = ko.observable(helperModule.get(helperId));
        }
      }

      // This has to be called by an implementing class
      // after the name has been set
      initLabel() {
        this.label = ko.computed(function () {
          return this.getLabel();
        }, this);
      }

      // sometimes overwritten by a base class
      getLabel() {
        if (!this.hasProceduralParameter) {
          return this.name();
        } else if (this.bodyOrHelper() == "helper") {
          return `${this.name()} (${this.helperName()})`;
        } else {
          return `${this.name()} (${this.body()})`;
        }
      }

      copy() {
        return new Operation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.id(),
          this.programId
        );
      }

      getBaseMessage() {
        let returnValue = {
          type: "operation",
          name: this.outputStreamName(),
          programId: this.programId(),
          operation: this.name(),
          id: this.id()
        };

        if (this.hasProceduralParameter) {
          if (this.bodyOrHelper() == "helper") {
            returnValue.helper = this.helperId() ?
              this.helperId() :
              this.selectedHelper().id();
          } else {
            returnValue.body = this.body();
          }
        }

        return returnValue;
      }

      modal() {
        if (!this.id()) {
          this.action = "Add operation";
        } else {
          this.action = "Edit operation";
        }
        this.selectedOperation = this.name();

        return this;
      }

      save() {
        if (this.id()) { // update
          this.operationModule.saveUpdated(
            this.getUpdateMessage(),
            () => $('#add-op').modal('hide')
          );
        } else { // add
          this.operationModule.saveNew(
            this.getCreateMessage(),
            () => $('#add-op').modal('hide')
          );
        }
      }

      setUpdated(id, body, helperId, helperName, programId=null) {
        this.id(id);
        this.body(body);
        this.helperId(helperId);
        this.helperName(helperName);
        this.bodyOrHelper(this.helperName() ? "helper" : "body");
        if (programId !== null)
          this.programId(programId);
        return this;
      }
    }

    return Operation
  }
);
