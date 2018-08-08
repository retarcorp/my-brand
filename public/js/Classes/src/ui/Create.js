class Create {
    constructor(ui) {
        this.UI = ui;

        this.init();
    }

    init() {
        this.create = {
            textWidget: $('.new__text-widget')
            ,imageWidget: $('.new__image-widget')
        };


        this.create.textWidget.on('click', this.createTextWidget);
        this.create.imageWidget.on('click', this.createImageWidget);
    }

    createTextWidget(text) {
        let widget = null;

        if (text.length) {
            widget = TextWidget.getDefault(text);
        } else {
            widget = TextWidget.getDefault('Text');
        }

        widget.id = App.UI.Layers.addLayer(widget, 'text');

        App.currentProjectVariant.addWidget(widget);
        App.GraphCore.setCurrentWidget(widget);
    }

    createImageWidget(e){
        let data = {},
            prn = {};

        if (e.target) {
            prn = $(e.target).parent().parent();
            data = prn.data('print');
        } else {
            data = e;
        }

        if (data.src) {
            let widget = ImageWidget.getDefault(data.src, data.tags, data._id);

            widget.text = data.text;
            widget.id = App.UI.Layers.addLayer(widget, 'space');

            widget.loadLazy();

            App.currentProjectVariant.addWidget(widget);
            App.GraphCore.setCurrentWidget(widget);
        }
    }

    createConfigurableImageWidget(src) {
        if (src && src.length) {
            const widget = ImageWidget.getDefault(src);

            widget.text = "configurable";
            widget.id = this.UI.Layers.addLayer(widget, 'space');

            widget.loadLazy();

            this.UI.App.currentProjectVariant.addWidget(widget);
            this.UI.App.GraphCore.setCurrentWidget(widget);
        }
    }
}