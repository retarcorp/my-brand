class LightBox {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        //this.preview = $('.btn-show-result');
        this.preview = $('.button__preview');
        this.preview_image = $('.preview-image img');
        this.preview_container = $('.constructor-preview');
        this.preview_unpreview = $('.button__unpreview');

        this.box = $('.preview');
        this.content = $('.preview__picture img');

        this.previewImage = {
            image: null
            ,position: { x: 0, y: 0 }
        };


        this.preview_unpreview.on('click', this.closeBlock.bind(this));
        this.preview.on('click', this.UI.onPreview);
        this.preview_container.on('mousemove', this.movePreviewImage.bind(this));
        //this.preview_container.on('mouseout', this.resetPreviewTranslate.bind(this));
        //this.box.on('click', this.closeBlock.bind(this));
    }

    closeBlock(e) {
        this.UI.App.isPreview = false;

        // this.UI.App.UI.leftMenu.removeClass('on-preview');
        // this.UI.App.UI.BaseList.colorContainer.removeClass('on-preview');
        // this.preview.removeClass('on-preview');

        this.closePreview();
        this.UI.App.GraphCore.resetScale(this.UI.App.GraphCore.ctx);
        this.UI.App.GraphCore.ctx.translate(0.5,0.5);

    }

    openPreview() {
        this.preview_container.addClass('active');
        this.setPreviewImage();
    }

    closePreview() {
        this.preview_container.removeClass('active');
    }

    setPreviewImage() {
        this.setPreviewHeight();
        this.UI.App.GraphCore.resetScale();
        this.UI.App.UI.LightBox.resetPreview();
    }

    setPreviewHeight() {
        this.preview_container.css('height', this.UI.App.GraphCore.canvas.height);
    }

    resetPreview() {
        this.resetPreviewPosition();

        App.GraphCore.RenderList.render(App.GraphCore.ctx);

        this.previewImage.image = new Image();
        this.previewImage.image.src = App.GraphCore.canvas.toDataURL('image/png');
        this.preview_image.attr('src', App.GraphCore.canvas.toDataURL('image/png'));
    }

    resetPreviewPosition() {
        this.previewImage.position = new Position(0,0);
    }

    resetPreviewTranslate() {
        this.preview_image.css('transform', 'translateY(0)');
    }


    movePreviewImage(e) {
        const preview_height = this.preview_image.prop('height'),
            container_height = parseInt(this.preview_container.css('height')),
            _diff = container_height * PREVIEW_OUT,
            _int = (preview_height - container_height + _diff)/container_height,
            _y = e.offsetY;


        if (_y - _diff > 0 && _y + _diff < container_height) {
            this.preview_image.css('transform', `translateY(-${(_y-_diff) * _int}px)`);
        }
        
    }

    movePreview(e) { //WORKFLOW
        let dx = App.GraphCore.ctx,
            dy = e.offsetY - App.GraphCore.lastY;

        this.moveTo(-e.offsetX / PREVIEW_SCALE, -e.offsetY / PREVIEW_SCALE);

        // this.moveBy(dx, dy);

        App.GraphCore.lastX = e.offsetX;
        App.GraphCore.lastY = e.offsetY;
    }

    moveTo(x,y) { //WORKFLOW
        this.previewImage.position.x = x;
        this.previewImage.position.y = y;
    }

    moveBy(dx, dy) {
        let out = this.checkBorder(dx, dy),
            _scale = this.UI.App.GraphCore.scale;

        if (out.x)
            this.previewImage.position.x += dx/(_scale+1);

        if (out.y)
            this.previewImage.position.y += dy/(_scale+1);
    }

    checkBorder(dx, dy) {
        let _x = this.previewImage.position.x + dx,
            _y = this.previewImage.position.y + dy,
            _w = this.UI.App.GraphCore.canvas.width,
            _h = this.UI.App.GraphCore.canvas.height,
            _scale = this.UI.App.GraphCore.scale,

            out = {
                x: true,
                y: true
            };

        if (_x + _w < this.UI.App.GraphCore.canvas.width / 1.5 || _x * (_scale+1) > _w - this.UI.App.GraphCore.canvas.width / 1.5) {
            out.x = false;
        }

        if (_y + _h < this.UI.App.GraphCore.canvas.height / 1.5 || _y * (_scale+1) > _h - this.UI.App.GraphCore.canvas.height / 1.5) {
            out.y = false;
        }

        return out;
    }
}