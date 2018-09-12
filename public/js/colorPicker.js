var ColorPicker = {
    onchangecolor: function(cb) {
        ColorPicker.onChangeColorStack.push(cb);
    }

    ,emmitColorChange: function(color) {
        ColorPicker.onChangeColorStack.forEach(function(f) {
            f(color);
        });
    }

    ,onChangeColorStack: []
};

(function() {

    var ctx, colorLineCtx,
            mousedown = false,
            mouseup = false,
            mouseMove = false;

    var palette, colorLine, colorCircle, placeForColorPicker;

    function init() {
        placeForColorPicker = document.querySelector('[data-place-for-color-picker]');
        insertColorPicker();

        palette = document.querySelector('[data-palette]');
        colorLine = document.querySelector('[data-color-line]');
        colorCircle = document.querySelector('[data-color-circle]');

        ctx = palette.getContext('2d');
        colorLineCtx = colorLine.getContext('2d');

        palette.colorDetail = true;
        colorLine.colorLine = true;
        colorCircle.colorCircle = true;

        setPaletteColor();
        setColorLineColor();
        fillPalette();
        fillColorLine();
        setListeners();
    }

    function checkEvent(e) {
        var currentTarget=  e.currentTarget,
            target = e.target;

        (e.type == "mousedown") && (mousedown = true) && (mouseup = false);
        (e.type == "mousemove") && (mousemove = true);
        (e.type == "mouseup") && (mouseup = true) && (mousedown = false);

        while (target !== currentTarget) {
            if (target.colorDetail && e.type == "mousedown") {
                var X = e.offsetX, Y = e.offsetY,
                    paletteColor = getColorInPalette(X, Y),
                    hexColor = rgbToHex(paletteColor[0], paletteColor[1], paletteColor[2]);

                mousedown = true;

                setPaletteColor(hexColor);
                ColorPicker.emmitColorChange(hexColor);
                //fillPalette();

                return;
            }

            if (target.colorDetail && e.type == "mousemove" && mousedown) {
                var X = e.offsetX, Y = e.offsetY,
                    paletteColor = getColorInPalette(X, Y),
                    hexColor = rgbToHex(paletteColor[0], paletteColor[1], paletteColor[2]);

                mouseMove = true;

                setPaletteColor(hexColor);
                ColorPicker.emmitColorChange(hexColor);

                //fillPalette();

                return;
            }

            if (target.colorLine && (e.type == "mousedown" || e.type == "mousemove") && mousedown) {
                var x = e.offsetX, y = e.offsetY,
                    color = getColorInColorLine(x,y),
                    hexColor = rgbToHex(color[0], color[1], color[2]);

                setColorLineColor(hexColor);
                setPaletteColor(hexColor);
                ColorPicker.emmitColorChange(hexColor);
                fillPalette();
                moveColorCircle(x, y);

                return;
            }

            if (target.classList.contains('color-picker__color')) {
                const color = target.css('background');
                ColorPicker.emmitColorChange(color);

                return;
            }

            target = target.parentNode;
        }
    }

    function insertColorPicker() {
        placeForColorPicker.innerHTML += getColorPickerHTML();
    }

    function setListeners() {
        document.addEventListener('mousedown', checkEvent);
        document.addEventListener('mousemove', checkEvent);
        document.addEventListener('mouseup', checkEvent);
    }

    function setPaletteColor(color) {
        palette.color = color || '#ff0000';
    }

    function setColorLineColor(color) {
        colorLine.color = color;
    }

    function fillPalette() {
        var pWidth = palette.width,
            pHeight = palette.height,
            x = 0, y = 0,
            data = ctx.getImageData(0,0,pWidth,pHeight),
            pixels = data.data,
            length = pixels.length,
            color = palette.color,
            startColor = hexToRgb(color),
            // binMin = (rgb.r <= rgb.g) ? (rgb.r <= rgb.b) 
            //         ? 0b100 : 0b001 :
            //             (rgb.g <= rgb.b) ? 0b010 
            //                 : 0b001,
            // binMax = (rgb.r >= rgb.g) ? (rgb.r >= rgb.b) 
            //         ? 0b100 : 0b001 :
            //             (rgb.g >= rgb.b) ? 0b010 
            //                 : 0b001,
            // startColor = hexToRgb((!(bin ^ 0b001) && '#0000ff') || (!(bin ^ 0b010) && '#00ff00') || (!(bin ^ 0b100) && '#ff0000') || '#ff0000'),
            colorIntenseOnX = [(255 - startColor.r) / pWidth, (255 - startColor.g) / pWidth, (255 - startColor.b) / pWidth ],
            colorIntenseOnY = 255/pHeight;

            var counter = 0;

        for (var i = 0; i < length; i = i + 4) {
            pixels[i] = 255 - Math.pow(Math.pow(colorIntenseOnX[0] * x, 2) + Math.pow(colorIntenseOnY * y, 2), 0.5);
            pixels[i+1] = 255 - Math.pow(Math.pow(colorIntenseOnX[1] * x, 2) + Math.pow(colorIntenseOnY * y, 2), 0.5);
            pixels[i+2] = 255 - Math.pow(Math.pow(colorIntenseOnX[2] * x, 2) + Math.pow(colorIntenseOnY * y, 2), 0.5);
            pixels[i+3] = 255;

            counter++;
            x++;
            if (x >= pWidth) {
                y++;
                x = 0;
            }
        }

        ctx.putImageData(data, 0, 0);
    }

    function fillColorLine() {
        var pWidth = colorLine.width,
            pHeight = colorLine.height,
            x = 0, y = 0,
            gradient = colorLineCtx.createLinearGradient(x, y, pWidth, y);

        gradient.addColorStop(0.14, 'rgb(255,0,0)');
        gradient.addColorStop(0.28, 'rgb(255,0,255)');
        gradient.addColorStop(0.42, 'rgb(0,0,255)');
        gradient.addColorStop(0.56, 'rgb(0,255,255)');
        gradient.addColorStop(0.70, 'rgb(0,255,0)');
        gradient.addColorStop(0.84, 'rgb(255,255,0)');
        gradient.addColorStop(0.98, 'rgb(255,0,0)');

        colorLineCtx.fillStyle = gradient;
        colorLineCtx.fillRect(x,y,pWidth,pHeight);
    }

    function getColorInPalette(x, y) {
        var color = palette.color,
            pWidth = palette.width,
            pHeight = palette.height,
            data = ctx.getImageData(0,0,pWidth,pHeight),
            pixels = data.data,
            length = pixels.length;
            
            return [pixels[(y*pWidth + x)*4], pixels[(y*pWidth + x)*4 + 1], pixels[(y*pWidth + x)*4 + 2]];
    }

    function getColorInColorLine(x, y) {
        var pWidth = colorLine.width,
            pHeight = colorLine.height,
            data = colorLineCtx.getImageData(0, 0, pWidth, pHeight),
            pixels = data.data;

        return [pixels[x*4], pixels[x*4+1], pixels[x*4+2]];
    }

    function getColorPickerHTML() {
        return `
            <div class="color-picker">
                <!-- <div class="color-picker__head">
                    <h3 class="color-picker___title">
                        Color Picker
                    </h3>
                </div> -->
    
                <div class="color-picker__workspace">
                    <canvas data-palette class="color-picker__palette" width="193" height="192"></canvas>
    
                    <div class="color-picker__colors">
                        <div class="color-picker__color-line">
                            <canvas data-color-line width="181" height="11"></canvas>
                            <div data-color-circle class="color-picker__circle"></div>
                        </div>
    
                        <div class="color-picker__color-array">
                            <div class="color-picker__color" style="background: #1AC5EB;"></div>
                            <div class="color-picker__color" style="background: #FF2828;"></div>
                            <div class="color-picker__color" style="background: #15505C;"></div>
                            <div class="color-picker__color" style="background: #3FAD49;"></div>
                            <div class="color-picker__color" style="background: #B611FA;"></div>
                            <div class="color-picker__color" style="background: #F85D01;"></div>
                            <div class="color-picker__color" style="background: #0B677C;"></div>
                            <div class="color-picker__color" style="background: #3FC500;"></div>
                            <div class="color-picker__color" style="background: #CE1AEB;"></div>
                            <div class="color-picker__color" style="background: #474D69;"></div>
                            <div class="color-picker__color" style="background: #474D69;"></div>
                            <div class="color-picker__color" style="background: #CE1AEB;"></div>
                            <div class="color-picker__color" style="background: #3FC500;"></div>
                            <div class="color-picker__color" style="background: #0B677C;"></div>
                            <div class="color-picker__color" style="background: #F85D01;"></div>
                            <div class="color-picker__color" style="background: #B611FA;"></div>
                            <div class="color-picker__color" style="background: #3FAD49;"></div>
                            <div class="color-picker__color" style="background: #15505C;"></div>
                            <div class="color-picker__color" style="background: #FF2828;"></div>
                            <div class="color-picker__color" style="background: #1AC5EB;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    function moveColorCircle(x, y) {
        if (x > 5 && x < colorLine.width - 7) {
            colorCircle.style.left = `${x - 7}px`;
        }
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }

    init();
})();