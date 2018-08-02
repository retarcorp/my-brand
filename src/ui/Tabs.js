class Tabs {
    constructor(ui) {
        this.UI = ui;
    }

    init(){
        this.customization = {
            base: $('.addition-basis'),
            text: $('.product__editor'),
            print: $('.add-photo'),
            layer: $('.addition-layer'),
            panel: $('.editor__right')
        };

        this.invis = $('.button__constructor-prew');
        this.horizontal_align = $('.button__vertical');
        this.vertical_align = $('.button__horizontal');


        this.invis.on('click', this.UI.onPreview);

        this.delete = $('.button__trush');
        this.widgets_control = $('.editor__btn-position');

        this.widgets_control.on('click', this.UI.onWidgetPositionChange);
        this.delete.on('click', this.UI.onDelete)
        this.horizontal_align.on('click', this.UI.onHorizontalAlign.bind(this.UI));
        this.vertical_align.on('click', this.UI.onVerticalAlign.bind(this.UI));


        this.customization.print.on('click', (e) => {
            if ($(e.target).hasClass('add-photo') || $(e.target).hasClass('button__close') || $(e.target).hasClass('picture__button')) {
                this.customization.print.removeClass('active');
            }
        });

        this.tabs = {
            base: $('.star-set'),
            text: $('.btns__add-text'),
            print: $('.btns__add-print'),
            layer: $('.basis-set')
        };

        this.tabs.base.on('click', App.UI.onBase.bind(App.UI) );
        this.tabs.text.on('click', App.UI.onText.bind(App.UI) );
        this.tabs.print.on('click', App.UI.onPrint.bind(App.UI) );
        this.tabs.layer.on('click', App.UI.onLayer.bind(App.UI) );
    }
}