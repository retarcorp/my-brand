class Profile {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.logins = $('.authorization__form');
        this.logins_item = $('.main-menu__item.login');
        this.logins_submit = $('input[type="submit"][value="Вход"]');

        this.logout_item = $('.profile__link.link__logout');

        this.profile = $('.profile__menu');
        this.profile_item = $('.main-menu__item.profile');
        this.profile_name = $('.profile__name');

        this.container = $('.favorites__container');

        this.registration_item = $('.main-menu__item.registration')
        this.registration = $('section.registration');
        this.registration_accept = $('.post-reg__button');

        this.save_project_item = $('.details__link.save');
        this.save_project = $('.details__after');


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

        this.save_project_item.on('click', this.saveProject);

        $('body').on('click', this.showLoginForm);


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
        if (!App.UI.Profile.logins_item.has($(e.target)).length) {
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

                location.reload();
            } else {
                alert(data.message);
            }

        });
    }

    saveProject(e) {
        e.preventDefault();
        App.saveProject = true;

        App.UI.Profile.save_project.removeClass('pending');
        App.UI.Profile.save_project.addClass('active');

        App.UI.onSaveProject(e, () => {
            App.UI.Profile.save_project.removeClass('active');
            App.UI.Profile.save_project.addClass('pending');
        });
    }

    setProjectsList() {
        if (this.container.length) {
            let projects = this.UI.App.Data.Projects;

            if (!projects || !projects.length) {
                this.container.html('There is no favorites yet.');

            } else {
                this.container.html(
                    projects.reduce((acc, project) => acc + TemplateFactory.getProjectsListHtml(project), ``)
                );

                this.UI.LightBox.setPreviewImage();

                this.setPreviewImage(projects, 0)

            }

        }
    }

    setPreviewImage(projects, index) {
        this.UI.App.setProject(projects[index]);

        this.UI.App.currentProjectVariant.variant.filterImage.addEventListener('load', () => {
            let proj = projects[index];

            this.UI.App.isPreview = true;
            this.UI.App.GraphCore.RenderList.render(this.UI.App.GraphCore.ctx);
            this.UI.App.isPreview = false;

            $('.favorites__img')[index].src = this.UI.App.GraphCore.canvas.toDataURL('image/png');

            if (projects[index+1] && this.UI.App.currentProjectVariant.variant.loaded) {
                this.setPreviewImage(projects, index+1);
            }
        });
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

        this.customization.print.on('click', (e) => {
            if ($(e.target).hasClass('add-photo') || $(e.target).hasClass('button__close')) {
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


        this.arrows.on('click', this.setProjectVariant);
        this.sizeContainer.on('click', this.UI.onBaseSize);


        this.setSizeHtml();
        this.setBaseSize(this.UI.App.Project.settings.size);
    }

    select(e) {
        $(e.target.parentElement).addClass('selected');

        App.Project.base = $(e.target.parentElement).data('base');
        App.Project.addVariants();
    }

    setSizeHtml() {
        this.sizeContainer.html(
            this.UI.App.Project.base.size.reduce( (acc, size) => acc + TemplateFactory.getSizeHtml(size), ``)
        );
    }

    setBaseSize(size) {
        let target = $(`.size__block[data-size="${size}"] > input`),
            collection = $(`[data-size] > input`);

        collection.attr('checked', false);
        target.attr('checked', true);
    }

    setProjectVariant(e) {
        App.GraphCore.resetScale();

        if ($(e.target).hasClass('rotate__btn-right')) {
            App.currentProjectVariant = App.Project.setNextVariant();
        } else if ($(e.target).hasClass('rotate__btn-left')) {
            App.currentProjectVariant = App.Project.setPrevVariant();
        }

        App.UI.BaseList.resetVariant();
    }

    resetVariant() {
        this.UI.App.currentWorkzone = this.UI.App.currentProjectVariant.variant.getWorkzone();
        this.UI.App.currentProjectVariant.variant.setColor();

        this.UI.Layers.loadLayers();

        this.UI.App.GraphCore.setDimensions(this.UI.App.currentProjectVariant.variant.size.width, this.UI.App.currentProjectVariant.variant.size.height);
        this.UI.App.GraphCore.setCurrentWidget(null);

        this.UI.LightBox.setPreviewImage();
    }


}
class BaseSettings {
    constructor(ui) {
        this.UI = ui;

        this.init();
    }

    init() {
        this.color = $('.details__color');

        this.color.on('click', this.UI.onBaseColor);
    }
}
class FontsList {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.container = $('.editor__fonts-list');


        this.container.on('click', this.getFont);


        this.injectFont();
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
    }

    injectFont() {
        $('head').append(TemplateFactory.getStyleTag());
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

        this.colorView = $('.editor__color');

        this.btnsStyle = $('.decoration__button')

        this.inputs.widgetText.on('input', App.UI.onChangeText);
        this.inputs.textSize.on('input', App.UI.onSize);
        this.inputs.color.on('change', App.UI.onColor);

        this.btnsStyle.on('click', App.UI.onStyle);
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
        let print = $('.picture-list__picture.selected img'),
            data = { src: print.attr('src'), text: 'collage' };

        if (data) {
            let widget = ImageWidget.getDefault(data.src);

            widget.text = data.text;
            widget.id = App.UI.Layers.addLayer(widget, 'space');

            App.currentProjectVariant.addWidget(widget);
            App.GraphCore.setCurrentWidget(widget);
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
            App.UI.Print.userPrints.removeClass('active');
            App.UI.Print.gallery.addClass('active');
        } else {
            App.UI.Print.userPrints.addClass('active');
            App.UI.Print.gallery.removeClass('active');
        }
    }
}
class Layers {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.container = $('.layers__list');

        this.currentLayer = null;


        this.container.data('lastId', 0);
        this.container.html(``);


        this.container.on('click', this.layerEvent);
    }

    layerEvent(e) {
        if ($(e.target).hasClass('delete__layer'))
            App.UI.onDelete(e);

        else if ($(e.target).hasClass('to-top__layer')){
            App.UI.Layers.layerUp(e);

        } else if ($(e.target).hasClass('to-bottom__layer')) {
            App.UI.Layers.layerDown(e);

        } else {
            let id = $(e.target).data('id');
            const curr = App.currentProjectVariant.widgets.find( (widget) => widget.id == id );

            App.GraphCore.setCurrentWidget(curr);
        }
    }

    addLayer(widget, type) {
        let lastId = this.container.data('lastId'),
            index = widget.index,
            text = widget.text;

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

            App.currentProjectVariant.downWidget(curr.index);

            //$(e.target).parent().parent().insertBefore($(e.target).parent().parent().prev());
        }
    }

    layerDown(e) {
        if ($(e.target).parent().parent().next().length) {
            let id = $(e.target).parent().parent().data('id'),
                curr = App.currentProjectVariant.widgets.find( (w) => w.id == id );

            App.currentProjectVariant.upWidget(curr.index);

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
        this.preview = $('.btn-show-result');
        this.box = $('.preview');
        this.content = $('.preview__picture img');

        this.previewImage = {
            image: null
                ,position: { x: 0, y: 0 }
        };


        this.preview.on('click', App.UI.onPreview);
        this.box.on('click', this.closeBlock.bind(this));
    }

    closeBlock(e) {
        this.UI.App.isPreview = false;

        this.UI.App.UI.leftMenu.removeClass('on-preview');
        this.UI.App.UI.BaseList.colorContainer.removeClass('on-preview');
        this.preview.removeClass('on-preview');

        this.UI.App.GraphCore.resetScale(this.UI.App.GraphCore.ctx);
    }

    setPreviewImage() {
        this.UI.App.GraphCore.resetScale();
        this.UI.App.UI.LightBox.resetPreview();
    }

    resetPreview() {
        this.resetPreviewPosition();

        App.GraphCore.RenderList.render(App.GraphCore.ctx);

        this.previewImage.image = new Image();
        this.previewImage.image.src = App.GraphCore.canvas.toDataURL('image/png');
    }

    resetPreviewPosition() {
        this.previewImage.position = new Position(0,0);
    }

    movePreview(e) {
        let dx = e.offsetX - App.GraphCore.lastX,
            dy = e.offsetY - App.GraphCore.lastY;

        this.moveBy(dx, dy);

        App.GraphCore.lastX = e.offsetX;
        App.GraphCore.lastY = e.offsetY;
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

        //this.Profile.init();
        //this.Menu.init();
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

        const curr = this.App.GraphCore.currentWidget;
        $('.btn-add-text').addClass('active');

        if (!(curr instanceof TextWidget))
            this.Create.createTextWidget('Text');
    }

    onPrint() {
        this.Tabs.customization.print.addClass('active');
        this.Tabs.customization.layer.removeClass('active');
        this.Tabs.customization.text.removeClass('active');
        this.Tabs.customization.base.removeClass('active');

        const curr = this.App.GraphCore.currentWidget;
        $('.btn-add-text').removeClass('active');

        if (!(curr instanceof ImageWidget)) {
            let widget = App.currentProjectVariant.widgets.reverse().find( (w) => w instanceof ImageWidget);

            this.App.currentProjectVariant.widgets.reverse();

            this.App.GraphCore.setCurrentWidget(widget);
        }
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

        if (data.length) {
            if (curr instanceof TextWidget) {
                curr.setText(data);
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

            if ( (data / int < App.currentWorkzone.size.width - 10 && curr.inWorkzone()) && (14 < curr.fontSettings.fontSize && parseInt(data) > 14)){
                curr.setFontSize(data);
                // console.log(data);
            } else {
                $(this).val(curr.fontSettings.fontSize);
            }
        }

    }

    onColor() {
        let data = $(this).val();
        const curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            curr.setColor(data);
        }
    }

    onBaseColor(e) {
        if (!App.isPreview) {
            let data = $(e.target).css('background-color'),
                image = App.currentProjectVariant.variant.image;

            data = (data.replace(/[^-0-9,]/gim,'')).split(',').map( (elem) => parseInt(elem));

            if (data) {
                App.GraphCore.Filter.colorFilter(App.GraphCore.ctx, image, data);
                App.Project.settings.color = data;
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
        let file = (App.UI.Print.file)[0].files[0];

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
        if (App.isPreview) {
            App.UI.LightBox.closeBlock(e);
        } else {
            App.UI.leftMenu.addClass('on-preview');
            App.UI.BaseList.colorContainer.addClass('on-preview');
            App.UI.LightBox.preview.addClass('on-preview');

            App.isPreview = true;

            App.UI.LightBox.setPreviewImage();
        }

    }

    onDelete(e) {
        const curr = App.GraphCore.currentWidget;

        if (curr && e.keyCode == 46) {
            let layer = $(`.layer[data-id="${curr.id}"]`);

            App.currentProjectVariant.deleteWidget(curr.index);
            App.GraphCore.setCurrentWidget(null);

            layer.remove();

        } else if ($(e.target).hasClass('delete__layer')) {
            let layer = $(e.target).parent().parent(),
                id = layer.data('id'),
                widget = App.currentProjectVariant.widgets.find( (w) => w.id == id);

            if (widget) {
                App.currentProjectVariant.deleteWidget(widget.index);
                App.GraphCore.setCurrentWidget(null);

                layer.remove();
            }
        }
    }

    onSaveProject(e, callback) {
        if (App.logged) {
            App.Data.saveProjectData(callback);
        } else {
            $('body,html').animate({
                scrollTop: 0
            }, 500);

            App.UI.Profile.showLoginForm(e);
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
        this.GraphCore.canvas.addEventListener('mousewheel', this.GraphCore.mouseWheel.bind(this.GraphCore));
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

        if (fontSettings.isItalic) {
            $(".button__italic").addClass('active');
        } else{
            $(".button__italic").removeClass('active');
        }

        if (fontSettings.isBold){
            $(".button__bold").addClass('active');
        } else {
            $(".button__bold").removeClass('active');
        }

        if (fontSettings.isUnderline) {
            $(".button__underline").addClass('active');
        } else {
            $(".button__underline").removeClass('active');
        }
    }

    resetImageToolkit() {
        const curr = App.GraphCore.currentWidget;
        let target = $(`[name="${curr.text}"]`),
            collection = $('.print-img.selected');

        collection.removeClass('selected');
        target.addClass('selected');
    }
}
class Filter {
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    colorFilter(ctx, image, color) {
        if (this.GraphCore.App.Project.settings.startColor) {
            this.GraphCore.RenderList.clear();
            ctx.drawImage(image,0,0, ctx.canvas.width, ctx.canvas.height);

            var data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.width),
                currentColor = this.GraphCore.App.Project.settings.startColor;

            var before = this.hexToRgb(currentColor),
                after = (color instanceof Array) ? {
                    r: color[0]
                    ,g: color[1]
                    ,b: color[2]
                } : this.hexToRgb(color || currentColor);

            for (let i = 0; i<data.data.length; i+=4) {
                if (data.data[i+3] != 0) {
                    data.data[i] = after.r + data.data[i] - before.r;
                    data.data[i+1] = after.g + data.data[i+1] - before.g;
                    data.data[i+2] = after.b + data.data[i+2] - before.b;
                }
            }

            ctx.putImageData(data, 0, 0);
            this.GraphCore.App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

            this.GraphCore.RenderList.clear();
            return data;
        } else {
            this.getImageColor(image.src);
        }
    }

    getImageColor(src) {
        let ctx = document.createElement('canvas').getContext('2d'),
            image = new Image();

        ctx.canvas.width = 400;
        ctx.canvas.height = 400;

        image.src = src;
        image.onload = () => {
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
        };
    }

    getImageFilterData(ctx, image) {
        ctx.drawImage(image,0,0, this.GraphCore.canvas.width, this.GraphCore.canvas.height);
        let data = ctx.getImageData(0, 0, this.GraphCore.canvas.width, this.GraphCore.canvas.height);

        this.GraphCore.App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

        this.GraphCore.RenderList.clear();
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
    constructor(GraphCore) {
        this.GraphCore = GraphCore;
    }

    renderPreview(ctx) {
        this.clear();
        ctx.drawImage(this.GraphCore.App.UI.LightBox.previewImage.image, this.GraphCore.App.UI.LightBox.previewImage.position.x ,this.GraphCore.App.UI.LightBox.previewImage.position.y);
    }

    render(ctx) {
        this.clear(ctx);

        this.GraphCore.App.currentProjectVariant.render(ctx);
    }

    clear() {
        this.GraphCore.ctx.clearRect(0,0,App.GraphCore.canvas.width, this.GraphCore.canvas.height);
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
    }

    findSprite(position) {
        let data = null;

        App.currentProjectVariant.widgets.forEach( (sprites) => {
            if (sprites.length) {
                sprites.forEach( (elem) => {
                    if (elem.pointIn(position)) {
                        data = elem;
                        return true;
                    }
                });

            } else if (sprites.pointIn(position)) {
                data = sprites;
                return true;
            }
        });

        return data;
    }

    setDimensions(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    setCurrentWidget(w){
        if (!w) {
            if (this.currentWidget) {
                this.currentWidget.isSelected = false;
                this.currentWidget = null;
            }
        } else {
            if (this.currentWidget)
                this.currentWidget.isSelected = false;

            this.currentWidget = w;
            this.App.currentProjectVariant.upWidget(w.index);
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
                this.move(e);
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

    scales(e) {
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

    move(e) {
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
    }

    async loadProjects() {
        const projects = (await this.App.Ajax.getJSON('/load')).projects;
        this.Projects = projects;
    }

    getProjectData() {
        let data = {
            variants: App.Project.variants
            ,base: App.Project.base
            ,settings: App.Project.settings
            ,id: App.Project.id
        }

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

class Application {
    constructor() {
        this.UI = new UI(this);
        this.GraphCore = new GraphCore(this);
        this.Ajax = new Ajax(this);
        this.Data = new Data(this);
    }

    async start(){
        let session = await User.session();

        this.logged = session.status;
        this.user = session.user;
        this.saveProject = false;
        this.isPreview = false;

        this.UI.Profile.init();
        this.UI.Menu.init();

        await this.Data.getBases();
        await this.Data.getFonts();
        await this.Data.getPrints();

        if (this.logged){
            await this.Data.loadProjects();

            (this.Data.Projects.length) ? this.setProject(this.Data.Projects[0]) : this.Project = Project.newProject(this.Data.Bases[0]);
        } else  {
            this.Project = Project.newProject(this.Data.Bases[0]);
        }


        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;

        this.UI.init();
        this.GraphCore.init();

        this.UI.Profile.setProjectsList();

        //Using for tests

        this.mechanic();
    }

    getProject(proj) {
        let data = proj,
            project = null;

        if (data) {
            project = new Project(Base.fromJSON(data.base));
            this.currentProjectVariant = project.variants[0];

            project.settings.color = data.settings.color;
            project.id = data.id;

            data.variants.forEach( (variant, index) => {
                project.variants[index].loaded = false;

                project.variants[index].layers = variant.layers;
                project.variants[index].widgets = variant.widgets.map( (widget, index) =>  {
                    let w = Widget.fromJSON(widget);
                    w.index = index;
                    w.layer = widget.layer;

                    if (w instanceof TextWidget) {
                        w.lines = widget.lines;
                    }

                    return w;
                });
            });

            project.settings.size = data.settings.size;
        }

        return project;
    }

    setProject(project) {
        this.Project = this.getProject(project);
    }

    mechanic() {
        if (!App.isPreview)
            App.GraphCore.RenderList.render(App.GraphCore.ctx);
        else
            App.GraphCore.RenderList.renderPreview(App.GraphCore.ctx);

        requestAnimationFrame(this.mechanic.bind(this));
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
