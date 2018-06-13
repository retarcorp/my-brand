/**
 * ImageWidget - текстовый виджет. Наследует класс Widget.
 * @param {Position} position - Позиция изображения в рабочей области
 * @param {Size} size - Размер виджета
 * @param {string} image - Изображение виджета
 * @constructor
 * @augments Widget
 */

class ImageWidget extends Widget {
    constructor(position, size, src){
        super(position,size);
        this.type = "ImageWidget";

        this.src = src;
        this.image = new Image();
        this.image.src = this.src;


        this.index = App.currentProjectVariant.widgets.length;
        this.path = new Path(this.position, this.size);

        this.image.onload = () => {
            this.download = true;
        }
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

    inWorkzone(dx = 0, dy = 0) {
        const workzone = App.currentWorkzone;
        let int = this.size.height/this.size.width;

        let _x = this.position.x + dx,
            _y = this.position.y + dy,
            out = {
                x: true,
                y: true
            };

        if (_x < 0) {
            this.position.x = 0;
            out.x = false;
        }

        if (_x + this.size.width > workzone.size.width) {

            if (this.size.width > workzone.size.width) {
                this.size.width = workzone.size.width;
                this.size.height = this.size.width*int;
                this.position.x = 0;

            } else this.position.x = workzone.size.width - this.size.width;

            out.x = false;
        }

        if (_y < 0) {
            this.position.y = 0;
            out.y = false;
        }

        if (_y + this.size.height > workzone.size.height) {
            this.position.y = workzone.size.height - this.size.height;
            out.y = false;
        }

        return out;
    }

    resizeOn(position) {
        let out = {};

        out = {
            resize: !!(this.checkConor(position))
            ,direction: this.checkConor(position)
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

                switch (direction) {
                    case 'upLeft':

                        if (_w - dx > 30 || dx < 0) {
                            _w -= dx;
                            this.position.x += dx;
                            this.position.y += (_h - Math.round(_w*int));
                            _h = Math.round(_w*int);

                            this.size.width = _w;
                            this.size.height = _h;
                        }

                        break;

                    case 'upRight':

                        if (_w + dx > 30 || dx > 0) {
                            _w += dx;
                            this.position.y += (_h - Math.round(_w*int));
                            _h = Math.round(_w*int);

                            this.size.width = _w;
                            this.size.height = _h;
                        }

                        break;

                    case 'bottomLeft':

                        if (_w - dx > 30 || dx < 0) {
                            _w -= dx;
                            this.position.x += dx;
                            _h = Math.round(_w*int);

                            this.size.width = _w;
                            this.size.height = _h;
                        }

                        break;

                    case 'bottomRight':
                        if (_w + dx > 30 || dx > 0) {
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

        this.inWorkzone();
    }

    // resizeBy(position, direction){
    //
    //     let int = this.size.height/this.size.width,
    //         _x = this.position.x + App.currentWorkzone.position.x,
    //         _y = this.position.y + App.currentWorkzone.position.y;
    //
    //     if (App.currentWorkzone.underMouse(position))
    //
    //         if (this.size.width > 25) {
    //             switch (direction) {
    //                 case 'upLeft':
    //                     this.size.width += (_x - position.x);
    //                     this.position.y -= (_x - position.x);
    //                     this.position.x = position.x - App.currentWorkzone.position.x;
    //
    //                     break;
    //
    //                 case 'upRight':
    //                     this.position.y -= (position.x - _x - this.size.width);
    //                     this.size.width = position.x - _x;
    //
    //                     break;
    //
    //                 case 'bottomLeft':
    //                     this.size.width += (_x - position.x);
    //                     this.position.x = position.x - App.currentWorkzone.position.x;
    //
    //                     break;
    //
    //                 case 'bottomRight':
    //                     this.size.width = position.x - _x;
    //
    //                     break;
    //
    //                 default:
    //                     return 0;
    //             }
    //
    //             this.size.height = this.size.width;
    //
    //         } else {
    //             this.size.width = 26;
    //             this.size.height = 26;
    //         }
    //
    //     this.inWorkzone();
    //
    //     return this.size.height;
    // }

    checkConor(position) {

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
        let out = this.inWorkzone(dx, dy);

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

    render(ctx) {
        if (this.download) {

            let _x = this.position.x + App.currentWorkzone.position.x,
                _y = this.position.y + App.currentWorkzone.position.y;

            ctx.drawImage(this.image, _x, _y, this.size.width, this.size.height);

            if (this.isSelected && !App.isPreview)
                this.path.render(ctx);

            // let distance = Widget.Path.distance;
            //
            // ctx.strokeStyle = Widget.Path.color;
            //
            // ctx.setLineDash(Widget.Path.lineDash);
            // ctx.strokeRect(_x - distance, _y - distance, this.size.width + distance, this.size.height + distance);
            //
            // ctx.fillStyle = Widget.Path.polColor;
            //
            // ctx.fillRect(_x - 5, _y - 5, 10, 10);
            // ctx.fillRect(_x - 5 + this.size.width, _y - 5 + this.size.height, 10, 10);
            // ctx.fillRect(_x - 5 + this.size.width, _y - 5, 10, 10);
            // ctx.fillRect(_x - 5, _y - 5 + this.size.height, 10, 10);
        }
    }

    static getDefault(src){
        return new this(
            new Position(20,20)
            ,new Size(100,100)
            ,src
        )
    }
}