/**
 * Font - класс шрифтов. Хранит имя и путь к шрифту.
 * @constructor
 * @param {string} name - Имя шрифта
 * @param {string} src - Путь к шрифту
 */

class Font {
    constructor(name, src, fancywork, print) {
        this.name = name;
        this.src = src;
        this.fancywork = fancywork;
        this.print = print;
    }

    /**
     * Принимает json объект и возвращает экземпляр класса Font.
     * @param obj
     * @returns {Font}
     */

    static fromJSON(obj) {
        return (new this(obj.font, obj.src, obj.fancywork, obj.print));
    }

}