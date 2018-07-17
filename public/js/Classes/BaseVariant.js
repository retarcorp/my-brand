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
        this.filterImage = new Image();

        this.image.src = this.src;
        this.loaded = false;

        // this.image.onload = () => {
        //
        //     this.filterImage.onload = () => {
        //         this.loaded = true;
        //     }
        // }
    }

    loadLazy() {
        return new Promise( (resolve, reject) => {
            this.image.src = this.src;

            this.image.onload = () => {
                App.GraphCore.Filter.setColorFilterImage(this.image, App.Project.settings.color);

                this.filterImage.onload = () => {
                    resolve(true);
                }
            }

        });
    }

    getWorkzone() {
        return this.workzone;
    }

    setImageData(data) {
        //this.imageData = data;

        console.log('setData')

        return this;
    }

    setColor() {
        App.GraphCore.Filter.setColorFilterImage(this.image, App.Project.settings.color);

        return this;
    }

    /**
     * Принимает json объект и возвращает вариант основы.
     * @param {Object} json - json объект
     * @returns {BaseVariant}
     */

    static fromJSON(json){
        return new this( 
            json.src || json.image
            ,json.size || new Size(json.width, json.height)
            ,WorkZone.fromJSON(json.workzone)
        );
    }

    render(ctx) {
        // if (!this.loaded) {
        //     App.GraphCore.Filter.setColorFilterImage(App.GraphCore.ctx, this.image, App.Project.settings.color);
        // } else {
            //ctx.putImageData(this.imageData, 0, 0);
            // if (this.image)
            //document.body.appendChild(this.filterImage);
            //debugger;
            App.UI.Profile.projectLoaded = true;
            ctx.drawImage(this.filterImage, 0, 0, this.size.height, this.size.width)
            //ctx.drawImage(this.image, 0, 0, this.size.width, this.size.height);App.GraphCore.Filter.setColorFilterImage(ctx, this.image)
       // }

    }
}