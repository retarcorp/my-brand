class Toolkit {
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    reset(){
        const curr = this.GraphCore.currentWidget;

        if (curr instanceof TextWidget){
            this.resetTextToolkit();
            this.GraphCore.App.UI.Layers.setCurrentLayer(curr);

        } else if (curr instanceof ImageWidget) {
            this.resetImageToolkit();
            this.GraphCore.App.UI.Layers.setCurrentLayer(curr);
        }
    }

    resetTextToolkit(){
        const fontSettings = this.GraphCore.currentWidget.getFontSettings();

        this.GraphCore.App.UI.TextSettings.setSettings();

        this.GraphCore.App.UI.onText();

        // if (fontSettings.isItalic) {
        //     $(".button__italic").addClass('active');
        // } else{
        //     $(".button__italic").removeClass('active');
        // }
        //
        // if (fontSettings.isBold){
        //     $(".button__bold").addClass('active');
        // } else {
        //     $(".button__bold").removeClass('active');
        // }
        //
        // if (fontSettings.isUnderline) {
        //     $(".button__underline").addClass('active');
        // } else {
        //     $(".button__underline").removeClass('active');
        // }
    }

    resetImageToolkit(){
        const curr = App.GraphCore.currentWidget,
            target = $(`[name="${curr.text}"]`),
            collection = $('.print-img.selected');

        this.GraphCore.App.UI.closeTabs();

        collection.removeClass('selected');
        target.addClass('selected');
    }
}