class HorizontalBaseLine extends BaseLine {
    constructor(position, size) {
        super(position, size);

        this.directions = [];
    }

    checkPosition(widget) {
        let _y = widget.position.y + App.currentWorkzone.position.y,
            _h = widget.size.height;

        if (this.position.y - 5 < _y && this.position.y + 5 > _y) {
            widget.position.y = this.position.y - App.currentWorkzone.position.y;

            this.setDirections("upRight");
            return true;
        }

        if (this.position.y - 5 < _y + _h/2 && this.position.y + 5 > _y + _h/2) {
            widget.position.y = this.position.y - App.currentWorkzone.position.y - _h/2;

            return true;
        }

        if (this.position.y - 5 < _y + _h && this.position.y + 5 > _y + _h) {
            widget.position.y = this.position.y - App.currentWorkzone.position.y - _h;

            this.setDirections("bottomRight");
            return true;
        }

        return false;
    }

    setDirections(direction) {
        this.directions = (direction == "upLeft" || direction == "upRight") ? ["upLeft", "upRight"] : ["bottomLeft", "bottomRight"];
        return this;
    }

    checkSize(position, direction) {
        const curr = App.GraphCore.currentWidget;
        let _x = curr.position.x + App.currentWorkzone.position.x,
            _y = Math.round(curr.position.y + App.currentWorkzone.position.y),
            _w = curr.size.width,
            _h = curr.size.height,
            _int = (curr instanceof TextWidget) ? curr.fontSettings.fontSize/curr.size.width : curr.size.height/curr.size.width,
            _dx = 0,
            _det = (curr instanceof TextWidget) ? curr.lines.length : 1;

        if (this.position.y - 5 < _y && this.position.y + 5 > _y) {

            if (direction == "upLeft") _dx = (this.position.y - _y)/_int/_det;
            else _dx = -(this.position.y - _y)/_int/_det;

            if (this.position.y - _y > -2 && this.position.y - _y < 2 && this.attached) {
                curr.resizeBy(_dx, position, "upLeft");

            }else
                curr.resizeBy(_dx, position, direction);

            this.attached = true;
            if (!this.directions.length) {
                console.log('set direction')
                this.setDirections(direction);
            }

            return true;
        }

        if (this.position.y - 5 < _y + _h && this.position.y + 5 > _y + _h) {

            if (direction == "bottomLeft") _dx = -(this.position.y - _y - _h)/_int/_det;
            else _dx = (this.position.y - _y - _h)/_int/_det;

            if (this.position.y - _y - _h != 0 && this.attached) {
                curr.resizeBy(_dx, position, "bottomLeft");
            } else if (this.attached)
                curr.resizeBy(_dx, position, direction);

            //console.log(_dx);

            this.attached = true;
            if (!this.directions.length){
                this.setDirections(direction);
                console.log('set DIRECTIONS');
            }

            return true;
        }

        this.attached = false;
        this.directions = [];

//        console.log(this.position.y, _y + _h, _dx);

        return false;
    }

    render(ctx) {
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(0, this.position.y);
        ctx.lineTo(App.GraphCore.canvas.width, this.position.y);
        ctx.stroke();
    }
}
