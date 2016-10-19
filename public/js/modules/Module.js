define([], function() {
    class Module {
        constructor(d) {
            this.d = d;
            d.observers.push(this);
        }

        inject() {
            $.extend(this, this.d);
        }
    }

    return Module;
});