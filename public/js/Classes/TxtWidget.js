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

// TODO replace TxtWidget to TextWidget filename
class TextWidget extends Widget {
    constructor(position, text, color, fontSettings) {
        let size = new Size(0,0);
        super(position, size);

        this.type = "TextWidget";
        this.text = text;
        this.color = color;

        this.lines = [text];
        this.biggest_line = "";

        this.remainder = {
            dx: 0,
            dir: ""
        };

        if (fontSettings instanceof FontSettings) {
            this.fontSettings = fontSettings;
        } else {
            this.fontSettings = new FontSettings();
            Object.assign(this.fontSettings, fontSettings);
        }

        this.size.height = fontSettings.fontSize || 16;

        this.resizeDirection = 'upLeft';

        this.index = 0;

        this.path = new Path(this.position, this.size);

        this.download = true;
    }

    loadLazy() {
        return new Promise( (rsv, rjk) => {
            if (App.fontStyle.text().indexOf(this.fontSettings.fontFamily) >= 0) {
                rsv();
            } else {
                App.UI.FontsList.loadFont(this.fontSettings.fontFamily, (response) => {
                    response = JSON.parse(response);

                    if (!(response.data instanceof Array)) {
                        App.UI.FontsList.addFont(response.data);

                        document.fonts.load('12px '+response.data.font)
                            .then( d => rsv() )
                            .catch(err =>  {
                                console.log(err);
                                rsv();
                            });
                    } else {
                        rsv();
                    }

                });
            }
        });
    }

    getFontSettings() {
        return this.fontSettings;
    }

    moveBy(dx, dy) {
        let inW = this.isInWorkzone(dx, dy);

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
            resize: !!(this.checkCorner(position))
            ,direction: this.checkCorner(position)
        };

        return out;
    }

    // TODO Corner !
    checkCorner(position) {
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

    // TODO rename to isInWorkzone
    isInWorkzone(dx = 0, dy = 0) {
        const workzone = App.currentWorkzone;

        let _x = this.position.x + dx,
            _y = this.position.y + dy,
            out = {
                x: true,
                y: true
            },
            int = this.fontSettings.fontSize/this.size.width;

        // if (_x < 0) {
        //     if (this.size.width > workzone.size.width) {
        //         this.size.width = workzone.size.width;
        //         this.fontSettings.fontSize = Math.round(this.size.width*int);
        //         this.position.x = 0;
        //
        //     } else this.position.x = 0;
        //
        //     out.x = false;
        // }
        //
        // if (_x + this.size.width > workzone.size.width) {
        //
        //     if (this.size.width > workzone.size.width) {
        //         this.size.width = workzone.size.width;
        //         this.fontSettings.fontSize = Math.round(this.size.width*int);
        //         this.position.x = 0;
        //
        //     } else this.position.x = workzone.size.width - this.size.width;
        //
        //
        //     out.x = false;
        // }
        //
        // if (_y < 0) {
        //     this.position.y = 0;
        //     out.y = false;
        // }
        //
        // if (_y + this.size.height > workzone.size.height) {
        //     this.position.y = workzone.size.height - this.size.height;
        //     out.y = false;
        // }

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
            const width_limit = 60;

            switch (direction) {
                case 'upLeft':

                    // TODO replace 60 to named const
                    if (_w - dx > width_limit || dx + this.remainder.dx < 0) {

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

                    if (_w + dx > width_limit || dx + this.remainder.dx > 0) {

                        _w += dx + rm;
                        this.position.y += Math.round((_h - Math.round(_w*int))*this.lines.length);

                        _h = Math.round(_w*int);

                        this.size.width = _w;
                        resized = true;
                    }

                    break;

                case 'bottomLeft':

                    if (_w - dx > width_limit || dx + this.remainder.dx < 0) {
                        o_w = _w;
                        _w -= dx + rm;
                        _h = Math.round(_w*int);
                        this.position.x += (o_w - Math.round(_h)/int );
                        this.size.width = _w;
                        resized = true;

                    }

                    break;

                case 'bottomRight':

                    if (_w + dx > width_limit || dx + this.remainder.dx > 0) {

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

        this.isInWorkzone();

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
        this.color = color;
    }

    setHexColor(color) {
        this.color = '#' + color;
    }

    // TODO rename method corresponding to its real action
    formTextLines(ctx) {
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

    renderPath(ctx) { //INNER
        if (this.isSelected && !App.isPreview)
            this.path.render(ctx);
    }

    render(ctx) { //INNER
        const fontSettings = this.fontSettings;

        ctx.textBaseline = "bottom";
        ctx.textAlign = fontSettings.alignment;
        ctx.fillStyle = this.color;
        ctx.font = fontSettings.getFontString();

        let int = this.size.height/this.size.width,
            _x = this.position.x + App.currentWorkzone.position.x,
            _y = this.position.y + App.currentWorkzone.position.y;

        ctx.font = fontSettings.getFontString();
        this.size.height = fontSettings.fontSize*this.lines.length;

        this.biggest_line = this.text;

        if (this.biggest_line.length)
            this.size.width = ctx.measureText(this.biggest_line).width;
        else this.size.width = ctx.measureText(this.lines[0]).width;

        // if (this.edit || !this.lines.length) {
        //     this.formTextLines(ctx);
        //     console.log(this.lines);
        // }

        this.lines[0] = this.text;

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

    }

    static getDefault(text){
        // TODO create consts inside method
        const position = new Position(0,0),
              texts = text || "Text",
              color = "#000",
              fontSettings = FontSettings.getDefault();

        return new this(
            position
            ,texts
            ,color
            ,fontSettings
        );
    }
}

TextWidget.Default = {
    color: "#000"
    ,text: "Text"
}
