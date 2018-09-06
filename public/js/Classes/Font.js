/**
 * Font - класс шрифтов. Хранит имя и путь к шрифту.
 * @constructor
 * @param {string} name - Имя шрифта
 * @param {string} src - Путь к шрифту
 */

class Font {
    constructor(name, src, fancywork, print, _3D) {
        this.name = name;
        this.src = src;
        this.fancywork = fancywork;
        this.print = print;
        this._3D = _3D;
    }

    /**
     * Принимает json объект и возвращает экземпляр класса Font.
     * @param obj
     * @returns {Font}
     */

    static fromJSON(obj) {
        return (new this(obj.font, obj.src, obj.fancywork, obj.print, obj._3D));
    }

}