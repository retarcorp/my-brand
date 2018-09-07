class RenderList {
    constructor(graphCore) {
        this.GraphCore = graphCore;
    }

    renderPreview(ctx) {
        this.GraphCore.Canvas.clear();
        ctx.drawImage(this.GraphCore.App.UI.LightBox.previewImage.image, this.GraphCore.App.UI.LightBox.previewImage.position.x ,this.GraphCore.App.UI.LightBox.previewImage.position.y);
    }

    render(ctx) {
        if (this.GraphCore.ctx){
            this.GraphCore.resetScale();
        }
        this.GraphCore.Canvas.clear(ctx);
        //this.GraphCore.defineDimensions();
        this.GraphCore.App.currentProjectVariant.render(ctx);
    }
}