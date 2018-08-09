//imports("Profile.js");
//imports("Menu.js");
//imports("Tabs.js");
//imports("BaseList.js");
//imports("BaseSettings.js");
//imports("FontsList.js");
//imports("TextSettings.js");
//imports("Create.js");
//imports("PrintsList.js");
//imports("Layers.js");
//imports("LightBox.js");
//imports("Keyboard.js");
//imports("Logos.js");
//imports("Slider.js");

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
        this.Cart = new Cart(this);
        this.Order = new Order(this);

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

        this.Cart.init();
        this.Order.init();

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
            this.Tabs.customization.panel.removeClass('active');
        }
    }

    openPanelTab() {
        const curr = this.App.GraphCore.currentWidget;

        if (curr) {
            this.Tabs.customization.panel.addClass('active');
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

    async onBaseColor(e) {
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
                    await App.UI.BaseList.setVariantsList(App.Project);
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
                    print.id = App.makeid(32);

                    uploads.addClass('selected');
                    uploads.data('print', print);
                    $('.file-upload__picture-list').append(uploads);

                    App.UI.Create.createImageWidget(print);
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