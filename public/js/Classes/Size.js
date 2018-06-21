/**
 * Size - класс хранит высоту и ширину элементов.
 * @constructor
 * @param {number} width - Ширина
 * @param {number} height - Высота
 */

class Size {
    constructor(width, height) {

        if (arguments.length == 1 && arguments[0] instanceof Size) {
            this.width = arguments[0].width;
            this.height = arguments[0].height;

        } else {
            this.width = width;
            this.height = height;
        }

    }
}