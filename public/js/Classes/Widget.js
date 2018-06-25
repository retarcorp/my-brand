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

    static fromJSON(json) {

        if (json.type == 'TextWidget') {
            return new TextWidget(json.position, json.text, json.color, json.fontSettings);

        } else if (json.type == 'ImageWidget') {
            return new ImageWidget(json.position, json.size, json.src);
        }
    }

}

