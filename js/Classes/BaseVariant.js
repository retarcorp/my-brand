/**
 * Класс вариантов основы.
 * @constructor
 * @param {string} image - Путь к картинке основы
 * @param {Size} size - Размер основы
 * @param {Workzone} workzone - Размер рабочей области
 */

class BaseVariant {
    constructor(image, size, workzone) {
        this.src = image;
        this.workzone = workzone;
        this.size = size;

        this.image = new Image();
        this.image.src = this.src;

        this.image.onload = () => {
            this.loaded = true;
        }
    }

    getWorkzone() {
        return this.workzone;
    }

    setImageData(data) {
        this.imageData = data;

        return this;
    }

    setColor() {
        this.imageData = App.GraphCore.Filter.colorFilter(App.GraphCore.ctx, this.image, App.Project.settings.color);

        return this;
    }

    /**
     * Принимает json объект и возвращает вариант основы.
     * @param {Object} json - json объект
     * @returns {BaseVariant}
     */

    static fromJSON(json){
        return new this( 
            json.image             
            ,new Size(json.width, json.height)
            ,WorkZone.fromJSON(json.workzone)
        );
    }

    render(ctx) {
        if (!this.imageData || !this.loaded) {
            this.imageData = App.GraphCore.Filter.getImageFilterData(App.GraphCore.ctx, this.image);

        } else {
            ctx.putImageData(this.imageData, 0, 0);
            //ctx.drawImage(this.image, 0, 0, this.size.width, this.size.height);App.GraphCore.Filter.colorFilter(ctx, this.image)
        }

    }
}