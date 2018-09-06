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

        this.printButtons = {
            fancywork: $('.choose__fancywork'),
            print: $('.choose__print'),
            _3D: $('.choose__3D')
        }

        this.invis = $('.button__constructor-prew');
        this.horizontal_align = $('.button__vertical');
        this.vertical_align = $('.button__horizontal');
        this.controls = $('.editor__right');

        this.printType = $('.editor__print-left');

        this.invis.on('click', this.UI.onPreview);

        this.delete = $('.button__trush');
        this.widgets_control = $('.editor__btn-position');

        this.widgets_control.on('click', this.UI.onWidgetPositionChange);
        this.delete.on('click', this.UI.onDelete)
        this.horizontal_align.on('click', this.UI.onHorizontalAlign.bind(this.UI));
        this.vertical_align.on('click', this.UI.onVerticalAlign.bind(this.UI));
        this.controls.on('click', this.checkEvent.bind(this));


        this.customization.print.on('click', (e) => {
            if (($(e.target).hasClass('add-photo') || $(e.target).hasClass('button__close') || $(e.target).hasClass('picture__button')) && !$(e.target).hasClass('picture__remove')) {
                this.UI.setBodyScrollable();
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
        this.printType.on('click', this.checkEvent.bind(this));
    }

    checkEvent(e) {
        const currentTarget = $(e.currentTarget);
        let target = $(e.target);

        while (!target.is(currentTarget)) {
            if (target.hasClass('button__flip-vertical')) {
                this.UI.onFlip(0b01);

                return;
            }

            if (target.hasClass('button__flip-horizontal')) {
                this.UI.onFlip(0b10);

                return;
            }

            if (target.hasClass('button__flip-all')) {
                this.UI.onFlip(0b11);

                return;
            }

            if (target.hasClass('button__container')) {
                const printType = target.attr('data-printType'),
                    curr = this.UI.App.GraphCore.currentWidget;

                currentTarget.children().removeClass('selected');
                target.addClass('selected');

                curr.setPrintType(printType);
            }

            target = target.parent();
        }
    }

    enablePrintButtons(bin) {
        (bin & 0b001) ? this.printButtons.fancywork.addClass('active') : this.printButtons.fancywork.removeClass('active');
        (bin & 0b010) ? this.printButtons.print.addClass('active') : this.printButtons.print.removeClass('active');
        (bin & 0b100) ? this.printButtons._3D.addClass('active') : this.printButtons._3D.removeClass('active');

        this.selectPrintButton();
    }

    selectPrintButton() {
        const curr = this.UI.App.GraphCore.currentWidget,
            bin = curr.printType || 0b001;

        (bin & 0b001) ? this.printButtons.fancywork.addClass('selected') : this.printButtons.fancywork.removeClass('selected');
        (bin & 0b010) ? this.printButtons.print.addClass('selected') : this.printButtons.print.removeClass('selected');
        (bin & 0b100) ? this.printButtons._3D.addClass('selected') : this.printButtons._3D.removeClass('selected');
    }
}