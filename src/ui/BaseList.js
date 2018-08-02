class BaseList {
    constructor(ui) {
        this.UI = ui;
    }

    init(){
        this.arrows = $('.product__rotate');
        this.colorContainer = $('.workspace-color');
        this.sizeContainer = $('.size__container');
        this.container = $("#bases-container");
        this.info_item = $('.link__info');
        this.info = $('.info-basis');

        this.variants_container = $('.template__list');


        this.arrows.on('click', this.setProjectVariant);
        this.sizeContainer.on('click', this.UI.onBaseSize);
        this.info_item.on('click', this.checkInfoEvent.bind(this));
        this.info.on('click', this.checkInfoEvent.bind(this));
        this.variants_container.on('click', this.checkVariantsEvent.bind(this));


        //this.setVariantsList(this.UI.App.Project);
        setTimeout(this.updateVariantImage.bind(this), 10000);

        this.setSizeHtml();
        this.setBaseSize(this.UI.App.Project.settings.size || this.sizeContainer.children(":first-child"));
    }

    checkInfoEvent(e) {
        e.preventDefault();

        const target = $(e.target);

        if (target.hasClass('link__info')) {
            this.openInfo();
        }

        if (target.hasClass('info-basis') || target.hasClass('button__close')) {
            this.closeInfo();
        }
    }

    checkVariantsEvent(e) {
        let target = $(e.target),
            currentTarget = $(e.currentTarget);

        while(!target.is(currentTarget)) {
            if (target.hasClass('constr__item-templ')) {
                const variant = target.data('variant');

                this.selectProjectVariant(variant, target);
            }

            target = target.parent();
        }
    }

    openInfo() {
        this.info.addClass('active');
    }

    closeInfo() {
        this.info.removeClass('active');
    }

    select(e) {
        $(e.target.parentElement).addClass('selected');

        App.Project.base = $(e.target.parentElement).data('base');
        App.Project.addVariants();
    }

    selectProjectVariant(variant, child) {
        this.variants_container.children().removeClass('active');
        child.addClass('active');
        this.UI.App.setCurrentVariant(variant);
    }

    setSizeHtml() {
        this.sizeContainer.html('');

        if (this.UI.App.Project.base.size) {
            this.sizeContainer.html(
                this.UI.App.Project.base.size.reduce( (acc, size) => acc + TemplateFactory.getSizeHtml(size), ``)
            );
        }


    }

    async setVariantsList(project) {
        const variants = project.variants;

        let index = 0;

        $('.template__list').html('');

        for (let v of variants) {
            v.index = index;
            $('.template__list').append(TemplateFactory.getVariantsHtml());
            $('.template__list').children(':last-child').data('variant', v);
            $('.template__list').children(':last-child').data('index', v.index);

            $('.template__list').children(':last-child').find('img').attr('src', await this.UI.App.getVariantPreview(v));

            index++;
        }

        $('.template__list').children(':first-child').addClass('active');
    }

    async updateVariantImage() {
        const variant = this.UI.App.currentProjectVariant;
        let child = null;

        $.each($('.template__list').children(), (index, ch) => {
            if ($(ch).data('index') == variant.index) {
                child = ch;
            }
        });

        $(child).find('img').attr('src', await this.UI.App.getVariantPreview(this.UI.App.currentProjectVariant));

        setTimeout(this.updateVariantImage.bind(this), 10000);
    }

    setBaseSize(size) {
        let target = $(`.size__block[data-size="${size}"] > input`),
            collection = $(`[data-size] > input`);


        if (size && typeof size != 'string' && typeof size != "number") {
            size.children('input').prop('checked', true);
        }

        collection.attr('checked', false);
        target.attr('checked', true);
    }

    async setProjectVariant(e) {
        App.GraphCore.resetScale();

        if ($(e.target).hasClass('rotate__btn-right')) {
            App.currentProjectVariant = App.Project.getNextVariant();
        } else if ($(e.target).hasClass('rotate__btn-left')) {
            App.currentProjectVariant = App.Project.getPrevVariant();
        }

        await App.currentProjectVariant.loadLazy();
        App.UI.BaseList.resetVariant();
    }

    resetVariant() {
        this.UI.App.currentWorkzone = this.UI.App.currentProjectVariant.variant.getWorkzone();
        this.UI.App.currentProjectVariant.variant.setColor();


        this.UI.Layers.loadLayers();

        this.UI.App.GraphCore.setDimensions(400, 400 * this.UI.App.currentProjectVariant.variant.size.height/this.UI.App.currentProjectVariant.variant.size.width);
        this.UI.App.GraphCore.setCurrentWidget(null);

        this.UI.LightBox.setPreviewImage();
    }


}