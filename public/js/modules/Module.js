define([], function() {
    class Module {
        constructor(d, connectionHandler) {
            this.d = d;
            this.connectionHandler = connectionHandler;
            d.observers.push(this);
        }

        inject() {
            $.extend(this, this.d);
        }
    }

    return Module;
});
