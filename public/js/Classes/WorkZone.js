/**
 * WorkZone - класс рабочей области. Хранит позицию и размеры рабочей области.
 * @constructor
 * @param {Position} position - Позиция рабочей области
 * @param {Size} size - Размер рабочей области
 */

class WorkZone {
    constructor(position, size) {
        this.position = position;
        this.size = size;

        this.verticalLine = new VerticalBaseLine(position, size);
        this.horizontalLine = new HorizontalBaseLine(position, size);

        this.lineOffset = 0;
    }

    underMouse(position){
        if (this.position.x < position.x && this.position.x + this.size.width > position.x &&
            this.position.y < position.y && this.position.y + this.size.height > position.y) {
            return true;
        }

        return false;
    }

    /**
     * Принимает json объеткт и возвращает экземпляр класса WorkZone.
     * @param json
     * @returns {WorkZone}
     */

    static fromJSON(json){
        return new this(json.position || new Position(json.x, json.y), json.size || new Size(json.width, json.height));
    }

    render(ctx) {
        if (!App.isPreview) {
            ctx.strokeStyle = "#00F";

            this.verticalLine.render(ctx);
            this.horizontalLine.render(ctx);

            ctx.strokeStyle = "#000";

            if (this.lineOffset < 48) {
                this.lineOffset++;
            } else this.lineOffset = 0;

            ctx.lineDashOffset = this.lineOffset;
            ctx.setLineDash([12]);

            ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.size.height);
        }

    }
}