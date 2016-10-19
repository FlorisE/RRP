define(['knockout'], function (ko) {
    class Dragger {
        constructor(startX, startY, save, el) {
            this.startX = startX;
            this.startY = startY;
            this.save = save;
            this.el = el;
        }

        dragMove(x, y) {
            var data = ko.dataFor(this.el);
            data.x(x);
            data.y(y);
        }

        dragStop(x, y) {
            if (!(x == this.startX && y == this.startY)) {
                var data = ko.dataFor(this.el);
                this.save(data);
            }
        }
    }

    return Dragger
});