class Toolkit {
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    reset(){
        const curr = this.GraphCore.currentWidget;

        if (!curr) {
            return;
        }

        if (curr instanceof TextWidget){
            this.resetTextToolkit();
            this.GraphCore.App.UI.Layers.setCurrentLayer(curr);
        } else if (curr instanceof ImageWidget) {
            this.resetImageToolkit();
            this.GraphCore.App.UI.Layers.setCurrentLayer(curr);
        }

        this.resetPrintType(curr);
    }

    resetTextToolkit(){
        const fontSettings = this.GraphCore.currentWidget.getFontSettings();

        this.GraphCore.App.UI.TextSettings.setSettings();

        this.GraphCore.App.UI.onText();
    }

    resetImageToolkit(){
        const curr = App.GraphCore.currentWidget,
            target = $(`[name="${curr.text}"]`),
            collection = $('.print-img.selected');

        this.GraphCore.App.UI.closeTabs();

        collection.removeClass('selected');
        target.addClass('selected');
    }

    resetPrintType(widget) {
        this.GraphCore.App.UI.onChangeWidget(widget || this.GraphCore.currentWidget);
    }
}