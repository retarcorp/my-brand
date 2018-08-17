//import("../GraphCore/Canvas.js");
//import("../GraphCore/Toolkit.js");
//import("../GraphCore/Filter.js");
//import("../GraphCore/RenderList.js");

class GraphCore {
    constructor(app) {
        this.App = app;


        this.Canvas = new Canvas(this);
        this.Filter = new Filter(this);
        this.RenderList = new RenderList(this);
        this.Toolkit = new Toolkit(this);
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_WIDTH;
        this.canvas_container = $('.product__preview');

        this.ctx = this.canvas.getContext('2d');
        this.ctx.translate(0.5,0.5);
        this.ctx.save();

        this.draggable = null;
        this.currentWidget = null;
        this.dragged = false;
        this.resized = false;
        this.previewDragged = false;
        this.canvasDragged = false;

        this.canvasPosition = new Position(0,0);
        this.canvasScale = 1;

        this.lastX = 0;
        this.lastY = 0;

        this.realX = 0;
        this.realY = 0;

        this.clientX = 0;
        this.clientY = 0;

        this.scale = 0.25;
        this.scaleCount = 0;

        this.attached = false;
        this.attachedDirection = "";

        if (this.canvas_container.length) {
            this.canvas_container.html(this.canvas);
        }

        if(this.App.currentProjectVariant.widgets.length) {
            let widgets = this.App.currentProjectVariant.widgets,
                l = widgets.length;

            this.setCurrentWidget(widgets[l-1]);
        }

        this.Canvas.init();

        //this.canvas_container.on('mousemove', this.moveCanvas.bind(this));

        this.defineDimensions();
    }

    defineDimensions() {
        this.resetScale();

        const variant = App.currentProjectVariant,
            width = CANVAS_WIDTH,
            height = width * variant.variant.image.height/variant.variant.image.width;

        this.setDimensions(width, height);
    }

    findSprite(position) {
        let data = null;

        App.currentProjectVariant.widgets.forEach( (sprites) => {
            if (sprites.length) {
                // TODO replace foreach to filter
                data = sprites.find( (elem) => {
                    if (elem.pointIn(position)) {
                        return elem;
                    }
                });

            } else if (sprites.pointIn(position)) {
                data = sprites;
                return data;
            }
        });

        return data;
    }

    setDimensions(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    setCurrentWidget(w = null){
        if (!w) {
            if (this.currentWidget) {
                this.currentWidget.isSelected = false;
                this.currentWidget = null;
            }

            this.App.UI.closeTabs();
        } else {
            if (this.currentWidget) {
                this.currentWidget.isSelected = false;
            }

            this.currentWidget = w;
            // this.App.currentProjectVariant.upWidget(w.index);
            this.currentWidget.isSelected = true;
        }

        this.Toolkit.reset();
        this.App.UI.openPanelTab();
    }

    mouseDown(e) {
        if (!this.App.isPreview && !this.canvasDragged) {
            const curr  = this.findSprite( new Position(e.offsetX, e.offsetY));
            let resizeOpt;

            this.setCurrentWidget(curr);

            if (curr) {
                if ( (resizeOpt = curr.resizeOn(new Position(e.offsetX, e.offsetY))).resize ) {
                    this.resized = true;
                    this.resizeDirection = resizeOpt.direction;
                } else {
                    this.dragged = true;
                }

                $('body').addClass('_no-select');
            } else if (window.AdminApp) {
                this.canvasDragged = true;

                //$(this.canvas).addClass('_no-events');
            }

            this.lastX = e.offsetX;
            this.lastY = e.offsetY;

            this.realX = e.offsetX;
            this.realY = e.offsetY;

            this.clientX = e.clientX;
            this.clientY = e.clientY;

        } else {
            this.previewDragged = true;

            this.lastX = e.offsetX;
            this.lastY = e.offsetY;
        }
    }

    mouseUp(e) {
        $('body').removeClass('_no-select');
        this.dragged = false;
        this.resized = false;
        this.previewDragged = false;
        this.canvasDragged = false;
        $(this.canvas).removeClass('_no-events');
    }

    mouseMove(e) {
        const curr = this.currentWidget;

        //if (!this.canvasDragged) {
        if (!this.App.isPreview) {
            if (this.resized) {
                this.resize(e);
            }

            if(this.dragged) {
                this.onMove(e);
            }

            if(this.canvasDragged) {
                this.moveCanvas(e);
            }

        } else {
            if (this.previewDragged)
                this.App.UI.LightBox.movePreview(e);
        }
        //}
            
    }

    mouseWheel(e) {
        if (this.App.isPreview) {
            this.scales(e);
        }
    }

    mouseOver(e) { //WORKFLOW
        if (this.App.isPreview) {
            this.ctx.setTransform(PREVIEW_SCALE,0,0,PREVIEW_SCALE,0,0);
            this.previewDragged = true;
        }
    }

    mouseOut(e) { //WORKFLOW
        if (this.App.isPreview) {
            this.resetScale();
            this.previewDragged = false;
            this.App.UI.LightBox.resetPreviewPosition();
        }
    }

    moveCanvas(e) {
        const container = $(e.currentTarget),
            curr = this.currentWidget;
        
        let tX = `translateX(${this.canvasPosition.x}px)`,
            tY = `translateY(${this.canvasPosition.y}px)`;

        if(!curr && this.canvasDragged) {
            const dx = e.clientX - this.clientX,
                dy = e.clientY - this.clientY;

            if ( (this.canvasPosition.x + dx*this.canvasScale <= 0 && (this.canvasPosition.x + dx*this.canvasScale + this.canvas.width*this.canvasScale) >= this.canvas.width)) {
                this.canvasPosition.x += dx*this.canvasScale;

                tX = `translateX(${this.canvasPosition.x}px)`;

            } 

            if ((this.canvasPosition.y + dy*this.canvasScale <= 0 && (this.canvasPosition.y + dy*this.canvasScale + this.canvas.height*this.canvasScale) >= this.canvas.height)){
                this.canvasPosition.y += dy*this.canvasScale;
                
                tY = `translateY(${this.canvasPosition.y}px)`;
            }

            $(this.canvas).css('transform', tX + ' ' + tY + ' scale(' + this.canvasScale+')');

            this.clientX = e.clientX;
            this.clientY = e.clientY;
        }
    }

    scales(e) {
        // TODO make scale named constants
        if (this.scale >= 0.25 && this.scale <= 2) {
            let width = (1 + this.scale)*this.canvas.width,
                height = (1 + this.scale)*this.canvas.height,
                scale = this.scale;

            if (e.deltaY < 0) this.scale = 2 * this.scale;
            else this.scale = this.scale/2;

            if (this.scale > 2) this.scale = 2;

            let x = 1 + this.scale, y = 1 + this.scale;

            if (this.scale <= 0.125) {
                x = 1; y = 1;
                this.scale = 0.25;
            }

            let transfX = (e.offsetX/this.canvas.width) * this.canvas.width * (x - 1),
                transfY = (e.offsetY/this.canvas.height) * this.canvas.height * (y - 1);

            this.ctx.setTransform(x, 0, 0, y, -transfX, -transfY);
        }
    }

    resetScale() {
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(0.5,0.5);
        this.scale = 0.25;
    }

    resize(e) {
        const curr = this.currentWidget;

        if (curr) {
            let dx = e.offsetX - this.lastX,
                dsx = e.offsetX - this.realX,
                dy = e.offsetY - this.lastY,
                dsy = e.offsetY - this.realY;

            if ($.inArray(this.resizeDirection, this.App.currentWorkzone.verticalLine.directions) >= 0) {
                this.App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(dx, new Position(e.offsetX, e.offsetY), this.resizeDirection));

            } else if ($.inArray(this.resizeDirection, App.currentWorkzone.horizontalLine.directions) >= 0) {
                if (this.resizeDirection == "upLeft" || this.resizeDirection == "bottomRight") dy = -dy;
                this.App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(-dy, new Position(e.offsetX, e.offsetY), this.resizeDirection));
            } else {
                this.App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(dsx, new Position(e.offsetX, e.offsetY), this.resizeDirection));
            }

            let outX = !this.App.currentWorkzone.verticalLine.checkSize(new Position(e.offsetX, e.offsetY), this.resizeDirection);
            let outY = !this.App.currentWorkzone.horizontalLine.checkSize(new Position(e.offsetX, e.offsetY), this.resizeDirection);

            if (outX) {
                this.lastX = e.offsetX;
            }

            if (outY) {
                this.lastY = e.offsetY;
            }

            this.realX = e.offsetX;
            this.realY = e.offsetY;

        }
    }

    // TODO rename to onMove
    onMove(e) {
        const curr = this.currentWidget;

        if (curr) {
            let dx = e.offsetX - this.lastX;
            let dy = e.offsetY - this.lastY;

            curr.moveBy(dx, dy);

            if (!App.currentWorkzone.verticalLine.checkPosition(curr)) {
                this.lastX = e.offsetX;
            }

            if (!App.currentWorkzone.horizontalLine.checkPosition(curr)) {
                this.lastY = e.offsetY;
            }
        }
    }

    setCanvasScale(scale) {
        this.canvasScale = scale;

        if (this.canvasPosition.x + this.canvas.width*this.canvasScale <= this.canvas.width) {
            this.canvasPosition.x = 0;
        }

        if (this.canvasPosition.y + this.canvas.height*this.canvasScale <= this.canvas.height) {
            this.canvasPosition.y = 0;
        }

        const transform = `translateX(${this.canvasPosition.x}px) translateY(${this.canvasPosition.y}px) scale(${this.canvasScale})`;

        $(this.canvas).css('transform', transform);
    }
}