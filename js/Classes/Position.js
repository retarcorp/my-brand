/**
 * Position - класс позиции. Содержит координаты объекта.
 * @constructor
 * @param {number} x - Позиция по оси обсцис
 * @param {number} y - Позиция по оси ординат
 */

class Position {
    constructor(x, y) {

        if (arguments.length == 1 && arguments[0] instanceof Position) {
            this.x = arguments[0].x;
            this.y = arguments[0].y;

        } else {
            this.x = x;
            this.y = y;
        }

    }
}