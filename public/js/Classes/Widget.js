/**
 * Widget - класс виджетов. Является наследуемым.
 * @constructor
 * @param {Position} position - Позиция виджета
 * @param {Size} size - Размер виджета
 */

class Widget {
    constructor(position, size) {
        this.position = position;
        this.size = size;
        this.isSelected = false;

        this.reverseX = 1;
        this.reverseY = 1;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Запускает отрисовку виджетов виджетов.
     * @param {2DRenderingContext} ctx - Контекст рисования
     */

    render(ctx, workzone) {

    }

    getFontSetings() {

    }

    moveBy(dx, dy) {

    }

    getSize() {

    }

    getPosition() {

    }

    pointIn() {

    }

    toggleXReverse() {
        this.reverseX = -this.reverseX;
    }

    toggleYReverse() {
        this.reverseY = -this.reverseY;
    }

    setPrintType(printType) {
        this.printType = parseInt(printType) || 0b001;
    }

    static fromJSON(json) {

        if (json.type == 'TextWidget') {
            return new TextWidget(json.position, json.text, json.color, json.fontSettings);

        } else if (json.type == 'ImageWidget') {
            return new ImageWidget(json.position, json.size, json.src);
        }
    }

}

