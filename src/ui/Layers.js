class Layers {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.container = $('.panel__container-basis');

        this.currentLayer = null;


        this.container.data('lastId', 0);


        this.container.on('click', this.layerEvent);


        this.formLayersHtml();
    }

    layerEvent(e) {
        if ($(e.target).hasClass('button-remove'))
            App.UI.onDelete(e);

        else if ($(e.target).hasClass('to-top__layer')){
            App.UI.Layers.layerUp(e);

        } else if ($(e.target).hasClass('to-bottom__layer')) {
            App.UI.Layers.layerDown(e);

        } else if($(e.target).hasClass('panel__template-layer-config')) {
            const id = $(e.target).parent().data('id'),
                layer = App.currentProjectVariant.layers.find( (l) => l.id == id);

            layer.config = e.target.checked;

        } else {
            let id = $(e.target).data('id');
            const curr = App.currentProjectVariant.widgets.find( (widget) => widget.id == id );

            App.GraphCore.setCurrentWidget(curr);
        }
    }

    formLayersHtml() {
        const layers = this.UI.App.currentProjectVariant.layers;

        this.container.html(
            layers.reduce( (acc, layer) => acc + TemplateFactory.getLayerHtml(layer), ``)
        );

        this.container.children()
    }

    addLayer(widget, type) {
        let lastId = 0,
            index = widget.index,
            text = widget.text;

        const widgets = App.currentProjectVariant.widgets;

        widgets.forEach( (w) => {
            if (lastId < w.id) {
                lastId = w.id;
            }
        });

        $.each(this.container.children(), (index, child) => {
            if (lastId < $(child).attr('data-id')) {
                lastId = $(child).attr('data-id');
            }
        });

        lastId++;
        this.container.data('lastId', lastId);

        let layer = {
            text: text
            ,id: lastId
            ,type: type
            ,index: index
        };

        widget.layer = layer;

        this.container.prepend(
            TemplateFactory.getLayerHtml(layer)
        );

        this.UI.App.currentProjectVariant.layers.push(layer);

        return lastId;
    }

    createLayer(widget) {
        const layer = widget.layer;


    }

    loadLayers() {
        let widgets = this.UI.App.currentProjectVariant.widgets;

        this.container.html('');

        widgets.forEach( (widget) => {
            this.container.prepend(
                TemplateFactory.getLayerHtml(widget.layer)
            )
        });
    }

    setCurrentLayer(w) {
        let target = $(`.layer[data-id=${w.id}]`),
            collection = $('.layer.selected');

        collection.removeClass('selected');
        target.addClass('selected');

        this.currentLayer = target;
    }

    setText(text) {
        this.currentLayer.find('.content').text(text);
    }

    layerUp(e) {
        if ($(e.target).parent().parent().prev().length) {
            let id = $(e.target).parent().parent().data('id'),
                curr = App.currentProjectVariant.widgets.find( (w) => w.id == id );

            App.currentProjectVariant.downWidget(curr.id);

            //$(e.target).parent().parent().insertBefore($(e.target).parent().parent().prev());
        }
    }

    layerDown(e) {
        if ($(e.target).parent().parent().next().length) {
            let id = $(e.target).parent().parent().data('id'),
                curr = App.currentProjectVariant.widgets.find( (w) => w.id == id );

            App.currentProjectVariant.upWidget(curr.id);

            //$(e.target).parent().parent().insertAfter($(e.target).parent().parent().next());
        }
    }

    removeLayer(e) {
        App.UI.onDelete(e);
    }


}