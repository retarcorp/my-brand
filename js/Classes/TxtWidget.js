/**
 * TextWidget - виджет-картинка. Наследует класс Widget.
 * @param {Position} position - Позиция текста в рабочей области
 * @param {Size} size - Размер виджета
 * @param {string} text - Текст виджета
 * @param {string} color - Цвет виджета. Принимается строка в формате HEX, rgb, rgba или название цвета
 * @param {FontSettings} fontSettings - Настройки текста
 * @constructor
 * @augments Widget
 */

class TextWidget extends Widget {
    constructor(position, text, color, fontSettings) {
        let size = new Size(0,0);
        super(position, size);

        this.type = "TextWidget";
        this.text = text;
        this.color = color;

        this.lines = [this.text];

        this.remainder = {
            dx: 0,
            dir: ""
        };

        this.fontSettings = fontSettings;
        this.size.height = fontSettings.fontSize;

        this.resizeDirection = 'upLeft';

        this.index = App.currentProjectVariant.widgets.length;

        this.path = new Path(this.position, this.size);
    }

    getFontSettings() {
        return this.fontSettings;
    }

    moveBy(dx, dy) {
        let inW = this.inWorkzone(dx, dy);

        if (inW.x) {
            this.position.x += dx;
        }

        if (inW.y) {
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

    pointIn(position) {
        let out = false,
            _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y;

        out = (_x - 5 < position.x) && (_x + this.size.width + 5 > position.x) &&
            (_y - 5 < position.y) && (_y + this.size.height + 5 > position.y);

        return out;

    }

    getAlign() {
        const fontSettings = this.fontSettings;

        if (fontSettings.alignment == FontSettings.Alignment.RIGHT) {
            return -this.size.width;
        } else if (fontSettings.alignment == FontSettings.Alignment.CENTER) {
            return  -this.size.width / 2;
        }

        return 0;
    }

    resizeOn(position) {
        let out = false;

        out = {
            resize: !!(this.checkConor(position))
            ,direction: this.checkConor(position)
        };

        return out;
    }

    checkConor(position) {
        let _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y;

        if ( (_x - 5 <= position.x && _x + 5 >= position.x) &&
            (_y - 5 <= position.y && _y + 5 >= position.y)) {
            return 'upLeft';

        } else if ((_x + this.size.width - 5 <= position.x && _x + this.size.width + 5 >= position.x) &&
                (_y - 5 <= position.y && _y + 5 >= position.y)) {
            return 'upRight';

        } else if ((_x - 5 <= position.x && _x + 5 >= position.x) &&
            (_y + this.size.height - 5 <= position.y && _y  + this.size.height + 5 >= position.y)) {
            return 'bottomLeft';

        } else if ((_x + this.size.width - 5 <= position.x && _x + this.size.width + 5 >= position.x) &&
            (_y + this.size.height - 5 <= position.y && _y  + this.size.height + 5 >= position.y)) {
            return 'bottomRight';
        }

        return false;
    }

    inWorkzone(dx = 0, dy = 0) {
        const workzone = App.currentWorkzone;

        let _x = this.position.x + dx,
            _y = this.position.y + dy,
            out = {
                x: true,
                y: true
            },
            int = this.fontSettings.fontSize/this.size.width;

        if (_x < 0) {
            if (this.size.width > workzone.size.width) {
                this.size.width = workzone.size.width;
                this.fontSettings.fontSize = Math.round(this.size.width*int);
                this.position.x = 0;

            } else this.position.x = 0;

            out.x = false;
        }

        if (_x + this.size.width > workzone.size.width) {

            if (this.size.width > workzone.size.width) {
                this.size.width = workzone.size.width;
                this.fontSettings.fontSize = Math.round(this.size.width*int);
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

    resizeBy(dx, position, direction){

        let int = this.fontSettings.fontSize/this.size.width,
            _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y,
            _w = this.size.width,
            _h = this.fontSettings.fontSize,
            o_w = 0,
            rm = (this.remainder.dir == direction) ? this.remainder.dx : 0,
            resized = false;

        //console.log(this.remainder.dx, dx, direction)

        if (App.currentWorkzone.underMouse(position)) {
            switch (direction) {
                case 'upLeft':

                    if (_w - dx > 60 || dx + this.remainder.dx < 0) {

                        o_w = _w;
                        _w -= dx + rm;
                        this.position.y += (_h - Math.round(_w*int))*this.lines.length;
                        _h = _w*int;

                        this.position.x += (o_w - Math.round(_h)/int );

                        this.size.width = _w;

                        resized = true;

                        //console.log(o_w, _w, _h, dx);
                    }

                    break;

                case 'upRight':

                    if (_w + dx > 60 || dx + this.remainder.dx > 0) {

                        _w += dx + rm;
                        this.position.y += Math.round((_h - Math.round(_w*int))*this.lines.length);

                        _h = Math.round(_w*int);

                        this.size.width = _w;
                        resized = true;
                    }

                    break;

                case 'bottomLeft':

                    if (_w - dx > 60 || dx + this.remainder.dx < 0) {

                        o_w = _w;
                        _w -= dx + rm;
                        _h = Math.round(_w*int);

                        this.position.x += (o_w - Math.round(_h)/int );

                        this.size.width = _w;
                        resized = true;

                    }

                    break;

                case 'bottomRight':

                    if (_w + dx > 60 || dx + this.remainder.dx > 0) {

                        _w += dx + rm;
                        _h = Math.round(_w*int);

                        this.size.width = _w;
                        resized = true;

                    }

                    break;

                default:
                    return 0;
            }

            if (this.fontSettings.fontSize == Math.round(_w*int) && this.remainder.dir == direction && resized) {
                this.remainder.dx += dx;

            } else {
                this.remainder.dx = 0;
                this.remainder.dir = direction;

                this.fontSettings.fontSize = Math.round(_w*int);
            }

        }

        this.inWorkzone();

        return this.fontSettings.fontSize;
    }

    setText(text) {
        this.text = text;
        this.layer.text = text;

        this.edit = true;

        return this;
    }

    setFontSize(fontSize) {
        this.fontSettings.setFontSize(fontSize);
    }

    setColor(color) {
        this.color = '#' + color;
    }

    setLines(ctx) {
        const fontSettings = this.fontSettings;

        this.lines = [];

        let parse = this.text.split([" "]),
            _w = App.currentWorkzone.size.width - this.position.x,
            acc = "",
            max_word = "",
            width = 0;

        parse.forEach( (text) => {
            if (text.length > max_word.length)
                max_word = text;
        });

        width = ctx.measureText(max_word).width;

        let _int = fontSettings.fontSize/width;

        if (width > _w) {
            width = _w;
            fontSettings.fontSize = _w * _int;
        }

        this.biggest_line = "";

        let space = "";

        parse.forEach( (text) => {
            width = ctx.measureText(acc + text).width;

            if (width > _w) {
                if (ctx.measureText(acc).width > this.max_width) {
                    this.max_width = ctx.measureText(acc).width;
                }

                this.lines.push(acc);
                acc = text;

            } else acc += space + text;

            space = " ";

            if (acc.length > this.biggest_line.length) this.biggest_line = acc;
        });

        this.lines.push(acc);

        if (this.lines.length <= 1) this.max_width = ctx.measureText(acc).width;

        this.size.width = this.max_width;
        this.size.height = this.lines.length * fontSettings.fontSize;

        this.edit = false;

    }

    render(ctx) {
        const fontSettings = this.fontSettings;

        ctx.textBaseline = "bottom";
        ctx.textAlign = fontSettings.alignment;
        ctx.fillStyle = this.color;
        ctx.font = fontSettings.getFontString();

        let int = this.size.height/this.size.width,
            _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y;

        //console.log(fontSettings.fontSize, this.size.width);

        ctx.font = fontSettings.getFontString();
        this.size.height = fontSettings.fontSize*this.lines.length;

        if (this.biggest_line)
            this.size.width = ctx.measureText(this.biggest_line).width;
        else this.size.width = ctx.measureText(this.lines[0]).width;

        if (this.edit)
            this.setLines(ctx);

        fontSettings.fontSize = parseInt(fontSettings.fontSize);

        this.lines.forEach( (line, index) => {
            ctx.fillText(line, _x, _y + index * fontSettings.fontSize + fontSettings.fontSize);

            if (this.fontSettings.isUnderline) {
                ctx.strokeStyle = this.color;
                ctx.setLineDash([]);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(_x, _y + index * fontSettings.fontSize + fontSettings.fontSize - 5);
                ctx.lineTo(_x + ctx.measureText(this.lines[index]).width, _y + index * fontSettings.fontSize + fontSettings.fontSize - 5);
                ctx.stroke();
            }
        });

        if (this.isSelected && !App.isPreview)
            this.path.render(ctx);

        // let distance = Widget.Path.distance,
        //     _x = this.position.x - distance + App.currentWorkzone.position.x,
        //     _y = this.position.y + App.currentWorkzone.position.y + this.size.height - distance;
        //
        // ctx.strokeStyle = Widget.Path.color;
        // ctx.setLineDash(Widget.Path.lineDash);
        // ctx.strokeRect(_x, _y, this.size.width + distance, -this.size.height + distance);
        //
        // ctx.fillStyle = Widget.Path.polColor;
        //
        // ctx.fillRect(_x - 5, _y - 5, 10, 10);
        // ctx.fillRect(_x - 5 + this.size.width + distance, _y - 5 - this.size.height + distance, 10, 10);
        // ctx.fillRect(_x - 5 + this.size.width + distance, _y - 5, 10, 10);
        // ctx.fillRect(_x - 5, _y - 5 - this.size.height + distance, 10, 10);
    }

    static getDefault(text){
        return new this(
            new Position(0,0)
            ,text
            ,TextWidget.Default.color
            ,FontSettings.getDefault()
        );
    }

}

TextWidget.Default = {
    color: "#000"
    ,text: "Text"
}
