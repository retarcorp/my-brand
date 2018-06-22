class Path {
    constructor(position, size) {
        this.position = position;
        this.size = size;
    }

    render(ctx) {
        let distance = Path.Settings.distance,
            _x = this.position.x + App.currentWorkzone.position.x - distance,
            _y = this.position.y + App.currentWorkzone.position.y - distance,
            _w = this.size.width + distance,
            _h = this.size.height + distance;

        ctx.strokeStyle = Path.Settings.color;
        ctx.lineWidth = Path.Settings.lineWidth;
        ctx.setLineDash(Path.Settings.lineDash);
        ctx.lineDashOffset = 0;

        ctx.strokeRect(_x, _y, _w, _h);

        ctx.fillStyle = Path.Settings.polColor;

        ctx.fillRect(_x - 2, _y - 2, 4, 4);
        ctx.fillRect(_x - 2, _y + _h - 2, 4, 4);
        ctx.fillRect(_x + _w - 2, _y + _h - 2, 4, 4);
        ctx.fillRect(_x + _w - 2, _y - 2, 4, 4);

        ctx.beginPath();
        ctx.arc(_x + Math.floor(_w/2), _y, 2, 0, 360);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(_x, _y + Math.floor(_h/2), 2, 0 ,360);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(_x + _w, _y + Math.floor(_h/2), 2, 0, 360);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(_x + Math.floor(_w/2), _y + _h, 2, 0, 360);
        ctx.fill();
    }
}

Path.Settings = {
    color: '#000'
    ,lineWidth: 1
    ,lineDash: [5]
    ,distance: 1
    ,polColor: "#000"
}
