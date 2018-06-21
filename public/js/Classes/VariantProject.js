/**
 * VariantProject - класс вариантов основ проекта. Принимает вариант основы класса BaseVariant.
 * @constructor
 * @param {BaseVariant} variant - Вариант основы проекта
 */

class VariantProject {
    constructor(variant) {
        this.variant = variant;
        this.widgets = [];
        this.layers = [];
    }

    /**
     * Возвращает размер области варианта проекта.
     * @returns {*|number}
     */

    getSize(){
        return this.variant.size;
    }

    /**
     * Добавляет виджет. Возвращает ссылку на свой объект.
     * @param {Widget} widget - Виджет
     * @returns {VariantProject}
     */

    addWidget(widget){
        this.widgets.push(widget);

        return this;
    }

    deleteWidget(index) {
        this.removeWidget(index);
        this.removeLayer(index);
    }

    /**
     * Удаляет виджет из варианта проекта по его номеру. Возвращает ссылку на свой объект.
     * @param {number} index - Индекс элемента массива виджетов
     * @returns {VariantProject}
     */

    removeWidget(index){
        this.widgets.splice(index, 1);

        this.recountWidgets();

        return this;
    }

    removeLayer(index) {
        this.layers.splice(index, 1);

        this.recountLayers();

        return this;
    }

    /**
     * Поднимает виджет в очереди на отрисовку. Возвращает ссылку на свой объект.
     * @param {number} index - Индекс элемента массива виджетов
     * @returns {VariantProject}
     */

    upWidget(index){
        if (index > 0) {
            let buffer = this.widgets[index-1];

            this.widgets[index-1] = this.widgets[index];
            this.widgets[index] = buffer;

            this.recountWidgets();
        }

        return this;
    }

    /**
     * Опускает виджет в очереди на отрисовку. Возвращает ссылку на свой объект.
     * @param {number} index - Индекс элемента массива виджетов
     * @returns {VariantProject}
     */

    downWidget(index){
        if (index < this.widgets.length-1) {
            let buffer = this.widgets[index+1];

            this.widgets[index+1] = this.widgets[index];
            this.widgets[index] = buffer;

            this.recountWidgets();
        }

        return this;
    }

    recountWidgets() {
        this.widgets.forEach( (elem, index) => {
            elem.index = index;
        });
    }

    recountLayers() {
        this.layers.forEach( (elem, index) => {
            elem.index = index;
        });
    }

    render(ctx) {
        this.variant.render(ctx);

        this.widgets.forEach( (widget) => {
            widget.render(ctx);
        });

        if (!App.preview)
            this.variant.workzone.render(ctx);
    }
}