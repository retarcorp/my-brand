class VerticalBaseLine extends BaseLine {
    constructor(position, size) {
        super(position, size);

        this.directions = [];
    }

    checkPosition(widget) {
        let _x = widget.position.x + App.currentWorkzone.position.x,
            _w = widget.size.width;

        if (this.position.x - 5 < _x && this.position.x + 5 > _x) {
            widget.position.x = this.position.x - App.currentWorkzone.position.x;
            this.setDirections("upLeft");

            return true;
        }

        if (this.position.x - 5 < _x + _w/2 && this.position.x + 5 > _x + _w/2) {
            widget.position.x = this.position.x - App.currentWorkzone.position.x - _w/2;

            return true;
        }

        if (this.position.x - 5 < _x + _w && this.position.x + 5 > _x + _w) {
            widget.position.x = this.position.x - App.currentWorkzone.position.x - _w;
            this.setDirections("upRight");

            return true;
        }

        return false;
    }

    setDirections(direction) {
        this.directions = (direction == "upLeft" || direction == "bottomLeft") ? ["upLeft", "bottomLeft"] : ["upRight", "bottomRight"];
        return this;
    }

    checkSize(position, direction) {
        const curr = App.GraphCore.currentWidget;
        let _x = curr.position.x + App.currentWorkzone.position.x,
            _y = curr.position.y + App.currentWorkzone.position.y,
            _w = curr.size.width,
            _h = curr.size.height;

        if (this.position.x - 5 < _x && this.position.x + 5 > _x) {
            curr.resizeBy(this.position.x - _x, position, direction);

            if (!this.directions.length) this.setDirections(direction);

            return true;
        }

        if (this.position.x - 5 < _x + _w && this.position.x + 5 > _x + _w) {
            curr.resizeBy(this.position.x - _x - _w, position, direction);

            if (!this.directions.length) this.setDirections(direction);

            return true;
        }

        this.directions = [];

        return false;
    }

    render(ctx) {

        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(Math.ceil(App.currentWorkzone.size.width/2 + App.currentWorkzone.position.x), 0);
        ctx.lineTo(Math.ceil(App.currentWorkzone.size.width/2 + App.currentWorkzone.position.x), App.GraphCore.canvas.height);
        ctx.stroke();
    }
}