class Filter {
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    // TODO rename to verb-based name
    setColorFilterImage(image, color) {
        if (!this.GraphCore.App.Project.settings.startColor) {
            this.getAverageImageColor(image);
        }

        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = image.width;
        ctx.canvas.height = image.height;

        this.GraphCore.Canvas.clear(ctx);
        ctx.drawImage(image,0,0, ctx.canvas.width, ctx.canvas.height);

        const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.width),
            currentColor = this.GraphCore.App.Project.settings.startColor;

        const before = this.hexToRgb(currentColor),
            after = (color instanceof Array) ? {
                r: color[0]
                ,g: color[1]
                ,b: color[2]
            } : this.hexToRgb(color || currentColor);

        // TODO check for not has broken
        let currentData = data.data;
        const len = currentData.length;

        for (let i = 0; i<len; i+=4) {
            if (currentData[i+3] != 0) {
                currentData[i] = after.r + currentData[i] - before.r;
                currentData[i+1] = after.g + currentData[i+1] - before.g;
                currentData[i+2] = after.b + currentData[i+2] - before.b;
            }
        }

        ctx.putImageData(data, 0, 0);
        this.GraphCore.App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

        return data;
    }

    // TODO rename to getAverageImageColor
    getAverageImageColor(image) {
        let ctx = document.createElement('canvas').getContext('2d');

        ctx.canvas.width = image.height;
        ctx.canvas.height = image.width;

        ctx.canvas.height = ctx.canvas.width * (image.height/image.width);
        ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

        let data = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height),
            color = [0,0,0],
            hex = "",
            contrast = 0;

        for (let i = 0; i <= data.data.length - 1; i+=4) {
            if (data.data[i+3] != 1) {
                color[0] += data.data[i];
                color[1] += data.data[i+1];
                color[2] += data.data[i+2];
            }
        }

        color[0] = Math.round(color[0] / ((data.data.length - 1)/4)) * 2;
        color[1] = Math.round(color[1] / ((data.data.length - 1)/4)) * 2;
        color[2] = Math.round(color[2] / ((data.data.length - 1)/4)) * 2;

        let coloring = color.map((colors) => {
            if (colors > 255) return 255;
            return colors;
        });

        hex = this.rgbToHex(coloring[0],coloring[1],coloring[2]);
        this.GraphCore.App.Project.settings.startColor = hex;

        return hex;
    }

    getImageFilterData(ctx, image) {
        ctx.drawImage(image,0,0, this.GraphCore.canvas.width, this.GraphCore.canvas.height);
        let data = ctx.getImageData(0, 0, this.GraphCore.canvas.width, this.GraphCore.canvas.height);

        this.GraphCore.App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

        this.GraphCore.Canvas.clear();
        return data;
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}