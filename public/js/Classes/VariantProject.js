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

    async loadLazy() {
        this.static_loaded = false;

        const promises = this.widgets
            .filter(w => w instanceof ImageWidget)
            .map( (widget) => {
                return widget.loadLazy();
            });

        await this.variant.loadLazy();
        await Promise.all(promises);
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

    deleteWidget(id) {
        this.removeWidget(id);
        this.removeLayer(id);
    }

    /**
     * Удаляет виджет из варианта проекта по его номеру. Возвращает ссылку на свой объект.
     * @param {number} index - Индекс элемента массива виджетов
     * @returns {VariantProject}
     */

    removeWidget(id){
        let index = -1;

        const _del = this.widgets.find( (w, ind) => {
            index = ind;
            return w.id == id;
        });

        this.widgets.splice(index, 1);

        this.recountWidgets();

        return this;
    }

    removeLayer(id) {
        let index = -1;

        const _del = this.layers.find( (w, ind) => {
            index = ind;
            return w.id == id;
        });

        this.layers.splice(index, 1);

        this.recountLayers();

        return this;
    }

    /**
     * Поднимает виджет в очереди на отрисовку. Возвращает ссылку на свой объект.
     * @param {number} index - Индекс элемента массива виджетов
     * @returns {VariantProject}
     */

    upWidget(id){
        let index = -1;

        const widget = this.widgets.find( (w, ind) => {
            index = ind;
            return w.id == id;
        })

        if (index >= 0 && index < this.widgets.length - 1) {
            let buffer = this.widgets[index];

            this.widgets[index] = this.widgets[index+1];
            this.widgets[index+1] = buffer;
            // this.widgets.splice(index, 1);
            // this.widgets.push(buffer);

            this.recountWidgets();
        }

        return this;
    }

    /**
     * Опускает виджет в очереди на отрисовку. Возвращает ссылку на свой объект.
     * @param {number} index - Индекс элемента массива виджетов
     * @returns {VariantProject}
     */

    downWidget(id){
        let index = -1;

        const widget = this.widgets.find( (w, ind) => {
            index = ind;
            return w.id == id;
        });

        if (index <= this.widgets.length-1 && index > 0) {
            let buffer = this.widgets[index];

            this.widgets[index] = this.widgets[index - 1];
            this.widgets[index - 1] = buffer;
            // this.widgets[index+1] = this.widgets[index];
            // this.widgets[index] = buffer;

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

    projectLoaded() {
        let widgetsLoaded = !(this.widgets.find( (w) => !w.download)),
            variantLoaded = this.variant.loaded;

        return (widgetsLoaded && variantLoaded);
    }

    render(ctx) {
        //if (this.projectLoaded()) {
        this.variant.render(ctx);

        this.widgets.forEach( (widget) => {
            widget.render(ctx);
        });

        ctx.drawImage(this.variant.static, 0, 0, 400, 400 * this.variant.static.height/this.variant.static.width);


        if (!App.preview)
            this.variant.workzone.render(ctx);
        //}
    }
}