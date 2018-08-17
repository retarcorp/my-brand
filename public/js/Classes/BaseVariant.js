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

        this.static = new Image();

        this.static_loaded = false;

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
                    this.loaded = true;

                    const ctx = document.createElement('canvas').getContext('2d');
                    this.size.width = CANVAS_WIDTH;
                    this.size.height = CANVAS_WIDTH * this.filterImage.height/this.filterImage.width;

                    ctx.canvas.width = this.size.width;
                    ctx.canvas.height = this.size.height;

                    this.static.src = this.getStaticImage(ctx);
                    resolve(true);
                }
            }

            this.image.onerror = () => {
                this.loaded = false;
                resolve(true);
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

    getStaticImage(ctx) {
        const _x = App.currentWorkzone.position.x,
            _y = App.currentWorkzone.position.y,
            _w = App.currentWorkzone.size.width,
            _h = App.currentWorkzone.size.height;
        let src = "";

        App.GraphCore.Canvas.clear(ctx);

        ctx.translate(0.5, 0.5);

        ctx.canvas.width = CANVAS_WIDTH;
        ctx.canvas.height = CANVAS_WIDTH*(this.image.height/this.image.width);

        ctx.fillStyle = "#fff";

        ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.drawImage(this.filterImage, 0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.clearRect(_x, _y, _w, _h);
        src = ctx.canvas.toDataURL();

        App.GraphCore.Canvas.clear(ctx);

        return src;
    }

    render(ctx) {
        // if (!this.loaded) {
        //     App.GraphCore.Filter.setColorFilterImage(App.GraphCore.ctx, this.image, App.Project.settings.color);
        // } else {
        //ctx.putImageData(this.imageData, 0, 0);
        // if (this.image)
        //document.body.appendChild(this.filterImage);
        //debugger;
        if (this.loaded) {
            App.UI.Profile.projectLoaded = true;
                ctx.drawImage(this.filterImage, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH * this.filterImage.height/this.filterImage.width);
        }

        //ctx.drawImage(this.image, 0, 0, this.size.width, this.size.height);App.GraphCore.Filter.setColorFilterImage(ctx, this.image)
        // }

    }
}