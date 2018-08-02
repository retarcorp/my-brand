/**
 * Base - класс основ футболок. Хранит её виды, цену. Иденцифицируется полем name. В качестве входных данных использует имя и цену.
 * @constructor
 * @param {string} name - Имя основы.
 * @param {number} price - Цена продукта.
 */

class Base  {
    constructor(name, price, color, colorArray, size, type, _id, fancywork, print) {
        this.variants = [];
        this.price = price;
        this.name = name;
        this.color = color;
        this.colorArray = colorArray;
        this.size = size;
        this.type = type;
        this._id = _id;
        this.fancywork = fancywork;
        this.print = print;
    }

    /**
     * Функция добавления массива вариантов основы класса BaseVariant. Возвращает саму себя.
     * @param variants - Массив вариантов.
     * @returns {Base}
     */

    addVariants(...variants){
        this.variants.push(...variants);
        return this;
    }

    /**
     * Функция возвращает превью основы.
     * @returns {string}
     */

    getPreviewImage(){
        return this.variants[0].src;
    }

    /**
     * Создаёт экземпляр класса Base из json строки.
     * @param {Object} obj - Объект из json.
     * @returns {Base}
     */

    static fromJSON(obj) {

        //console.log(obj.variants);

        return (
            new this(obj.name, obj.price, obj.color, obj.colorArray, obj.size, obj.type, obj._id, obj.fancywork, obj.print)
            .addVariants(
                ...obj.variants.map(
                    variant => BaseVariant.fromJSON(variant)
                 )
            )
        );
    }
}