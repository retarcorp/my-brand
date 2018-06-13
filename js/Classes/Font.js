/**
 * Font - класс шрифтов. Хранит имя и путь к шрифту.
 * @constructor
 * @param {string} name - Имя шрифта
 * @param {string} src - Путь к шрифту
 */

class Font {
    constructor(name, src) {
        this.name = name;
        this.src = src;
    }

    /**
     * Принимает json объект и возвращает экземпляр класса Font.
     * @param obj
     * @returns {Font}
     */

    static fromJSON(obj) {
        return (new this(obj.name, obj.src));
    }

}