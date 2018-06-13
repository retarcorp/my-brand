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
        this.isSelected = true;
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

}

