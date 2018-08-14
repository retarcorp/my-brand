/**
 * ImageWidget - текстовый виджет. Наследует класс Widget.
 * @param {Position} position - Позиция изображения в рабочей области
 * @param {Size} size - Размер виджета
 * @param {string} image - Изображение виджета
 * @constructor
 * @augments Widget
 */

class ImageWidget extends Widget {
    constructor(position, size, src, tags, _id, fancywork, print){
        super(position,size);
        this.type = "ImageWidget";

        this.src = src;
        this.tags = tags;
        this.image = new Image();
        this._id = _id;

        this.fancywork = fancywork;
        this.print = print;

        // this.image.src = this.src;


        this.index = 0;
        this.path = new Path(this.position, this.size);

        this.download = false;
        // this.image.onload = () => {
        //     this.download = true;
        //     console.log('ImageWidget download');
        // }
    }

    loadLazy() {
        return new Promise( (resolve, reject) => {
            this.image.src = this.src;

            this.image.onload = () => {
                this.download = true;
                resolve(true);
            }

            this.image.onerror = () => {
                this.download = false;
                resolve(true);
            }
        });
    }

    setImage(src) {
        this.image.src = src;
    }

    pointIn(position) {

        let out = false,
            _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y;

        const fontSettings = this.fontSettings;

        out = (_x - 5 < position.x) && (_x + this.size.width + 5 > position.x) &&
            (_y - 5 < position.y) && (_y + this.size.height + 5 > position.y);

        return out;
    }

    isInWorkzone(dx = 0, dy = 0) {
        const workzone = App.currentWorkzone;
        let int = this.size.height/this.size.width;

        let _x = this.position.x + dx,
            _y = this.position.y + dy,
            out = {
                x: true,
                y: true
            };

        // if (_x < 0) {
        //     this.position.x = 0;
        //     out.x = false;
        // }

        // if (_x + this.size.width > workzone.size.width) {

        //     if (this.size.width > workzone.size.width) {
        //         this.size.width = workzone.size.width;
        //         this.size.height = this.size.width*int;
        //         this.position.x = 0;

        //     } else this.position.x = workzone.size.width - this.size.width;

        //     out.x = false;
        // }

        // if (_y < 0) {
        //     this.position.y = 0;
        //     out.y = false;
        // }

        // if (_y + this.size.height > workzone.size.height) {
        //     this.position.y = workzone.size.height - this.size.height;
        //     out.y = false;
        // }

        return out;
    }

    resizeOn(position) {
        let out = {};

        out = {
            resize: !!(this.checkCorner(position))
            ,direction: this.checkCorner(position)
        };

        return out;
    }

    resizeBy(dx, position, direction) {

        let int = this.size.height/this.size.width,
            _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y,
            _w = this.size.width,
            _h = this.size.height;

        if (App.currentWorkzone.underMouse(position)) {
            const limit_width = 30;

            switch (direction) {
                case 'upLeft':

                    if (_w - dx > limit_width || dx < 0) {
                        _w -= dx;
                        this.position.x += dx;
                        this.position.y += (_h - Math.round(_w*int));
                        _h = Math.round(_w*int);

                        this.size.width = _w;
                        this.size.height = _h;
                    }

                    break;

                case 'upRight':

                    if (_w + dx > limit_width || dx > 0) {
                        _w += dx;
                        this.position.y += (_h - Math.round(_w*int));
                        _h = Math.round(_w*int);

                        this.size.width = _w;
                        this.size.height = _h;
                    }

                    break;

                case 'bottomLeft':

                    if (_w - dx > limit_width || dx < 0) {
                        _w -= dx;
                        this.position.x += dx;
                        _h = Math.round(_w*int);

                        this.size.width = _w;
                        this.size.height = _h;
                    }

                    break;

                case 'bottomRight':
                    if (_w + dx > limit_width || dx > 0) {
                        _w += dx;
                        _h = Math.round(_w*int);

                        this.size.width = _w;
                        this.size.height = _h;
                    }

                    break;

                default:
                    return 0;
            }

        }

        this.isInWorkzone();
    }

    checkCorner(position) {

        let _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y;

        if ( (_x - 5 <= position.x && _x + 5 >= position.x) &&
            (_y - 5 <= position.y && _y + 5 >= position.y)) {
            return 'upLeft';

        } else if ((_x + this.size.width - 10 <= position.x && _x + this.size.width + 10 >= position.x) &&
            (_y - 10 <= position.y && _y + 10 >= position.y)) {
            return 'upRight';

        } else if ((_x - 10 <= position.x && _x + 10 >= position.x) &&
            (_y + this.size.height - 10 <= position.y && _y  + this.size.height + 10 >= position.y)) {
            return 'bottomLeft';

        } else if ((_x + this.size.width - 10 <= position.x && _x + this.size.width + 10 >= position.x) &&
            (_y + this.size.height - 10 <= position.y && _y  + this.size.height + 10 >= position.y)) {
            return 'bottomRight';
        }

        return false;
    }

    moveBy(dx, dy) {
        let out = this.isInWorkzone(dx, dy);

        if (out.x) {
            this.position.x += dx;
        }

        if (out.y) {
            this.position.y += dy;
        }

        return this;
    }

    getSize() {
        return this.size;
    }

    getPosition() {
        return this.position;
    }

    renderPath(ctx) { //INNER
        if (this.isSelected && !App.isPreview && this.download)
            this.path.render(ctx);
    }

    render(ctx) { //INNER
        if (this.download) {
            let _x = this.position.x + App.currentWorkzone.position.x,
                _y = this.position.y + App.currentWorkzone.position.y;

            ctx.drawImage(this.image, _x, _y, this.size.width, this.size.height);
        }
    }

    static getDefault(src, tags, _id, fancywork, print){
        return new this(
            new Position(20,20)
            ,new Size(100,100)
            ,src
            ,tags
            ,_id
            ,fancywork
            ,print
        )
    }
}