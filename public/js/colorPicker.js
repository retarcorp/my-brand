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
            mouseMove = false,
            onPalette = false;

    var palette, colorLine, colorCircle, placeForColorPicker, paletteCircle, body;

    function init() {
        placeForColorPicker = document.querySelector('[data-place-for-color-picker]');
        insertColorPicker();

        body = document.body;

        palette = document.querySelector('[data-palette]');
        paletteCircle = document.querySelector('[data-palette-circle]')
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
        (e.type == "mousemove") && (mouseMove = true);


        while (target !== currentTarget) {
            if (target.colorDetail && e.type == "mousedown") {
                var X = e.offsetX, Y = e.offsetY,
                    paletteColor = getColorInPalette(X, Y),
                    hexColor = rgbToHex(paletteColor[0], paletteColor[1], paletteColor[2]);

                mousedown = true;
                onPalette = true;

                body.style.userSelect = 'none';

                setPaletteColor(hexColor);
                movePaletteColorCircle(X, Y);
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
                movePaletteColorCircle(X, Y);
                ColorPicker.emmitColorChange(hexColor);

                //fillPalette();

                return;
            }

            if (target.colorLine && (e.type == "mousedown" || e.type == "mousemove") && mousedown && !onPalette) {
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

            if (target.classList.contains('color-picker__color') && e.type == 'click') {
                const hexColor = target.getAttribute('data-color');

                setColorLineColor(hexColor);
                setPaletteColorInBorder(hexColor);
                ColorPicker.emmitColorChange(hexColor);
                fillPalette();
                moveColorCircle(x, y);

                return;
            }

            if (e.type == 'mouseup') {
                mouseup = true;
                mousedown = false;
                onPalette = false;
                body.style.userSelect = 'initial';

                return;
            }
            console.log('Cycle Color');
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
        document.addEventListener('click', checkEvent);
    }

    function setPaletteColor(color) {
        palette.color = color || '#ff0000';
    }

    function setPaletteColorInBorder(color) {
        var rgbOld = hexToRgb(color),
            rgb = hexToRgb(color),
            binMin = (rgb.r <= rgb.g) ? (rgb.r <= rgb.b)
                    ? 0b100 : 0b001 :
                        (rgb.g <= rgb.b) ? 0b010
                            : 0b001,
            binMax = (rgb.r >= rgb.g) ? (rgb.r >= rgb.b)
                        ? 0b100 : 0b001 :
                        (rgb.g >= rgb.b) ? 0b010
                            : 0b001;


        (!(binMin ^ 0b100) && (rgb.r = 0)) || (!(binMin ^ 0b010) && (rgb.g = 0)) || (!(binMin ^ 0b001) && (rgb.b = 0));
        (!(binMax ^ 0b100) && (rgb.r = 255)) || (!(binMax ^ 0b010) && (rgb.g = 255)) || (!(binMax ^ 0b001) && (rgb.b = 255));
        color = rgbToHex(rgb.r ,rgb.g, rgb.b);

        getPeletteCords();

        setPaletteColor(color);
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

    function getPeletteCords(rgb) {

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
                    <div class="color-picker__palette-container">
                        <canvas data-palette class="color-picker__palette" width="193" height="192"></canvas>
                        <div data-palette-circle class="color-picker__palette-circle"></div>
                    </div>
                    
    
                    <div class="color-picker__colors">
                        <div class="color-picker__color-line">
                            <canvas data-color-line width="181" height="11"></canvas>
                            <div data-color-circle class="color-picker__circle"></div>
                        </div>
    
                        <div class="color-picker__color-array">
                            <div class="color-picker__color" style="background: #1AC5EB;" data-color="#1AC5EB"></div>
                            <div class="color-picker__color" style="background: #FF2828;" data-color="#FF2828"></div>
                            <div class="color-picker__color" style="background: #15505C;" data-color="#15505C"></div>
                            <div class="color-picker__color" style="background: #3FAD49;" data-color="#3FAD49"></div>
                            <div class="color-picker__color" style="background: #B611FA;" data-color="#B611FA"></div>
                            <div class="color-picker__color" style="background: #F85D01;" data-color="#F85D01"></div>
                            <div class="color-picker__color" style="background: #0B677C;" data-color="#0B677C"></div>
                            <div class="color-picker__color" style="background: #3FC500;" data-color="#3FC500"></div>
                            <div class="color-picker__color" style="background: #CE1AEB;" data-color="#CE1AEB"></div>
                            <div class="color-picker__color" style="background: #474D69;" data-color="#474D69"></div>
                            <div class="color-picker__color" style="background: #474D69;" data-color="#474D69"></div>
                            <div class="color-picker__color" style="background: #CE1AEB;" data-color="#CE1AEB"></div>
                            <div class="color-picker__color" style="background: #3FC500;" data-color="#3FC500"></div>
                            <div class="color-picker__color" style="background: #0B677C;" data-color="#0B677C"></div>
                            <div class="color-picker__color" style="background: #F85D01;" data-color="#F85D01"></div>
                            <div class="color-picker__color" style="background: #B611FA;" data-color="#B611FA"></div>
                            <div class="color-picker__color" style="background: #3FAD49;" data-color="#3FAD49"></div>
                            <div class="color-picker__color" style="background: #15505C;" data-color="#15505C"></div>
                            <div class="color-picker__color" style="background: #FF2828;" data-color="#FF2828"></div>
                            <div class="color-picker__color" style="background: #1AC5EB;" data-color="#1AC5EB"></div>
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

    function movePaletteColorCircle(x, y) {
        paletteCircle.style.left = `${x - 6}px`;
        paletteCircle.style.top = `${y - 6}px`;
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