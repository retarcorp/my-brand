class Profile {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.logins = $('.authorization__form');
        this.logins_item = $('.main-menu__item.login');
        this.logins_submit = $('input[type="submit"][value="Вход"]');

        this.logout_item = $('.profile__link.link__logout');
        this.logout_admin = $('.header__logout');

        this.profile = $('.profile__menu');
        this.profile_item = $('.main-menu__item.profile');
        this.profile_name = $('.profile__name, .header__admin');

        this.container = $('.favorites__container');

        this.registration_item = $('.main-menu__item.registration')
        this.registration = $('section.registration');
        this.registration_accept = $('.post-reg__button');

        this.save_project_item = $('.details__link.save');
        this.save_project = $('.details__after');

        this.favorites_item = $('.favorites__item');
        this.favorites = $('.favorites__container');

        this.page_list = $('.panel__page-list.favorites');


        this.profile_item.on('click', this.showProfileMenu);

        this.registration_item.on('click', this.showRegistrationForm);
        this.registration.on('click', this.closeRegistration);
        this.registration_accept.on('click', (e) => {
            this.closeRegistration(e);
            this.logins_item.addClass('active');
        });

        this.logins_submit.on('click', () => this.logins.submit());
        this.logins.on('submit', () => { this.login(); return false;});

        this.logins_item.on('click', this.showLoginForm);

        this.logout_item.on('click', this.logout);
        this.logout_admin.on('click', this.logout);


        this.save_project_item.on('click', this.saveProject);

        this.favorites.on('click', this.checkFavoritesEvent);

        this.page_list.on('click', this.checkFavoritesEvent);

        //$('body').on('click', this.showLoginForm);


        this.checkLogged();

        if (this.container.length) {
            this.container.html('Favorites loading...');
        }
    }

    checkLogged() {
        if (App.logged) {
            this.logins_item.remove();

            this.registration_item.remove();
            this.registration.remove();

            this.profile_item.addClass('active');
            this.profile_name.text(App.user);
        }
    }

    checkFavoritesEvent(e) {
        const target = $(e.target);

        if (target.hasClass('favorites__edit')) {
            const card = target.parent().parent();
            const id = card.data('project_id');

            App.UI.Profile.openProjectInConstructor(id);
        }

        if (target.hasClass('favorites__remove')) {
            const card = target.parent().parent().parent();
            const id = card.data('project_id');

            App.UI.Profile.removeProject(id, card);
        }

        if (target.hasClass('panel__page-point')) {
            const page = target.data('page');
            App.UI.Profile.page_list.addClass('loading');

            App.UI.Profile.formProjectsList(e, page);
        }
    }

    openProjectInConstructor(project_id){
        localStorage.setItem('project_id', project_id);
        location.href = "/constructor";
    }

    logout(e) {
        e.preventDefault();

        //@TODO start using Ajax Module

        User.logout( (data) => {
            location.reload();
        });
    }

    showProfileMenu() {
        App.UI.Profile.profile.toggleClass('active');
    }

    showLoginForm(e) {
        if (!App.UI.Profile.logins_item.has($(e.target)).length || $(e.target).hasClass('login')) {
            App.UI.Profile.logins_item.removeClass('active');
        } else {
            App.UI.Profile.logins_item.addClass('active');
        }

        if (!App.logged && ($(e.target).hasClass('save') || $(e.target).hasClass('post-reg__button'))) {
            App.UI.Profile.logins_item.addClass('active');
        }
    }

    showRegistrationForm(e) {
        e.preventDefault();

        if ($(e.target).hasClass('button__registration')) {
            App.UI.Profile.registration.addClass('active');
        }
    }

    closeRegistration(e) {
        if ($(e.target).hasClass('registration') || $(e.target).hasClass('button__close') || $(e.target).hasClass('post-reg__button')) {
            if ($(e.target).hasClass('post-reg__button')) {
                $('body, html').animate( {
                    scrollTop: 0
                }, 500);

                App.UI.Profile.showLoginForm(e);
            }

            App.UI.Profile.registration.removeClass('active');
        }
    }

    hideForms(e) {
        App.UI.Profile.logins_item.removeClass('active');
        App.UI.Profile.registration_item.removeClass('active');
    }

    login() {
        event.preventDefault();
        let data = {
            name: $('input[name="user"]').val()
            ,password: $('input[name="pass"]').val()
        };

        App.Ajax.postJSON('/login', JSON.stringify(data), (data) => {
            data = JSON.parse(data);

            if (data.status) {
                App.logged = true;

                if (App.saveProject) {
                    App.UI.onSaveProject();
                }

                if (data.data.admin) {
                    location.href = '/admin';
                } else {
                    location.href = '/constructor';
                }
            } else {
                alert(data.message);
            }

        });
    }

    saveProject(e) {
        e.preventDefault();
        App.saveProject = true;

        if (App.logged) {
            App.UI.Profile.save_project.removeClass('pending');
            App.UI.Profile.save_project.addClass('active');
        }

        App.UI.onSaveProject(e, () => {
            if (App.logged) {
                App.UI.Profile.save_project.removeClass('active');
                App.UI.Profile.save_project.addClass('pending');
            }
        });
    }

    async formProjectsList(e, page) {
        await this.UI.App.Data.loadProjects(page);
        await this.setProjectsList();

        const collection = $('.panel__page-point.active'),
            target = $(`.panel__page-point[data-page=${page}]`);

        collection.removeClass('selected');
        target.addClass('selected');

        this.page_list.css('transform', `translateX(-${ (page - 1) * 100}%)`);
        this.page_list.removeClass('loading');
    }

    formPageList(pages) {
        this.page_list.html('');

        for (let page = 1; page <= pages; page++) {
            this.page_list.append(TemplateFactory.getAdminPanelPages(page));
            this.page_list.children(":last-child").attr('data-page', page);
        }

    }

    removeProject(id, card) {
        this.favorites.addClass('loading');

        this.UI.App.Ajax.get('/delete_project?id='+id, (data) => {
            this.favorites.removeClass('loading');
            let status = JSON.parse(data).status;

            if (status) {
                card.remove();
            }
        });
    }

    async setProjectsList() {
        if (!this.container.length) {
            return;
        }

        let projects = this.UI.App.Data.Projects,
            pages = Math.ceil(projects.length/20);

        if (!projects || !projects.length) {
            this.container.html('There is no favorites yet.');
        } else {
            this.container.html(
                projects.reduce((acc, project) => acc + TemplateFactory.getProjectsListHtml(project), ``)
            );

            this.formPageList(pages);

            let index = 0;

            for (let project of projects) {
                await this.loadPreviewImage(project, $('.favorites__img')[index], this.favorites.children()[index]);
                index++;
            }

        }
    }

    async loadPreviewImage(project, img, card) {
        const app = this.UI.App;
        await app.setProject(project);

        app.isPreview = true;
        app.GraphCore.RenderList.render(app.GraphCore.ctx);
        app.isPreview = false;

        $(card).data('project_id', app.Project.id);
        const dataURL = app.GraphCore.canvas.toDataURL('image/png');

        img.src = dataURL;
    }
}
class Menu {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.adaptive = $('.header__adaptive-menu');
        this.menu = $('.main-menu');

        this.adaptive.on('click', this.toggleMenu.bind(this));
    }

    toggleMenu() {
        this.menu.toggleClass('active');
    }
}
class Tabs {
    constructor(ui) {
        this.UI = ui;
    }

    init(){
        this.customization = {
            base: $('.addition-basis'),
            text: $('.product__editor'),
            print: $('.add-photo'),
            layer: $('.addition-layer')
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


        this.setVariantsList(this.UI.App.Project);

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

    setVariantsList(project) {
        const variants = project.variants;

        $('.template__list').html('');

        variants.forEach( (v, index) => {
            $('.template__list').append(TemplateFactory.getVariantsHtml(v));
            $('.template__list').children(':last-child').data('variant', v);
        });

        $('.template__list').children(':first-child').addClass('active');
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
class BaseSettings {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.color = $('.details__color');
        this.dynamic_color = $('#base_color');

        this.dynamic_color.on('change', this.UI.onBaseColor);
        this.color.on('click', this.UI.onBaseColor);
    }
}
class FontsList {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.container = $('.editor__fonts-list');
        this.fonts = $('.options');


        this.fonts.on('click', this.getFont);
        this.container.on('click', this.getFont);


        //this.injectFont();
        this.formFontsList();
        this.setFontsData();
    }

    setFontsData() {
        $.each(this.container.children(), (index, child) => {
            $(child).data('font', App.Data.Fonts[index]);
        });
    }

    formFontsList() {
        this.container.html(
            this.UI.App.Data.Fonts.reduce((acc, font) => acc + TemplateFactory.getFontHtml(font),``)
        );

        $('select#selectbox1').each(function () {

            // Cache the number of options
            var $this = $(this),
                numberOfOptions = $(this).children('option').length;

            // Hides the select element
            $this.addClass('s-hidden');

            // Wrap the select element in a div
            $this.wrap('<div class="select"></div>');

            // Insert a styled div to sit over the top of the hidden select element
            $this.after('<div class="styledSelect"></div>');

            // Cache the styled div
            var $styledSelect = $this.next('div.styledSelect');

            // Show the first select option in the styled div
            $styledSelect.text($this.children('option').eq(0).text());

            // Insert an unordered list after the styled div and also cache the list
            var $list = $('<ul />', {
                'class': 'options'
            }).insertAfter($styledSelect);

            // Insert a list item into the unordered list for each select option
            for (var i = 0; i < numberOfOptions; i++) {
                var li = $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);


                li.data('font', App.Data.Fonts[i]);
            }

            // Cache the list items
            var $listItems = $list.children('li');

            // Show the unordered list when the styled div is clicked (also hides it if the div is clicked again)
            $styledSelect.click(function (e) {
                e.stopPropagation();
                $('div.styledSelect.active').each(function () {
                    $(this).removeClass('active').next('ul.options').hide();
                });
                $(this).toggleClass('active').next('ul.options').toggle();
            });

            // Hides the unordered list when a list item is clicked and updates the styled div to show the selected list item
            // Updates the select element to have the value of the equivalent option
            $listItems.click(function (e) {
                e.stopPropagation();
                $styledSelect.text($(this).text()).removeClass('active');
                $this.val($(this).attr('rel'));
                $list.hide();

                App.UI.FontsList.setFont($(this).data('font'));
                /* alert($this.val()); Uncomment this for demonstration! */
            });

            // Hides the unordered list when clicking outside of it
            $(document).click(function () {
                $styledSelect.removeClass('active');
                $list.hide();
            });

        });
    }

    injectFont() {
        $('head').append(TemplateFactory.getStyleTag());
    }

    setFont(font) {
        const curr = App.GraphCore.currentWidget;


        if (curr instanceof TextWidget) {
            curr.fontSettings.fontFamily = font.name;
        }
    }

    getFont(e) {
        const curr = App.GraphCore.currentWidget;


        if (curr instanceof TextWidget) {
            curr.fontSettings.fontFamily = $(e.target.options[e.target.selectedIndex]).data('font').name;
        }
    }
}
class TextSettings {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.inputs = {
            widgetText: $('.editor__text-input'),
            textSize: $('.size__input'),
            color: $('#_color__text')
        };

        this.color_picker = $('.color-picker');
        this.color_button = $('.color-pick');

        this.colorView = $('.editor__color');

        this.btnsStyle = $('.decoration__button');


        this.inputs.widgetText.on('input', this.UI.onChangeText);

        this.inputs.textSize.on('input', this.UI.onSize);

        this.color_button.on('click', this.toggleTextColorPicker.bind(this));
        this.color_picker.on('click', this.UI.onColor);
        this.inputs.color.on('change', this.UI.onColor);

        //this.btnsStyle.on('click', App.UI.onStyle);
    }

    setSettings() {
        const curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            this.colorView.css('backgroundColor', curr.color);
            this.inputs.color.css("backgroundColor", curr.color);
            this.inputs.color.val(curr.color);
            this.inputs.textSize.val(curr.fontSettings.fontSize);
            this.inputs.widgetText.val(curr.text);
        }
    }

    toggleTextColorPicker() {
        this.color_picker.toggleClass('active');
    }

    closeTextColorPicker() {
        this.color_picker.removeClass('active');
    }

    closeColorPicker(e) {
        const target = $(e.target);

        if (!this.color_picker.has(target).length && !this.color_picker.is(target) && !target.is(this.color_button)) {
            this.closeTextColorPicker();
        }
    }
}
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
        let print = $(e.target).parent().parent().children('img'),
            data = { src: print.attr('src'), text: 'collage' };

        if (data.src) {
            let widget = ImageWidget.getDefault(data.src);

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
class PrintsList {
    constructor(ui) {
        this.UI = ui;
    }

    init(){
        this.userPrints = $('.file-upload__picture-list');
        this.gallery = $('.file__picture-list');

        this.file = $('input[name="upload_print"]');
        this.loadImage = $('.print__send');
        this.btnsOptions = $('.file__menu-item');


        this.userPrints.on('click', App.UI.onSelectPrint);
        this.gallery.on('click', App.UI.onSelectPrint);

        this.file.on('change', App.UI.onLoadImage);

        this.btnsOptions.on('click', this.changeGallery);


        this.userPrints.html('');
        this.gallery.html(
            this.UI.App.Data.Prints.reduce( (acc, print) => acc + TemplateFactory.getPrintHtml(print), `` )
        );


        this.setGalleryData(this.UI.App.Data.Prints);
    }

    setGalleryData(data) {
        $.each(this.gallery.children(), (index, child) => {
            $(child).data('print', data[index]);
        });
    }

    changeGallery() {
        let $active = $('.file__menu-item.active');

        $active.removeClass('active');

        this.classList.add('active');

        if ($(this).hasClass('file-menu__addBtnTab')) {
            App.UI.PrintsList.userPrints.removeClass('active');
            App.UI.PrintsList.gallery.addClass('active');
        } else {
            App.UI.PrintsList.userPrints.addClass('active');
            App.UI.PrintsList.gallery.removeClass('active');
        }
    }
}
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
        this.preview_container.on('mouseout', this.resetPreviewTranslate.bind(this));
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
            _int = (preview_height - container_height)/container_height,
            _y = e.offsetY;


        this.preview_image.css('transform', `translateY(-${_y * _int}px)`);
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
class Keyboard {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        document.addEventListener('keydown', this.UI.onDelete);
    }

    checkKeyCode(e) {
        switch (e.keyCode) {
            case 46:
                App.UI.onDelete(e);
        }

    }
}
class Logos {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.workspace = $('.right-workspace');
        this.logo = $('.workspace-print');


        this.workspace.addClass('active');
        this.logo.removeClass('active');
    }
}
class Slider {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        var bases = this.UI.App.Data.Bases;
        var container = this.container = $(".slider__container");
        container.html(bases.reduce((acc, base) => acc + TemplateFactory.getSliderSlideHtml(base),""));
        $.each(container.children(), (index, child) => {
            $(child).data("base", bases[index]);
            $(child).on('click', this.emitBaseChange);
        });

        if(container.length) {
            $('.slider__container').slick({
                dots: false,
                infinite: false,
                speed: 300,
                // variableWidth: true,
                slidesToShow: 4,
                prevArrow: '<button type="button" class="slick-prev slider__button button button__left"></button>',
                nextArrow: '<button type="button" class="slick-next slider__button button button__right"></button>',
                slidesToScroll: 2,
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3,
                            infinite: true,
                            dots: false
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 2
                        }
                    }
                ]
            });
        }


    }

    emitBaseChange(e) {
        e.preventDefault();

        const base = $(this).data('base');

        location.href = '/constructor?id='+base._id;
    }
}

class UI {
    constructor(app) {
        this.App = app;

        this.BaseList = new BaseList(this);
        this.BaseSettings = new BaseSettings(this);
        this.Create = new Create(this);
        this.FontsList = new FontsList(this);
        this.Keyboard = new Keyboard(this);
        this.Layers = new Layers(this);
        this.LightBox = new LightBox(this);
        this.Logos = new Logos(this);
        this.Menu = new Menu(this);
        this.PrintsList = new PrintsList(this);
        this.Profile = new Profile(this);
        this.Tabs = new Tabs(this);
        this.TextSettings = new TextSettings(this);
        this.Slider = new Slider(this);

        this.leftMenu = $('.left-menu');

        console.log("UI init");
    }

    init(){
        this.Tabs.init();

        this.BaseList.init();
        this.BaseSettings.init();

        this.FontsList.init();
        this.TextSettings.init();

        this.Layers.init();
        this.LightBox.init();

        this.Keyboard.init();

        this.Logos.init();

        this.PrintsList.init();
        this.Create.init();

        this.Slider.init();

        //this.Profile.init();
        //this.Menu.init();

        $('body').on('click', this.closePopups.bind(this));
    }

    closePopups(e) {
        this.Profile.showLoginForm(e);
        this.TextSettings.closeColorPicker(e);
    }

    closeTabs() {
        if (this.Tabs.customization) {
            this.Tabs.customization.print.removeClass('active');
            this.Tabs.customization.text.removeClass('active');
            this.Tabs.customization.base.removeClass('active');
            this.Tabs.customization.layer.removeClass('active');
        }
    }

    onBase(){
        this.Tabs.customization.print.removeClass('active');
        this.Tabs.customization.text.removeClass('active');
        this.Tabs.customization.base.addClass('active');
        this.Tabs.customization.layer.removeClass('active');
    }

    onText() {
        this.Tabs.customization.print.removeClass('active');
        this.Tabs.customization.text.addClass('active');
        this.Tabs.customization.base.removeClass('active');
        this.Tabs.customization.layer.removeClass('active');

        // debugger;

        if (this.TextSettings.inputs.widgetText.length)
            setTimeout(() => this.TextSettings.inputs.widgetText[0].focus(), 0);

        const curr = this.App.GraphCore.currentWidget;
        $('.btn-add-text').addClass('active');

        if (!(curr instanceof TextWidget))
            this.Create.createTextWidget('Text');
    }

    onPrint(e) {
        const target = $(e.target),
            currentTarget = $(e.currentTarget);

        if (!currentTarget.hasClass('template__image')) {
            this.Tabs.customization.print.addClass('active');
            this.Tabs.customization.layer.removeClass('active');
            this.Tabs.customization.text.removeClass('active');
            this.Tabs.customization.base.removeClass('active');

            const curr = this.App.GraphCore.currentWidget;
            $('.btn-add-text').removeClass('active');
        } else {
            this.Create.createConfigurableImageWidget('img/prints/noImage.png');
        }

        // if (!(curr instanceof ImageWidget)) {
        //     let widget = App.currentProjectVariant.widgets.reverse().find( (w) => w instanceof ImageWidget);

        //     this.App.currentProjectVariant.widgets.reverse();

        //     this.App.GraphCore.setCurrentWidget(widget);
        // }
    }

    onLayer() {
        this.Tabs.customization.layer.addClass('active');
        this.Tabs.customization.print.removeClass('active');
        this.Tabs.customization.text.removeClass('active');
        this.Tabs.customization.base.removeClass('active');

        $('.btn-add-text').removeClass('active');
    }

    onChangeText() {
        let data = $(this).val();
        const curr = App.GraphCore.currentWidget;

        data = (!data.length) ? " " : data;

        if (data.length) {
            const layer = $(`.panel__basis[data-id="${curr.id}"]`);

            if (curr instanceof TextWidget) {
                curr.setText(data);
                layer.find('.panel__basis-text').text(data);
            }

            if (!App.currentProjectVariant.widgets.find((w) => w instanceof TextWidget)) {
                App.UI.Create.createTextWidget(data);
            }

            $.each($('.text-value'), (index, child) => {
                $(child).text(data);
            });
        }
    }

    onSize() {
        let data = $(this).val();
        const curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            let int = curr.fontSettings.fontSize/curr.size.width;

            if ( (14 < curr.fontSettings.fontSize && parseInt(data) > 14)){
                curr.setFontSize(data);
                // console.log(data);
            } else {
                $(this).val(curr.fontSettings.fontSize);
            }
        }

    }

    onColor(e) {
        const data = $(this).val(),
            target = $(e.target),
            bgColor = target.css('backgroundColor'),
            curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            if (data) {
                curr.setHexColor(data);
            } else if ((target.hasClass('example-pick') || target.hasClass('jscolor') ) && bgColor) {
                curr.setColor(bgColor);
            }
            
        }
    }

    onBaseColor(e) {
        if (!App.isPreview) {

            if ($(this).attr('id') == 'base_color') {
                let data = $(this).val(),
                    image = App.currentProjectVariant.variant.image;

                if (data) {
                    App.GraphCore.Filter.setColorFilterImage(image, "#" + data);
                    App.Project.settings.color = "#" + data;

                    const collection = App.UI.BaseSettings.color;

                    collection.removeClass('active');
                }
            } else {
                let data = $(e.target).css('background-color'),
                    image = App.currentProjectVariant.variant.image;

                const target = $(e.target),
                    collection = App.UI.BaseSettings.color;

                collection.removeClass('active');
                target.addClass('active');

                data = (data.replace(/[^-0-9,]/gim,'')).split(',').map( (elem) => parseInt(elem));

                if (data) {
                    App.GraphCore.Filter.setColorFilterImage(image, data);
                    App.Project.settings.color = data;
                }
            }

        }
    }

    onBaseSize(e) {
        let data = $(e.target).data('size');

        if (data) {
            $(e.target).addClass('selected');
            App.Project.settings.size = data;
        }
    }

    onStyle(e) {
        //this.classList.toggle('active');
        const curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            const fontSettings = curr.fontSettings;

            if ($(this).hasClass('button__bold')) {
                fontSettings.isBold = !fontSettings.isBold;
            } else if ($(this).hasClass('button__italic')) {
                fontSettings.isItalic = !fontSettings.isItalic;
            } else if ($(this).hasClass('button__underline')) {
                fontSettings.isUnderline = !fontSettings.isUnderline;
            }
        }
    }

    onSelectPrint(e) {
        if ($(e.target).hasClass('picture__clone')) {
            let src = $(e.target).parent().parent().addClass('selected').find('img').attr('src');
            $('.picture-list__picture').removeClass('selected');

            App.UI.Create.createImageWidget(e);

        } else if ($(e.target).hasClass('picture__remove')) {
            $(e.target).parent().parent().remove();
        }
    }

    onLoadImage() {
        let file = (App.UI.PrintsList.file)[0].files[0];

        if (file && file.type.indexOf('image/') >= 0) {

            let print = {
                    text: file.name,
                    src: ""
                },
                uploads = $( TemplateFactory.getPrintHtml(print, true) ),
                reader = new FileReader();

            reader.onload = (function(img) {
                return function(e) {
                    img.src = e.target.result;
                    print.src = img.src;

                    uploads.addClass('selected');
                    $('.file-upload__picture-list').append(uploads);

                    App.UI.Create.createImageWidget();
                }
            })(uploads.children()[0]);

            reader.readAsDataURL(file);
        }
    }

    onPreview(e) {
        const target = $(e.target);

        if (App.isPreview && target.hasClass('button__preview')) {
            App.UI.LightBox.closeBlock(e);
        } else {
            // App.UI.leftMenu.addClass('on-preview');
            // App.UI.BaseList.colorContainer.addClass('on-preview');
            // App.UI.LightBox.preview.addClass('on-preview');

            App.isPreview = true;
            App.UI.LightBox.openPreview();
        }

    }

    onDelete(e) {
        const curr = App.GraphCore.currentWidget;

        if (curr && (e.keyCode == 46 || $(e.target).hasClass('button__trush'))) {
            let layer = $(`.panel__basis[data-id="${curr.id}"]`);

            if (curr instanceof TextWidget) {
                App.UI.closeTabs.call(App.UI);
            }

            App.currentProjectVariant.deleteWidget(curr.id);
            App.GraphCore.setCurrentWidget(null);

            layer.remove();

        } else if ($(e.target).hasClass('button-remove')) {
            let layer = $(e.target).parent().parent(),
                id = layer.data('id'),
                widget = App.currentProjectVariant.widgets.find( (w) => w.id == id);

            if (curr instanceof TextWidget) {
                App.UI.closeTabs.call(App.UI);
                console.log();
            }

            if (widget) {
                App.currentProjectVariant.deleteWidget(widget.id);
                App.GraphCore.setCurrentWidget(null);

                layer.remove();
            }
        }
    }

    onWidgetPositionChange(e) {
        const target = $(e.target),
            curr = App.GraphCore.currentWidget;

        if (curr) {
            if (target.hasClass('editor__btn-top')) {
                App.currentProjectVariant.upWidget(curr.id);
            }

            if (target.hasClass('editor__btn-bottom')) {
                App.currentProjectVariant.downWidget(curr.id);
            }
        }

    }

    onSaveProject(e, callback) {
        if (App.logged) {
            localStorage.setItem('project_id', App.Project.id);
            App.Data.saveProjectData(callback);
        } else {
            $('body,html').animate({
                scrollTop: 0
            }, 500);

            App.UI.Profile.showLoginForm(e);
        }
    }

    onVerticalAlign(e) {
        const curr = App.GraphCore.currentWidget,
            workzone = App.currentWorkzone,
            vl = workzone.verticalLine;

        if (curr) {
            curr.position.x = vl.position.x - curr.size.width / 2 - workzone.position.x;
        }
    }

    onHorizontalAlign(e) {
        const curr = App.GraphCore.currentWidget,
            workzone = App.currentWorkzone,
            hl = workzone.horizontalLine;

        if (curr) {
            curr.position.y = hl.position.y - curr.size.height / 2 - workzone.position.y;
        }
    }

}
class Canvas {
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    init() {
        this.GraphCore.canvas.addEventListener('mouseup', this.GraphCore.mouseUp.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mousedown', this.GraphCore.mouseDown.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mousemove', this.GraphCore.mouseMove.bind(this.GraphCore));
        //this.GraphCore.canvas.addEventListener('mousewheel', this.GraphCore.mouseWheel.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mouseover', this.GraphCore.mouseOver.bind(this.GraphCore));
        this.GraphCore.canvas.addEventListener('mouseout', this.GraphCore.mouseOut.bind(this.GraphCore));
    }

    clear(ctx) {
        ctx = ctx || this.GraphCore.ctx;
        ctx.clearRect(-1,-1,ctx.canvas.width+2, ctx.canvas.height+2);

    }
}
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
class Filter {
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    // TODO rename to verb-based name
    setColorFilterImage(image, color) {
        if (!this.GraphCore.App.Project.settings.startColor) {
            this.getAverageImageColor(image);
        }

        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = image.width;
        ctx.canvas.height = image.height;

        this.GraphCore.Canvas.clear(ctx);
        ctx.drawImage(image,0,0, ctx.canvas.width, ctx.canvas.height);

        const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.width),
            currentColor = this.GraphCore.App.Project.settings.startColor;

        const before = this.hexToRgb(currentColor),
            after = (color instanceof Array) ? {
                r: color[0]
                ,g: color[1]
                ,b: color[2]
            } : this.hexToRgb(color || currentColor);

        // TODO check for not has broken
        let currentData = data.data;
        const len = currentData.length;

        for (let i = 0; i<len; i+=4) {
            if (currentData[i+3] != 0) {
                currentData[i] = after.r + currentData[i] - before.r;
                currentData[i+1] = after.g + currentData[i+1] - before.g;
                currentData[i+2] = after.b + currentData[i+2] - before.b;
            }
        }

        ctx.putImageData(data, 0, 0);
        this.GraphCore.App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

        return data;
    }

    // TODO rename to getAverageImageColor
    getAverageImageColor(image) {
        let ctx = document.createElement('canvas').getContext('2d');

        ctx.canvas.width = image.height;
        ctx.canvas.height = image.width;

        ctx.canvas.height = ctx.canvas.width * (image.height/image.width);
        ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

        let data = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height),
            color = [0,0,0],
            hex = "",
            contrast = 0;

        for (let i = 0; i <= data.data.length - 1; i+=4) {
            if (data.data[i+3] != 1) {
                color[0] += data.data[i];
                color[1] += data.data[i+1];
                color[2] += data.data[i+2];
            }
        }

        color[0] = Math.round(color[0] / ((data.data.length - 1)/4)) * 2;
        color[1] = Math.round(color[1] / ((data.data.length - 1)/4)) * 2;
        color[2] = Math.round(color[2] / ((data.data.length - 1)/4)) * 2;

        let coloring = color.map((colors) => {
            if (colors > 255) return 255;
            return colors;
        });

        hex = this.rgbToHex(coloring[0],coloring[1],coloring[2]);
        this.GraphCore.App.Project.settings.startColor = hex;

        return hex;
    }

    getImageFilterData(ctx, image) {
        ctx.drawImage(image,0,0, this.GraphCore.canvas.width, this.GraphCore.canvas.height);
        let data = ctx.getImageData(0, 0, this.GraphCore.canvas.width, this.GraphCore.canvas.height);

        this.GraphCore.App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

        this.GraphCore.Canvas.clear();
        return data;
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}
class RenderList {
    constructor(graphCore) {
        this.GraphCore = graphCore;
    }

    renderPreview(ctx) {
        this.GraphCore.Canvas.clear();
        ctx.drawImage(this.GraphCore.App.UI.LightBox.previewImage.image, this.GraphCore.App.UI.LightBox.previewImage.position.x ,this.GraphCore.App.UI.LightBox.previewImage.position.y);
    }

    render(ctx) {
        this.GraphCore.Canvas.clear(ctx);
        //this.GraphCore.defineDimensions();
        this.GraphCore.App.currentProjectVariant.render(ctx);
    }
}

class GraphCore {
    constructor(app) {
        this.App = app;


        this.Canvas = new Canvas(this);
        this.Filter = new Filter(this);
        this.RenderList = new RenderList(this);
        this.Toolkit = new Toolkit(this);
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas_container = $('.product__preview');

        this.ctx = this.canvas.getContext('2d');
        this.ctx.translate(0.5,0.5);
        this.ctx.save();

        this.draggable = null;
        this.currentWidget = null;
        this.dragged = false;
        this.resized = false;
        this.previewDragged = false;

        this.lastX = 0;
        this.lastY = 0;

        this.realX = 0;
        this.realY = 0;

        this.scale = 0.25;
        this.scaleCount = 0;

        this.attached = false;
        this.attachedDirection = "";

        if (this.canvas_container.length) {
            this.canvas_container.html(this.canvas);
        }

        if(this.App.currentProjectVariant.widgets.length) {
            let widgets = this.App.currentProjectVariant.widgets,
                l = widgets.length;

            this.setCurrentWidget(widgets[l-1]);
        }

        this.Canvas.init();

        this.defineDimensions();
    }

    defineDimensions() {
        this.resetScale();

        const variant = App.currentProjectVariant,
            width = 400,
            height = width * variant.variant.image.height/variant.variant.image.width;

        this.setDimensions(width, height);
    }

    findSprite(position) {
        let data = null;

        App.currentProjectVariant.widgets.forEach( (sprites) => {
            if (sprites.length) {
                // TODO replace foreach to filter
                data = sprites.find( (elem) => {
                    if (elem.pointIn(position)) {
                        return elem;
                    }
                });

            } else if (sprites.pointIn(position)) {
                data = sprites;
                return data;
            }
        });

        return data;
    }

    setDimensions(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    setCurrentWidget(w = null){
        if (!w) {
            if (this.currentWidget) {
                this.currentWidget.isSelected = false;
                this.currentWidget = null;
            }

            this.App.UI.closeTabs();
        } else {
            if (this.currentWidget) {
                this.currentWidget.isSelected = false;
            }

            this.currentWidget = w;
            // this.App.currentProjectVariant.upWidget(w.index);
            this.currentWidget.isSelected = true;
        }

        this.Toolkit.reset();
    }

    mouseDown(e) {
        if (!this.App.isPreview) {
            const curr  = this.findSprite( new Position(e.offsetX, e.offsetY));
            let resizeOpt;

            this.setCurrentWidget(curr);

            if (curr) {
                if ( (resizeOpt = curr.resizeOn(new Position(e.offsetX, e.offsetY))).resize ) {
                    this.resized = true;
                    this.resizeDirection = resizeOpt.direction;
                } else {
                    this.dragged = true;
                }

                $('body').addClass('_no-select');
            }

            this.lastX = e.offsetX;
            this.lastY = e.offsetY;

            this.realX = e.offsetX;
            this.realY = e.offsetY;

        } else {
            this.previewDragged = true;

            this.lastX = e.offsetX;
            this.lastY = e.offsetY;
        }
    }

    mouseUp(e) {
        $('body').removeClass('_no-select');
        this.dragged = false;
        this.resized = false;
        this.previewDragged = false;
    }

    mouseMove(e) {
        if (!this.App.isPreview) {
            if (this.resized) {
                this.resize(e);
            }

            if(this.dragged) {
                this.onMove(e);
            }

        } else {
            if (this.previewDragged)
                this.App.UI.LightBox.movePreview(e);
        }
    }

    mouseWheel(e) {
        if (this.App.isPreview) {
            this.scales(e);
        }
    }

    mouseOver(e) { //WORKFLOW
        if (this.App.isPreview) {
            this.ctx.setTransform(PREVIEW_SCALE,0,0,PREVIEW_SCALE,0,0);
            this.previewDragged = true;
        }
    }

    mouseOut(e) { //WORKFLOW
        if (this.App.isPreview) {
            this.resetScale();
            this.previewDragged = false;
            this.App.UI.LightBox.resetPreviewPosition();
        }
    }

    scales(e) {
        // TODO make scale named constants
        if (this.scale >= 0.25 && this.scale <= 2) {
            let width = (1 + this.scale)*this.canvas.width,
                height = (1 + this.scale)*this.canvas.height,
                scale = this.scale;

            if (e.deltaY < 0) this.scale = 2 * this.scale;
            else this.scale = this.scale/2;

            if (this.scale > 2) this.scale = 2;

            let x = 1 + this.scale, y = 1 + this.scale;

            if (this.scale <= 0.125) {
                x = 1; y = 1;
                this.scale = 0.25;
            }

            let transfX = (e.offsetX/this.canvas.width) * this.canvas.width * (x - 1),
                transfY = (e.offsetY/this.canvas.height) * this.canvas.height * (y - 1);

            this.ctx.setTransform(x, 0, 0, y, -transfX, -transfY);
        }
    }

    resetScale() {
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(0.5,0.5);
        this.scale = 0.25;
    }

    resize(e) {
        const curr = this.currentWidget;

        if (curr) {
            let dx = e.offsetX - this.lastX,
                dsx = e.offsetX - this.realX,
                dy = e.offsetY - this.lastY,
                dsy = e.offsetY - this.realY;

            if ($.inArray(this.resizeDirection, this.App.currentWorkzone.verticalLine.directions) >= 0) {
                this.App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(dx, new Position(e.offsetX, e.offsetY), this.resizeDirection));

            } else if ($.inArray(this.resizeDirection, App.currentWorkzone.horizontalLine.directions) >= 0) {
                if (this.resizeDirection == "upLeft" || this.resizeDirection == "bottomRight") dy = -dy;
                this.App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(-dy, new Position(e.offsetX, e.offsetY), this.resizeDirection));
            } else {
                this.App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(dsx, new Position(e.offsetX, e.offsetY), this.resizeDirection));
            }

            let outX = !this.App.currentWorkzone.verticalLine.checkSize(new Position(e.offsetX, e.offsetY), this.resizeDirection);
            let outY = !this.App.currentWorkzone.horizontalLine.checkSize(new Position(e.offsetX, e.offsetY), this.resizeDirection);

            if (outX) {
                this.lastX = e.offsetX;
            }

            if (outY) {
                this.lastY = e.offsetY;
            }

            this.realX = e.offsetX;
            this.realY = e.offsetY;

        }
    }

    // TODO rename to onMove
    onMove(e) {
        const curr = this.currentWidget;

        if (curr) {
            let dx = e.offsetX - this.lastX;
            let dy = e.offsetY - this.lastY;

            curr.moveBy(dx, dy);

            if (!App.currentWorkzone.verticalLine.checkPosition(curr)) {
                this.lastX = e.offsetX;
            }

            if (!App.currentWorkzone.horizontalLine.checkPosition(curr)) {
                this.lastY = e.offsetY;
            }
        }
    }
}
class Data {
    constructor(app) {
        this.App = app;

        this.Bases = [];
        this.Fonts = [];
        this.Prints = [];
        this.Projects = [];
    }

    async getBases(){
        const data = await this.App.Ajax.getJSON("/bases");
        this.Bases = data.bases.map((obj) => Base.fromJSON(obj));
    }

    async getPrints() {
        const data = await App.Ajax.getJSON('prints.json');
        this.Prints = data.map( (obj) =>  Print.fromJSON(obj));
    }

    async getFonts(page) {
        if (typeof page != 'number') page = 1;

        const data = await this.App.Ajax.getJSON(`/fonts?page=${page}`);
        this.Fonts = data.fonts.map((obj) => Font.fromJSON(obj));

        this.App.UI.FontsList.injectFont();
        const promises = this.Fonts.map( (font) => {
            document.fonts.load('12px ' + font.name);
        });

        Promise.all(promises);
    }

    async loadProjects(page = 1) {
        const projects = (await this.App.Ajax.getJSON('/load?page='+page)).projects;
        this.Projects = projects;
    }

    getProjectData() {
        let data = {
            variants: App.Project.variants
            ,base: App.Project.base
            ,settings: App.Project.settings
            ,id: App.Project.id
        }

        data.templates = (App.Project.templates) ? App.Project.templates : [];

        return data;
    }

    saveProjectData(data, callback) {
        if (typeof data == "function") {
            callback = data;
            data = null;
        }

        this.App.Ajax.postJSON('/save', JSON.stringify(data || this.getProjectData()), callback);
    }

}
class Ajax {
    constructor(app) {
        this.App = app;
    }

    getJSON(path){
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest;

            xhr.open("GET",path, true);
            xhr.onload = () => {
                resolve(JSON.parse(xhr.responseText));
            }

            xhr.send(null);

        });
    }

    postJSON(path, data = null, callback){
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest;

            xhr.open("POST",path, true);
            xhr.onload = () => {
                if (callback) callback(xhr.responseText);
                resolve(JSON.parse(xhr.responseText))
            }

            xhr.send(data);
        });
    }


    get(path, callback) {
        return new Promise( (resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.onload = () => {
                if (xhr.status == 200) {
                    if (callback) callback(xhr.responseText);
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            }

            xhr.open('GET', path);
            xhr.send();
        });
    }

    post(path, data = null, callback) {
        if (typeof data == "function") {
            callback = data;
            data = null;
        }

        return new Promise( (resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.onload = () => {
                if (xhr.status == 200) {
                    if (callback) callback(xhr.responseText);
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            }

            xhr.open('POST', path);
            xhr.send(data);

        });
    }
}

class Application {
    constructor() {
        this.UI = new UI(this);
        this.GraphCore = new GraphCore(this);
        this.Ajax = new Ajax(this);
        this.Data = new Data(this);
    }

    async start(){
        try {
            let session = await User.session();

            this.logged = session.status;
            this.user = session.user;
            this.saveProject = false;
            this.isPreview = false;

            this.UI.Profile.init();
            this.UI.Menu.init();

            // TODO use await Promise.all([])

            await Promise.all([this.Data.getBases(), this.Data.getFonts(), this.Data.getPrints()]);

            if (this.logged){
                await this.Data.loadProjects();

                const id = localStorage.getItem('project_id') || 0;
                const project = this.Data.Projects.find( p => p.id == id ) || this.Data.Projects[0];

                // TODO rename method setProject to more evident one
                (this.Data.Projects.length && !(this.parseURL()).id) ? await this.setProject(project) : await this.getNewProject();
            } else  {
                await this.getNewProject();
            }

            this.currentWorkzone = this.currentProjectVariant.variant.workzone;

            this.UI.init();
            this.GraphCore.init();

            this.GraphCore.ctx.translate(0.5,0.5);

            await this.UI.Profile.setProjectsList();

            //Using for tests




            this.startRender();
        } catch (error) {
            console.error(error);
        }

        try {
            if (AdminApp) AdminApp.init();
        }

        catch(error) {
            console.error(error)
        }

    }

    parseURL() {
        const url = window.location.href;
        const query = url.replace(/[a-zA-Z0-9:\/.@*\-\+\_\$\\\%]+\?/, "").replace('#', "");
        const qBodyParts = query.split('&');
        const qBody = {};

        qBodyParts.forEach( (part) => {
            let eq = part.split('=');

            qBody[eq[0]] = eq[1];
        });

        return qBody;
    }

    getProject(data) {
        if (data) {
            const project = new Project(Base.fromJSON(data.base));

            project.settings.color = data.settings.color;
            project.id = data.id;
            // project.name = data.name;
            // project.price = project.base.price;
            // TODO replace foreach to .map

            project.variants = this.getProjectVariants(data.variants);
            this.currentProjectVariant = project.variants[0];

            // data.variants.map( (variant, index) => {
            //     const v = project.variants[index];
            //
            //     v.layers = variant.layers;
            //     v.widgets = variant.widgets.map( (widget, index) =>  {
            //         const w = Widget.fromJSON(widget);
            //         w.index = index;
            //         w.layer = widget.layer;
            //
            //         v.layers[index].id = ID;
            //         w.layer.id = ID;
            //         w.id = ID;
            //         ID++;
            //
            //         if (w instanceof TextWidget) {
            //             w.lines = widget.lines;
            //             let biggestLine = "";
            //
            //             w.lines.map( line => biggestLine = (line.length > biggestLine.length) ? line : biggestLine);
            //
            //             w.biggest_line = biggestLine;
            //         }
            //
            //         return w;
            //     });
            //
            //     return v;
            // });

            project.settings.size = data.settings.size;
            return project;
        }

        return null;
    }

    getProjectVariants(variants) {
         return variants.map(this.getProjectVariant.bind(this));
    }

    getProjectVariant(variant) {
        const v = new VariantProject(BaseVariant.fromJSON(variant.variant));
        let ID = 0;

        v.layers = variant.layers;
        v.widgets = variant.widgets.map( (widget, index) =>  {
            const w = Widget.fromJSON(widget);
            w.index = index;
            w.layer = widget.layer;

            v.layers[index].id = ID;
            w.layer.id = ID;
            w.id = ID;
            ID++;

            if (w instanceof TextWidget) {
                w.lines = widget.lines;
                let biggestLine = "";

                w.lines.map( line => biggestLine = (line.length > biggestLine.length) ? line : biggestLine);

                w.biggest_line = biggestLine;
            }

            return w;
        });

        v.recountWidgets();

        return v;
    }

    async getNewProject() {
        const id = (this.parseURL()).id;
        const base = this.Data.Bases.find( (base) => base._id == id);


        this.Project = Project.newProject(base || this.Data.Bases[0]);
        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        this.GraphCore.setCurrentWidget(null);
        await this.loadProjectAssets();

        this.UI.BaseList.setVariantsList(this.Project);

        return this.Project;
    }

    async setProject(project) {
        this.Project = this.getProject(project);
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;

        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        await this.loadProjectAssets();

        this.UI.BaseList.setVariantsList(this.Project);


        return this.Project;
    }

    async setProjectOnBase(base) {
        this.Project = Project.newProject(base || this.Data.Bases[0]);
        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        this.GraphCore.setCurrentWidget(null);
        await this.loadProjectAssets();

        this.UI.BaseList.setVariantsList(this.Project);

        return this.Project;
    }

    async setCurrentVariant(variant) {
        // debugger;

        this.currentProjectVariant = variant;
        this.currentWorkzone = variant.variant.workzone;

        this.GraphCore.defineDimensions();
        await this.loadProjectAssets();

        this.GraphCore.setCurrentWidget(null);
        this.GraphCore.ctx.translate(0.5, 0.5);
    }

    async setParsedProject(project, variant_index) {
        this.Project = project;
        this.currentProjectVariant = this.Project.variants[variant_index || 0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        await this.loadProjectAssets();

        return this.Project;
    }

    async loadProjectAssets() {
        const variant = this.currentProjectVariant;
        await variant.loadLazy();
    }

    // async getProjectPreviewImage(variant) {

    // }

    async getVariantPreview(variant) {
        await this.setCurrentVariant(variant);

        // if (isDefault) {
        //     this.GraphCore.Filter.setColorFilterImage(variant.variant.image, color);

        //     variant.variant.loadLazy();
        // }

        this.isPreview = true;
        this.GraphCore.RenderList.render(this.GraphCore.ctx);
        this.isPreview = false;

        return this.GraphCore.canvas.toDataURL('image/png');
    }

    // TODO rename to verb-based name
    startRender() {
        if (!App.isPreview)
            App.GraphCore.RenderList.render(App.GraphCore.ctx);
        else
            App.GraphCore.RenderList.renderPreview(App.GraphCore.ctx);

        requestAnimationFrame(this.startRender.bind(this));
    }
}



let App = null;

class Starter {
    constructor() {
        this.Libs = [
            ['Base','BaseVariant','Position','Size','WorkZone','Project','VariantProject','FontSettings','Widget','ProjectSettings']
            ,['TxtWidget','ImageWidget','ComplexWidget', 'Path', 'Font','Print', 'BaseLine']
            ,['VerticalBaseLine', 'HorizontalBaseLine']
        ];

        requirejs.config({
            baseUrl: 'js/Classes/'
        });
    }

    Start() {
        $('head').append(TemplateFactory.getLinkHtml('./js/css/frontend.css', 'stylesheet'));

        requirejs(this.Libs[0], () => {
            requirejs(this.Libs[1], () => {
                requirejs(this.Libs[2], () => {
                    this.App = new Application();
                    App = this.App;
                    this.App.start();
                    console.log("Application loaded");
                });
            });
        });
    }
}

new Starter().Start();

const PREVIEW_SCALE = 2;