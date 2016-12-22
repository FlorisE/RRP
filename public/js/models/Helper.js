define(["lib/ace"], function () {

    class Helper {

      constructor(helperModule, id, name, body) {
        this.helperModule = helperModule;
        this.id = ko.observable(id);
        this.name = ko.observable(name);
        this.body = ko.observable(body ? body : "");
      }

      modal() {
        var editor = ace.edit("field-body");
        editor.setValue(this.body());
        this.body.subscribe(function (newValue) {
          editor.setValue(newValue);
        });

        editor.getSession().setMode("ace/mode/python");
        return this;
      }

      save() {
        var editor = ace.edit("field-body");
        var body = editor.getValue();

        if (this.id()) { // update
          this.helperModule.update(this.id(), this.name(), body);
        } else { // create
          this.helperModule.create(this.name(), body);
        }
      }
    }

    return Helper
  }
);