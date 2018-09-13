class BaseList {
    constructor(ui) {
        this.UI = ui;
    }

    init(){
        this.arrows = $('.product__rotate');
        this.colorContainer = $('.color-btns');
        this.sizeContainer = $('.size__container');
        this.container = $("#bases-container");
        this.info_item = $('.link__info');
        this.info = $('.info-basis');

        this.variants_container = $('.template__list');

        this.base_container = $('[name="baseContainerCatalog_base"]');
        this.brand_container = $('[name="baseContainerBrand_base"]');
        this.pages_list = $('[name="baseCatalogPages_base"]');


        this.arrows.on('click', this.setProjectVariant);
        this.sizeContainer.on('click', this.UI.onBaseSize);
        this.info_item.on('click', this.checkInfoEvent.bind(this));
        this.info.on('click', this.checkInfoEvent.bind(this));
        this.variants_container.on('click', this.checkVariantsEvent.bind(this));


        //this.setVariantsList(this.UI.App.Project);
        setTimeout(this.updateVariantImage.bind(this), 10000);

        this.setSizeHtml();
        this.setBaseSize(this.UI.App.Project.settings.size || this.sizeContainer.children(":first-child"));
        //this.setBaseColors();

        if (this.brand_container.length) {
            this.type = 'brand';
            this.getBases();

            this.brand_container.on('click', this.checkBaseEvent.bind(this));
            this.pages_list.on('click', this.checkBaseEvent.bind(this));
        }

        if (this.base_container.length) {
            this.type = 'catalog';
            this.getBases();

            this.base_container.on('click', this.checkBaseEvent.bind(this));
            this.pages_list.on('click', this.checkBaseEvent.bind(this));
        }
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
            console.log('Cycle BaseList 1')
            target = target.parent();
        }
    }

    checkBaseEvent(e) {
        const currentTarget = $(e.currentTarget);
        let target = $(e.target);

        while (!target.is(currentTarget)) {
            if (target.hasClass('brand__create')) {
                const child = target.parent().parent(),
                    base = child.data('base');
                this.openCreateBrandSection(base);

                return;
            }

            if (target.hasClass('slider__btn-add')) {
                e.preventDefault();
                const child = target.parent().parent().parent(),
                    base = child.data('base');
                this.addToCartBase(base);

                return;
            }

            if (target.hasClass('slider__btn-edit')) {
                e.preventDefault();
                const child = target.parent().parent().parent(),
                    base = child.data('base');
                this.createProjectOnBase(base);

                return;
            }

            if (target.hasClass('slider__item')) {
                e.preventDefault();
                const child = target,
                    base = child.data('base');
                this.createProjectOnBase(base);

                return;
            }

            if (target.hasClass('panel__page-point')) {
                e.preventDefault();
                const page = target.data('page');
                this.getBases(page);

                return;
            }
            console.log('Cycle BaseList 2')
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

    async setBaseColors(base) {
        base = base || this.UI.App.Project.base;

        if (!base) {
            return;
        }

        App.GraphCore.Filter.getImageAverageColorAsync(base.variants[0].src)
            .then( color => {
                let colors = JSON.parse(JSON.stringify(base.colorArray || []));
                colors.push(color);

                this.colorContainer.html(
                    colors.reduce( (acc, color) => acc + TemplateFactory.getBaseColorHtml(color), ``)
                );
            })
            .catch(err => console.error(err));
    }

    async setVariantsList(project) {
        const variants = project.variants;
        this.UI.App.inProcess = true;

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
        await this.UI.App.setCurrentVariant(this.UI.App.Project.variants[0]);
        this.UI.App.inProcess = false;
    }

    async updateVariantImage() {
        if (!this.UI.App.inSettingProject){
            const variant = this.UI.App.currentProjectVariant;
            let child = null;

            $.each($('.template__list').children(), (index, ch) => {
                if ($(ch).data('index') == variant.index) {
                    child = ch;
                }
            });

            $(child).find('img').attr('src', await this.UI.App.getVariantPreview(this.UI.App.currentProjectVariant));

            setTimeout(this.updateVariantImage.bind(this), 10000);
        } else {
            setTimeout(this.updateVariantImage.bind(this), 20000);
        }

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

    setPreloader() {
        this.clearContainer();
        this.base_container.append(TemplateFactory.getPreloader());
        this.brand_container.append(TemplateFactory.getPreloader());
    }

    resetVariant() {
        this.UI.App.currentWorkzone = this.UI.App.currentProjectVariant.variant.getWorkzone();
        this.UI.App.currentProjectVariant.variant.setColor();


        this.UI.Layers.loadLayers();

        this.UI.App.GraphCore.setDimensions(CANVAS_WIDTH, CANVAS_WIDTH * this.UI.App.currentProjectVariant.variant.size.height/this.UI.App.currentProjectVariant.variant.size.width);
        this.UI.App.GraphCore.setCurrentWidget(null);

        this.UI.LightBox.setPreviewImage();
    }

    getBases(page, amount) {
        this.setPreloader();

        this.loadBases(page, amount)
            .then( data => {
                this.formBasesList(data.bases);
                this.formPages(data.pages, page);
            })
            .catch(err => console.error(err));
    }

    loadBases(page = 1, amount = 20) {
        return new Promise((res, rej) => {
            this.UI.App.Ajax.get(`/bases?page=${page}&amount=${amount}`)
                .then( response => {
                    response = JSON.parse(response);

                    res(response);
                })
                .catch(err => {
                    rej(err);
                });
        });
    }

    formBasesList(bases = []) {
        const children = [],
            container = (this.type == 'catalog') ? this.base_container : this.brand_container;
        this.clearContainer();

        bases.forEach( base => {
            base = (this.type == 'catalog') ? Base.fromJSON(base) : base;
            const child = (this.type == 'brand') ? $(TemplateFactory.getCatalogItemHtml(base)) : $(TemplateFactory.getSliderSlideHtml(base));
            child.data('base', base);
            children.push(child);
        });

        children.forEach(ch => container.append(ch));
    }

    formPages(pages = 1, selected = 1) {
        const children = [];
        this.pages_list.html('');

        for (let page = 1; page <= pages; page++) {
            const child = $(TemplateFactory.getAdminPanelPages(page));
            child.data('page', page);
            children.push(child);
        }

        children.forEach( ch => this.pages_list.append(ch));
        children[selected - 1].addClass('selected');
    }

    clearContainer() {
        this.base_container.html('');
        this.brand_container.html('');
    }

    openCreateBrandSection(base) {
        this.UI.Brand.setBase(base);
        this.UI.Brand.openSection();
    }

    addToCartBase(base) {
        const app = this.UI.App;

        app.getProjectOnBaseAsync(base)
            .then( project => this.UI.Profile.addToCartProject(project) )
            .catch(err => console.error(err));
    }

    createProjectOnBase(base) {
        location.href = '/constructor?id='+base._id;
    }
}