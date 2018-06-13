class BaseLine {
    constructor(position, size) {
        this.position = new Position(position.x + size.width/2, position.y + size.height/2);
        this.size = new Size(size.width/2, size.height/2);
    }

    checkPosition(position) {
        
    }

    render(ctx) {

    }
}