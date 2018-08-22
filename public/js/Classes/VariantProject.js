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

        const promises = this.widgets.map( w => {
            return w.loadLazy();
        });

        // const promises = this.widgets
        //     .filter(w => w instanceof ImageWidget)
        //     .map( (widget) => {
        //         return widget.loadLazy();
        //     });

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

    changeImageWidget(id, print) {
        const widget = this.widgets.find( w => w.id == id);

        if (widget && widget instanceof ImageWidget) {
            widget.src = print.src;
            widget.tags = print.tags;
            widget.text = print.name;
            widget.fancywork = print.fancywork;
            widget.print = print.print;
            widget.layer.text = print.name;
            widget._id = print._id;

            return widget.loadLazy();
        }

        return new Promise((res, rej) => {
            rej();
        });
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

    getImageData(ctx) {
        return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    render(ctx) { //INNER
        //if (this.projectLoaded()) {
        this.variant.render(ctx);

        const variant_layer = this.getImageData(ctx);

        this.widgets.forEach( (widget) => {
            widget.render(ctx);
        });

        const widgets_layer = this.getImageData(ctx);

        const variant_data = variant_layer.data,
            length = variant_data.length,
            widgets_data = widgets_layer.data;

        for (let i = 0; i < length; i+=4) {
            if (variant_data[i+3] == 0) {
                widgets_data[i+3] = 0;
            }
        }

        ctx.putImageData(widgets_layer, 0,0);

        this.widgets.forEach( w => w.renderPath(ctx));

        //ctx.drawImage(this.variant.static, 0, 0, 400, 400 * this.variant.static.height/this.variant.static.width);

        if (!App.preview)
            this.variant.workzone.render(ctx);
        //}
    }
}