class Canvas {
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    init() {
        this.GraphCore.canvas.addEventListener('mouseup', this.GraphCore.mouseUp.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mousedown', this.GraphCore.mouseDown.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mousemove', this.GraphCore.mouseMove.bind(this.GraphCore));
        //this.GraphCore.canvas.addEventListener('mousewheel', this.GraphCore.mouseWheel.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mouseover', this.GraphCore.mouseOver.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mouseout', this.GraphCore.mouseOut.bind(this.GraphCore));
    }

    clear(ctx) {
        ctx = ctx || this.GraphCore.ctx;
        ctx.clearRect(-1,-1,ctx.canvas.width+2, ctx.canvas.height+2);

    }
}