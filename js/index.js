var glor = 100;
/**
 * App - основное ядро, с которого стартует Приложение.
 * Запускает загрузку данных с сервера, инициализирует UI, создаёт новый проект.
 * @constant
 */
const App = {
    start: async function(){        
        await this.Data.getBases();
        await this.Data.getFonts();
        await this.Data.getPrints();
        await this.Data.loadProject();

        this.isPreview = false;

        // this.Project = Project.NewProject(this.Data.Bases[0]);
        //
        // console.log(this.Project);
        //
        // this.currentProjectVariant = this.Project.variants[0];
        // this.currentWorkzone = this.currentProjectVariant.variant.workzone;

        console.log(this.Data.Bases);

        App.Project = App.getProject() || Project.NewProject(this.Data.Bases[0]);

        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;

        this.GraphCore.init();
        this.UI.init();

        //Using for tests

        App.mechanic();
    }

    /**
     * UI - интерфейс пользователя. Инициализуерует обработчики событий,
     * дополняет контент страниц по данным с сервера.
     * @constructor
     */

    ,UI: {

        /**
         * Функция инициализации интерфейса пользователя.
         * @function
         */

        init(){
            this.Tabs.init();

            this.BaseList.init();
            this.BaseSettings.init();

            this.Fonts.init();
            this.TextSettings.init();

            this.Layers.init();
            this.LightBox.init();

            this.Keyboard.init();

            this.Logos.init();

            this.Print.init();
            this.Canvas.init();
            this.Create.init();
        }

        ,leftMenu: $('.left-menu')

        /**
         * Функция обработчик для событий. Срабатывает при выборе таба основы.
         * Отключает остальные табы.
         * @callback
         */

        ,onBase(){
            this.Tabs.customization.print.removeClass('active');
            this.Tabs.customization.text.removeClass('active');
            this.Tabs.customization.base.addClass('active');
            this.Tabs.customization.layer.removeClass('active');
        }

        /**
         * Функция обработчик для событий. Срабатывает при выборе таба текста.
         * Отключает остальные табы.
         * @callback
         */

        ,onText() {
            this.Tabs.customization.print.removeClass('active');
            this.Tabs.customization.text.addClass('active');
            this.Tabs.customization.base.removeClass('active');
            this.Tabs.customization.layer.removeClass('active');

            const curr = App.GraphCore.currentWidget;

            $('.btn-add-text').addClass('active');

            if (!(curr instanceof TextWidget)) {
                let widget = App.currentProjectVariant.widgets.reverse().find( (w) => w instanceof TextWidget);

                App.currentProjectVariant.widgets.reverse();

                App.GraphCore.setCurrentWidget(widget);
            }
        }

        /**
         * Функция обработчик для событий. Срабатывает при выборе таба принта.
         * Отключает остальные табы.
         * @callback
         */

        ,onPrint() {
            this.Tabs.customization.print.addClass('active');
            this.Tabs.customization.layer.removeClass('active');
            this.Tabs.customization.text.removeClass('active');
            this.Tabs.customization.base.removeClass('active');

            const curr = App.GraphCore.currentWidget;
            $('.btn-add-text').removeClass('active');

            if (!(curr instanceof ImageWidget)) {
                let widget = App.currentProjectVariant.widgets.reverse().find( (w) => w instanceof ImageWidget);

                App.currentProjectVariant.widgets.reverse();

                App.GraphCore.setCurrentWidget(widget);
            }
        }

        /**
         * Функция обработчик для событий. Срабатывает при выборе таба слоя.
         * Отключает остальные табы.
         * @callback
         */

        ,onLayer() {
            this.Tabs.customization.layer.addClass('active');
            this.Tabs.customization.print.removeClass('active');
            this.Tabs.customization.text.removeClass('active');
            this.Tabs.customization.base.removeClass('active');

            $('.btn-add-text').removeClass('active');
        }

        ,onChangeText() {
            let data = $(this).val();
            const curr = App.GraphCore.currentWidget;

            if (data.length) {
                if (curr instanceof TextWidget) {
                    curr.setText(data);
                    //App.UI.Layers.setText(data);
                }

                if (!App.currentProjectVariant.widgets.find((w) => w instanceof TextWidget)) {
                    App.UI.Create.createTextWidget(data);
                    console.log(data);
                }

                $.each($('.text-value'), (index, child) => {
                    $(child).text(data);
                });
            }
        }

        ,onSize() {
            let data = $(this).val();
            const curr = App.GraphCore.currentWidget;

            if (curr instanceof TextWidget) {
                let int = curr.fontSettings.fontSize/curr.size.width;

                if ( (data / int < App.currentWorkzone.size.width - 10 && curr.inWorkzone()) || (data < curr.fontSettings.fontSize && parseInt(data) > 14)){
                    curr.setFontSize(data);
                    // console.log(data);
                } else {
                    $(this).val(curr.fontSettings.fontSize);
                }

            }

        }

        ,onColor() {
            let data = $(this).val();
            const curr = App.GraphCore.currentWidget;

            console.log('1');

            if (curr instanceof TextWidget) {
                curr.setColor(data);
            }
        }

        ,onBaseColor(e) {
            if (!App.isPreview) {
                let data = $(e.target).css('background-color'),
                    image = App.currentProjectVariant.variant.image;

                //data = ("HEllo999").replace(/\[^-1-9]+/, 'f');

                data = (data.replace(/[^-0-9,]/gim,'')).split(',').map( (elem) => parseInt(elem));

                if (data) {
                    App.GraphCore.Filter.colorFilter(App.GraphCore.ctx, image, data);
                    App.Project.settings.color = data;
                }
            }
        }

        ,onBaseSize(e) {
            let data = $(e.target).data('size');

            if (data) {
                $(e.target).addClass('selected');
                App.Project.settings.size = data;
            }
        }

        ,onStyle(e) {
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

                // switch ($(this).data('style')) {
                //     case FontSettings.Style.ITALIC:
                //         fontSettings.isItalic = !fontSettings.isItalic;
                //         break;
                //
                //     case FontSettings.Style.BOLD:
                //         fontSettings.isBold = !fontSettings.isBold;
                //         break;
                //
                //     case FontSettings.Style.UNDERLINE:
                //         fontSettings.isUnderline = !fontSettings.isUnderline;
                //         break;
                // }
            }
        }

        ,onAlign(e) {
            let $active = $('.text_align.active');
            const curr = App.GraphCore.currentWidget;

            $active.removeClass('active');

            this.classList.add('active');

            App.UI.TextSettings.textAlign = $(this).data('align');

            //console.log(curr);

            if (curr instanceof TextWidget) {
                curr.fontSettings.alignment = App.UI.TextSettings.textAlign;
                console.log(curr.fontSettings.alignment);
            }
        }

        ,onSelectPrint(e) {
            if ($(e.target).hasClass('print-img')) {
                $('.print-img.selected').removeClass('selected');
                let data = $(e.target).addClass('selected').data('print');

                //const curr = App.GraphCore.currentWidget;

                App.UI.Create.createImageWidget(e);

                // if (curr instanceof ImageWidget) {
                //     curr.text = data.text;
                //     curr.setImage(data.src);
                //     App.UI.Layers.setText(data.text);
                // }
            }
        }

        ,onLoadImage() {
            let file = (App.UI.Print.file)[0].files[0];

            if (file && file.type.indexOf('image/') >= 0) {

                let print = {
                    text: file.name,
                    src: ""
                }
                let uploads = $( TemplateFactory.getPrintHtml(print) );

                let reader = new FileReader();

                reader.onload = (function(img) {
                    return function(e) {
                        img.src = e.target.result;
                        print.src = img.src;

                        console.log(uploads);

                        uploads.data('print', print);
                        App.UI.Print.userPrints.append(uploads);

                        $('.print-img.selected').removeClass('selected');
                        uploads.addClass('selected');

                        App.UI.Create.createImageWidget();
                    }
                })(uploads.children()[0]);

                reader.readAsDataURL(file);
            }
        }

        ,onPreview(e) {
            //App.UI.LightBox.box.addClass('active');
           // App.UI.LightBox.preview.addClass('active');

            if (App.isPreview) {
                App.UI.LightBox.closeBlock(e);
            } else {
                App.UI.leftMenu.addClass('on-preview');
                App.UI.BaseList.colorContainer.addClass('on-preview');
                App.UI.LightBox.preview.addClass('on-preview');

                App.isPreview = true;

                App.UI.LightBox.setPreviewImage();
            }



            // let ctx = document.createElement('canvas').getContext('2d');
            //
            // ctx.canvas.width = App.currentProjectVariant.variant.size.width;
            // ctx.canvas.height = App.currentProjectVariant.variant.size.height;
            //
            // App.currentProjectVariant.render(ctx);
            //
            // App.isPreview = false;
            //
            // $('.preview__picture')[0].style.width = App.currentProjectVariant.variant.size.width+'px';
            //
            // App.UI.LightBox.content[0].style.background = "#fff";
            // App.UI.LightBox.content[0].src = ctx.canvas.toDataURL('image/png');

        }

        ,onDelete(e) {
            const curr = App.GraphCore.currentWidget;

            if (curr && e.keyCode == 46) {
                let layer = $(`.layer[data-id="${curr.id}"]`);

                App.currentProjectVariant.deleteWidget(curr.index);
                // App.currentProjectVariant.removeLayer(curr.index);

                App.GraphCore.setCurrentWidget(null);

                layer.remove();

            } else if (curr && $(e.target).hasClass('.delete')) {
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

        ,onSaveProject(e) {
            //let data = Object.assign({}, App.Project);

            let data = {
                variants: App.Project.variants
                ,base: App.Project.base
                ,settings: App.Project.settings
            }

            console.log(data);

            App.GraphCore.setCurrentWidget(null);

            App.Ajax.postJSON('/save', JSON.stringify(data));
        }

        /**
         * Tabs - инициализирует DOM структуру для табов. Запускает обработчики событий.
         * @constructor
         */

        ,Tabs:{

            /**
             * Функция инициализации табов. Получает ссылки на DOM объекты и ставит триггеры на события.
             * @function
             */

            init(){
                this.customization = {
                    base: $('.addition-basis'),
                    text: $('.addition-text'),
                    print: $('.addition-print'),
                    layer: $('.addition-layer')
                };

                this.tabs = {
                    base: $('.star-set'),
                    text: $('.text-set'),
                    print: $('.print-set'),
                    layer: $('.basis-set')
                };

                this.tabs.base.on('click', App.UI.onBase.bind(App.UI) );
                this.tabs.text.on('click', App.UI.onText.bind(App.UI) );
                this.tabs.print.on('click', App.UI.onPrint.bind(App.UI) );
                this.tabs.layer.on('click', App.UI.onLayer.bind(App.UI) );

                $('.btn-add-text').addClass('active');

                // Set toggling tabs on click 'em @DONE
            }
        }

        /**
         * BaseList - инициализирует DOM структуру для табов. Запускает обработчики событий для контента табов.
         * @constructor
         */

        ,BaseList:{

            /**
             * Функция инициализации BaseList. Формирует контент страницы. Ставит обработчики событий для контента табов.
             * @function
             */

            init(){
                // this.container.html(
                //     App.Data.Bases.reduce((acc, base) => acc + TemplateFactory.getBaseHtml(base), ``)
                // );

                // this.container.on('click', this.select);
                //
                // $.each(this.container.children(), (index, child) => {
                //     $(child).data('base', App.Data.Bases[index]);
                // });

                this.colorContainer.html(
                    App.Project.base.colorArray.reduce( (acc, color) => acc + TemplateFactory.getBaseColorHtml(color), ``)
                );

                this.setSizeHtml();
                this.setBaseSize(App.Project.settings.size);

                this.sizeContainer.on('click', App.UI.onBaseSize);

                this.setBaseVariantsHtml(App.Data.Bases[0].variants);

                // Set on click listerens on base list items, console log selected one @DONE
            }

            /**
             * Функция обработчик для событий. Срабатывает при выборе основы.
             * Снимает предыдущий выбор.
             * @callback
             */

            ,select(e) {
                $('.img-slider.selected').removeClass('selected');
                $(e.target.parentElement).addClass('selected');

                App.Project.base = $(e.target.parentElement).data('base');
                App.Project.addVariants();
                App.UI.BaseList.setBaseVariantsHtml(App.Project.base.variants)
            }

            ,setBaseVariantsHtml() {

                //App.Project.variants.

                // variants.forEach( (variant, index) => {
                //     variant.index = index;
                // });

                this.arrows.on('click', App.UI.BaseList.setProjectVariant);

                // $.each(App.UI.BaseList.variantsSlider.children(), (index, child) => {
                //     $(child).data('variant', App.Project.variants[index]);
                // });
            }

            ,setSizeHtml() {
                this.sizeContainer.html(
                    App.Project.base.size.reduce( (acc, size) => acc + TemplateFactory.getSizeHtml(size), ``)
                );
            }

            ,setBaseSize(size) {
                $(`.size__block[data-size="${size}"]`);

                $(`[data-size] > input`).attr('checked', false);
                $(`[data-size="${size}"] > input`).attr('checked', true);
            }

            ,setProjectVariant(e) {
            	//if ($(e.target.parentElement).data('variant')) {

                App.GraphCore.resetScale();

                if ($(e.target).hasClass('rotate__btn-right')) {
                    App.currentProjectVariant = App.Project.nextVariant();

                    App.currentWorkzone = App.currentProjectVariant.variant.getWorkzone();

                    App.currentProjectVariant.variant.setColor();
                    App.UI.Layers.loadLayers();

                    App.GraphCore.setDimensions(App.currentProjectVariant.variant.size.width, App.currentProjectVariant.variant.size.height);

                } else if ($(e.target).hasClass('rotate__btn-left')) {
                    App.currentProjectVariant = App.Project.prevVarinat();
                    App.currentWorkzone = App.currentProjectVariant.variant.getWorkzone();

                    App.currentProjectVariant.variant.setColor();
                    App.UI.Layers.loadLayers();

                    App.GraphCore.setDimensions(App.currentProjectVariant.variant.size.width, App.currentProjectVariant.variant.size.height);

                }

                App.UI.LightBox.setPreviewImage();
            	//}
            }

            /**
             * Ссылка на контейнер контента таба. Устанавливается по css-селлектору.
             * @member
             */

            ,container: $("#bases-container")
            ,sizeContainer: $('.size__container')
            ,variantsSlider: $('.slider-container')
            ,colorContainer: $('.workspace-color')
            ,arrows: $('.product__rotate')

            ,right: null
            ,left: null
            ,center: null
        }

        ,BaseSettings: {

            init() {
                this.color.on('click', App.UI.onBaseColor);
            }

            ,color: $('.details__color')
        }

        /**
         * Fonts - инициализирует DOM структуру для шрифтов. Запускает обработчики событий для выбора шрифта.
         * @constructor
         */

        ,Fonts: {

            /**
             * Функция инициализации Fonts. Формирует контент страницы для шрифтов, загружает шрифты с сервера. Ставит обработчики событий для шрифтов.
             * @function
             */

            init() {

                this.injectFont();

                this.container.html(
                    App.Data.Fonts.reduce((acc, font) => acc + TemplateFactory.getFontHtml(font),``)
                );

                this.container.on('click', this.getFont);

                $.each(this.container.children(), (index, child) => {
                    $(child).data('font', App.Data.Fonts[index]);
                });
            }

            /**
             * Загружает шрифты на страницу размещением DOM-объекта style.
             * @function
             */

            ,injectFont() {
                $('head').append(TemplateFactory.getStyleTag());
            }

            /**
             * Выводит выбранный шрифт в консоль (будет изменено).
             * @function
             */

            ,getFont(e) {
                const curr = App.GraphCore.currentWidget;

                if (curr instanceof TextWidget) {
                    curr.fontSettings.fontFamily = $(e.target).data('font').name;
                }
            }

            /**
             * Ссылка на контейнер контента шрифтов. Устанавливается по css-селлектору.
             * @member
             */

            ,container: $('.list-fonts')
        }

        /**
         * TextSettings - Устанавливает настройки текста. Ставит обработчики событий на DOM-объекты настроек.
         * @static
         */

        ,TextSettings: {
            init() {

                //$('.product__editor').append(TemplateFactory.getTextColorHtml());

                this.inputs = {
                    widgetText: $('.editor__text-input'),
                    textSize: $('.size__input'),
                    color: $('#_color__text')
                };

                this.inputs.widgetText.on('input', App.UI.onChangeText);
                this.inputs.textSize.on('input', App.UI.onSize);
                this.inputs.color.on('change', App.UI.onColor);

                (this.btnsStyle = $('.decoration__button')).on('click', App.UI.onStyle);

                (this.btnsAlign = $('.text_align')).on('click', App.UI.onAlign);
            }

            ,setSettings() {
                const curr = App.GraphCore.currentWidget;

                if (curr instanceof TextWidget) {
                    this.inputs.color.css("backgroundColor", curr.color);
                    this.inputs.color.val(curr.color);
                    this.inputs.textSize.val(curr.fontSettings.fontSize);
                    $('.editor__text-input').val(curr.text);
                }
            }

            ,widget: null
            ,textStyle: " "
            ,textAlign: " "
        }

        ,Create: {
            init() {
                this.create = {
                    textWidget: $('.new__text-widget')
                    ,imageWidget: $('.new__image-widget')
                };

                this.create.textWidget.on('click', this.createTextWidget);
                this.create.imageWidget.on('click', this.createImageWidget);
            }

            ,createTextWidget(text) {
                let widget = null;

                if (text.length)
                     widget = TextWidget.getDefault(text);

                else widget = TextWidget.getDefault('Text');

                console.log(widget.text);

                widget.id = App.UI.Layers.addLayer(widget, 'text');

                App.currentProjectVariant.addWidget(widget);
                App.GraphCore.setCurrentWidget(widget);
            }

            ,createImageWidget(e){
                //const data = $('.print-img.selected').data('print');

                let data = { src: 'img/1.png', text: 'collage' };

                if (data) {
                    let widget = ImageWidget.getDefault(data.src);

                    widget.text = data.text;
                    widget.id = App.UI.Layers.addLayer(widget, 'space');

                    App.currentProjectVariant.addWidget(widget);
                    App.GraphCore.setCurrentWidget(widget);
                }
            }
        }

        /**
         * Print - Устанавливает выбор принтов. Ставит обработчики событий на DOM-объекты принтов.
         * @static
         */

        ,Print: {

            init(){
                this.gallery.on('click', App.UI.onSelectPrint);
                this.userPrints.on('click', App.UI.onSelectPrint);

                this.gallery.html(
                    App.Data.Prints.reduce( (acc, print) => acc + TemplateFactory.getPrintHtml(print), `` )
                );

                $.each(this.gallery.children(), (index, child) => {
                    $(child).data('print', App.Data.Prints[index]);
                });

                this.file = $('input[type="file"]');

                this.loadImage = $('.print__send');
                this.file.on('change', App.UI.onLoadImage);

                (this.btnsOptions = $('.pr-opt')).on('click', this.changeGallery);
            }

            ,changeGallery() {
                let $active = $('.pr-opt.active');

                $active.removeClass('active');

                this.classList.add('active');

                if ($(this).hasClass('gallery')) {
                    $('.file-print').removeClass('active');
                    $('.gallery-print').addClass('active');
                } else {
                    $('.file-print').addClass('active');
                    $('.gallery-print').removeClass('active');
                }
            }
            
            ,userPrints: $('.new-print-container')
            ,gallery: $('.container-print')
        }

        ,Layers: {

            init() {
                this.container.data('lastId', 0);

                this.container.html(``);

                // $('.to-top__layer').on('click', this.layerUp);
                // $('.to-bottom__layer').on('click', this.layerDown);

                this.container.on('click', this.layerEvent);

              
            }

            ,addLayer(widget, type) {
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
                }

                widget.layer = layer;

                    this.container.prepend(
                    TemplateFactory.getLayerHtml(layer)
                );

                App.currentProjectVariant.layers.push(layer);

                return lastId;
            }

            ,loadLayers() {
                let widgets = App.currentProjectVariant.widgets;

                this.container.html('');

                widgets.forEach( (widget) => {
                    this.container.prepend(
                        TemplateFactory.getLayerHtml(widget.layer)
                    )
                });
            }

            ,layerEvent(e) {
                console.log(e.target);

                if ($(e.target).hasClass('delete__layer'))
                    App.UI.onDelete(e);

                else if ($(e.target).hasClass('to-top__layer')){
                    App.UI.Layers.layerUp(e);
                    console.log('top')

                } else if ($(e.target).hasClass('to-bottom__layer')) {
                     App.UI.Layers.layerDown(e);
                     console.log('bottom')

                } else {
                    let id = $(e.target).data('id');
                    const curr = App.currentProjectVariant.widgets.find( (widget) => widget.id == id );

                    App.GraphCore.setCurrentWidget(curr);
                }
            }

            ,removeLayer(e) {

                App.UI.onDelete(e);

                // let del = $(e.target).parent().parent(),
                //     id = del.data('id');
                //
                // let curr = App.currentProjectVariant.widgets.find( (w) => w.id == id ),
                //     layer = App.currentProjectVariant.layers.find( (l) => l.id == id );
                //
                // del.remove();
                // //console.log(delIndex, curr.index);
                //
                // App.currentProjectVariant.removeWidget(curr.index);
                // App.currentProjectVariant.removeLayer(layer.index);
                // App.GraphCore.currentWidget = null;
            }

            ,setCurrentLayer(w) {

                $('.layer.selected').removeClass('selected');
                $(`[data-id=${w.id}]`).addClass('selected');

                this.currentLayer = $(`[data-id=${w.id}]`);
            }

            ,setText(text) {
                this.currentLayer.find('.content').text(text);
            }

            ,layerUp(e) {
                console.log('post')
                //if (this.currentLayer) {
                    if ($(e.target).parent().parent().prev().length) {
                        let id = $(e.target).parent().parent().data('id'),
                            curr = App.currentProjectVariant.widgets.find( (w) => w.id == id );
                        App.currentProjectVariant.downWidget(curr.index);

                        $(e.target).parent().parent().insertBefore($(e.target).parent().parent().prev());

                    }
               // }
            }

            ,layerDown(e) {
               // if (this.currentLayer) {
                    if ($(e.target).parent().parent().next().length) {
                        let id = $(e.target).parent().parent().data('id'),
                            curr = App.currentProjectVariant.widgets.find( (w) => w.id == id );

                        App.currentProjectVariant.upWidget(curr.index);

                        $(e.target).parent().parent().insertAfter($(e.target).parent().parent().next());
                    }
                //}
            }

            ,container: $('.layers__list')
            ,currentLayer: null
        }

        ,LightBox: {
            init() {
                this.preview = $('.btn-show-result');

                this.preview.on('click', App.UI.onPreview);
                this.box.on('click', this.closeBlock.bind(this));
            }

            ,closeBlock(e) {
                App.isPreview = false;
                App.UI.leftMenu.removeClass('on-preview');
                App.UI.BaseList.colorContainer.removeClass('on-preview');

                this.preview.removeClass('on-preview');

                App.GraphCore.resetScale(App.GraphCore.ctx);

                // if ($(e.target).hasClass('preview') || $(e.target).hasClass('preview__btn'))
                //     this.box.removeClass('active');
            }

            ,setPreviewImage() {
                App.GraphCore.resetScale();
                App.UI.LightBox.resetPreview();
            }

            ,resetPreview() {
                this.resetPreviewPosition();

                App.GraphCore.RenderList.render(App.GraphCore.ctx);

                // let can = document.createElement('canvas'),
                //     ct = can.getContext('2d');
                //
                // can.width = 800;
                // can.height = 800;
                //
                // ct.putImageData(App.GraphCore.ctx.getImageData(0,0,App.GraphCore.canvas.width*2, App.GraphCore.canvas.height*2), 0 , 0);
                //
                // document.body.appendChild(can);

                this.previewImage.image = new Image();
                this.previewImage.image.src = App.GraphCore.canvas.toDataURL('image/png');
            }

            ,resetPreviewPosition() {
                this.previewImage.position = new Position(0,0);
            }

            ,movePreview(e) {
                let dx = e.offsetX - App.GraphCore.lastX,
                    dy = e.offsetY - App.GraphCore.lastY;

                this.moveBy(dx, dy);

                App.GraphCore.lastX = e.offsetX;
                App.GraphCore.lastY = e.offsetY;
            }

            ,moveBy(dx, dy) {
                let out = this.checkBorder(dx, dy),
                    _scale = App.GraphCore.scale;

                if (out.x)
                    this.previewImage.position.x += dx/(_scale+1);

                if (out.y)
                    this.previewImage.position.y += dy/(_scale+1);
            }

            ,checkBorder(dx, dy) {
                let _x = this.previewImage.position.x + dx,
                    _y = this.previewImage.position.y + dy,
                    _w = App.GraphCore.canvas.width,
                    _h = App.GraphCore.canvas.height,
                    _scale = App.GraphCore.scale,

                    out = {
                        x: true,
                        y: true
                    };

                if (_x + _w < App.GraphCore.canvas.width / 1.5 || _x * (_scale+1) > _w - App.GraphCore.canvas.width / 1.5) {
                    out.x = false;
                }

                if (_y + _h < App.GraphCore.canvas.height / 1.5 || _y * (_scale+1) > _h - App.GraphCore.canvas.height / 1.5) {
                    out.y = false;
                }

                return out;
            }

            ,box: $('.preview')
            ,content: $('.preview__picture img')
            ,previewImage: {
                image: null
                ,position: { x: 0, y: 0 }
            }
        }

        ,Keyboard: {
            init() {
                document.addEventListener('keydown', App.UI.onDelete);
            }
        }

        ,Logos: {
            init() {
                this.workspace.addClass('active');
                this.logo.removeClass('active');
            }

            ,workspace: $('.right-workspace')
            ,logo: $('.workspace-print')
        }

        /**
         * Canvas - Отвечает за обработку событий на холсте.
         * @static
         */

        ,Canvas: {

            init() {
                App.GraphCore.canvas.addEventListener('mousedown', App.GraphCore.mouseDown.bind(App.GraphCore));
                App.GraphCore.canvas.addEventListener('mouseup', App.GraphCore.mouseUp.bind(App.GraphCore));
                App.GraphCore.canvas.addEventListener('mousemove', App.GraphCore.mouseMove.bind(App.GraphCore));
                App.GraphCore.canvas.addEventListener('mousewheel', App.GraphCore.mouseWheel.bind(App.GraphCore));
            }

        }
    }

    /**
     * Data - запрашивает и хранит полученные данные с сервера.
     * @constructor
     */

    ,Data: {

        /**
         * Хранит основы.
         * @member
         */

        Bases: []

        /**
         * Запрашивает основы с сервера (server.json).
         * @function
         */

        ,getBases: async function(){
            const data = await App.Ajax.getJSON("server.json");
            console.log(data);
            this.Bases = data.map((obj) => Base.fromJSON(obj));
        }

        /**
         * Хранит шрифты.
         * @member
         */

        ,Fonts: []

        /**
         * Запрашивает шрифты с сервера (fonts.json).
         * @function
         */

        ,getFonts: async function() {
            const data = await App.Ajax.getJSON('fonts.json');
            this.Fonts = data.fonts.map((obj) => Font.fromJSON(obj));
        }

        ,Prints: []

        ,getPrints: async function() {
            const data = await App.Ajax.getJSON('prints.json');
            this.Prints = data.map( (obj) =>  Print.fromJSON(obj));
        }

        ,loadProject: async function() {
            const project = await App.Ajax.getJSON('/load');
            this.Project = project;
        }

    }

    /**
     * Data - формирует запросы на сервер (ajax), получает данные, предварительно парсит json.
     * @constructor
     */

    ,Ajax:{

        /**
         * Формирует запрос методом GET.
         * @function
         * @param {string} path - путь к серверу.
         */

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

        /**
         * Формирует запрос методом POST (fonts.json).
         * @function
         * @param {string} path - путь к серверу.
         */

        ,postJSON(path, data = null){
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest;
                xhr.open("POST",path, true);
                xhr.onload = () => {
                    resolve(JSON.parse(xhr.responseText));
                }
                xhr.send(data);
                
            });
        }
    }

    /**
     * GraphCore - графическое ядро проекта. Отвечает за отрисовку данных на холсте.
     * @constructor
     */

    ,GraphCore: {

        /**
         * Отрисовывает массив отрисовки.
         */

        init() {
            $('.product__preview').html('<canvas width="400" height="400"></canvas>');

            this.ctx = (this.canvas = document.querySelector('canvas')).getContext('2d');
            this.ctx.save();
        }

        ,findSprite(position) {
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

        ,setDimensions(width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        // ,editText(text) {
        //     const curr = this.currentWidget;
        //
        //     if (curr) {
        //         curr.setText(text);
        //     }
        // }

        ,setCurrentWidget(w){
            if (!w) {
                if (this.currentWidget) {
                    this.currentWidget.isSelected = false;
                    this.currentWidget = null;
                }
            } else {
                if (this.currentWidget)
                    this.currentWidget.isSelected = false;

                this.currentWidget = w;
                this.currentWidget.isSelected = true;
            }

            this.Toolkit.reset();
        }

        ,Toolkit:{
            reset(){
                const curr = App.GraphCore.currentWidget;

                if (curr instanceof TextWidget){
                    this.resetTextToolkit();
                    App.UI.Layers.setCurrentLayer(curr);

                } else if (curr instanceof ImageWidget) {
                    this.resetImageToolkit();
                    App.UI.Layers.setCurrentLayer(curr);
                }
            }

            ,resetTextToolkit(){
                const fontSettings = App.GraphCore.currentWidget.getFontSettings();

                App.UI.TextSettings.setSettings();

                // if (!App.UI.Tabs.customization.layer.hasClass('active'))
                //     App.UI.onText();

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

                switch (fontSettings.alignment) {
                    case FontSettings.Alignment.LEFT:
                        $(".text_align.active").removeClass('active');
                        $("[data-align='left']").addClass('active');
                        break;

                    case FontSettings.Alignment.RIGHT:
                        $(".text_align.active").removeClass('active');
                        $("[data-align='right']").addClass('active');
                        break;

                    case FontSettings.Alignment.CENTER:
                        $(".text_align.active").removeClass('active');
                        $("[data-align='center']").addClass('active');
                        break;
                }
            },

            resetImageToolkit() {
                const curr = App.GraphCore.currentWidget;

                // if (!App.UI.Tabs.customization.layer.hasClass('active'))
                //     App.UI.onPrint();

                $('.print-img.selected').removeClass('selected');
                $(`[name="${curr.text}"]`).addClass('selected');
            }
        }

        ,Filter: {

            colorFilter(ctx, image, color) {
                App.GraphCore.RenderList.clear();
                ctx.drawImage(image,0,0, ctx.canvas.width, ctx.canvas.height);

                var data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.width),
                    currentColor = App.Project.settings.startColor,
                    before = this.hexToRgb(currentColor),
                    after = (color instanceof Array) ? {
                        r: color[0]
                        ,g: color[1]
                        ,b: color[2]
                    } : this.hexToRgb(color);

                for (let i = 0; i<data.data.length; i+=4) {
                    if (data.data[i+3] != 0) {
                        data.data[i] = after.r + data.data[i] - before.r;
                        data.data[i+1] = after.g + data.data[i+1] - before.g;
                        data.data[i+2] = after.b + data.data[i+2] - before.b;
                    }
                }

                ctx.putImageData(data, 0, 0);
                //this.image = ctx.canvas.toDataURL('image/png');
                App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

                App.GraphCore.RenderList.clear();
                return data;
            }

            ,getImageFilterData(ctx, image) {
                console.log('data');
                ctx.drawImage(image,0,0, App.GraphCore.canvas.width, App.GraphCore.canvas.height);
                let data = ctx.getImageData(0, 0, App.GraphCore.canvas.width, App.GraphCore.canvas.height);

                App.currentProjectVariant.variant.filterImage.src = ctx.canvas.toDataURL('image/png');

                App.GraphCore.RenderList.clear();
                return data;
            }

            ,hexToRgb(hex) {
                // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
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

        ,mouseDown(e) {
            if (!App.isPreview) {

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

        ,mouseUp(e) {
            $('body').removeClass('_no-select');
            this.dragged = false;
            this.resized = false;
            this.previewDragged = false;
        }

        ,mouseMove(e) {
            if (!App.isPreview) {

                if (this.resized) {
                    this.resize(e);
                }

                if(this.dragged) {
                    this.move(e);
                }

            } else {

                if (this.previewDragged)
                    App.UI.LightBox.movePreview(e);
            }
        }

        ,mouseWheel(e) {
            if (App.isPreview) {
                this.scales(e);
            }
        }

        ,scales(e) {
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

                //App.UI.LightBox.setPreviewImage();
            }
        }

        ,resetScale() {
            this.ctx.restore();
            this.ctx.save();
            this.scale = 0.25;
        }

        ,resize(e) {
            const curr = this.currentWidget;

            if (curr) {
                let dx = e.offsetX - this.lastX,
                    dsx = e.offsetX - this.realX,
                    dy = e.offsetY - this.lastY,
                    dsy = e.offsetY - this.realY;

                if ($.inArray(this.resizeDirection, App.currentWorkzone.verticalLine.directions) >= 0) {
                    App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(dx, new Position(e.offsetX, e.offsetY), this.resizeDirection));

                } else if ($.inArray(this.resizeDirection, App.currentWorkzone.horizontalLine.directions) >= 0) {
                    if (this.resizeDirection == "upLeft" || this.resizeDirection == "bottomRight") dy = -dy;
                    App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(-dy, new Position(e.offsetX, e.offsetY), this.resizeDirection));
                    //App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(dsx, new Position(e.offsetX, e.offsetY), this.resizeDirection));

                } else {
                    App.UI.TextSettings.inputs.textSize.val(curr.resizeBy(dsx, new Position(e.offsetX, e.offsetY), this.resizeDirection));
                }


                let outX = !App.currentWorkzone.verticalLine.checkSize(new Position(e.offsetX, e.offsetY), this.resizeDirection);
                let outY = !App.currentWorkzone.horizontalLine.checkSize(new Position(e.offsetX, e.offsetY), this.resizeDirection);

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

        ,move(e) {
            const curr = this.currentWidget;

            if (curr) {
                let dx = e.offsetX - this.lastX;
                let dy = e.offsetY - this.lastY;

                curr.moveBy(dx, dy);

                //console.log(curr.position)

                if (!App.currentWorkzone.verticalLine.checkPosition(curr)) {
                    this.lastX = e.offsetX;
                }

                if (!App.currentWorkzone.horizontalLine.checkPosition(curr)) {
                    this.lastY = e.offsetY;
                }

            }
        }

        ,RenderList: {
            items: []

            ,renderPreview(ctx) {
                this.clear();
                ctx.drawImage(App.UI.LightBox.previewImage.image, App.UI.LightBox.previewImage.position.x ,App.UI.LightBox.previewImage.position.y);
            }

            ,render(ctx) {
                this.clear(ctx);

                App.currentProjectVariant.render(ctx);
            }

            ,clear() {
                App.GraphCore.ctx.clearRect(0,0,App.GraphCore.canvas.width, App.GraphCore.canvas.height);
            }

            ,add(object){
                this.items.push(object);
            }
        }

        ,draggable: null
        ,currentWidget: null
        ,dragged: false
        ,resized: false
        ,previewDragged: false

        ,lastX: 0
        ,lastY: 0

        ,realX: 0
        ,realY: 0

        ,scale: 0.25
        ,scaleCount: 0

        ,attached: false
        ,attachedDirection: ""

    }

    ,getProject() {
        let data = this.Data.Project[0],
            project = null;

        if (data) {
            project = new Project(Base.fromJSON(data.base));
            App.currentProjectVariant = project.variants[0];

            //console.log(data.variants[0].widgets);

            project.settings.color = data.settings.color;

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

                    console.log(w.layer);

                    return w;
                });
            });

            project.settings.size = data.settings.size;
            App.GraphCore.setCurrentWidget(App.currentProjectVariant.widgets[App.currentProjectVariant.widgets.length-1]);
        }

        return project;
    }

    ,mechanic() {
        if (!App.isPreview)
            App.GraphCore.RenderList.render(App.GraphCore.ctx);
        else
            App.GraphCore.RenderList.renderPreview(App.GraphCore.ctx);

        requestAnimationFrame(arguments.callee);
    }

    ,currentWidget: null
}

/**
 * Конфигурация модуля requireJS.
 * @global
 */

requirejs.config({
    baseUrl: 'js/Classes/'
});

/**
 * Загрузка скриптов на страницу с помощью модуля requireJS.
 * @global
 */

$('head').append(TemplateFactory.getLinkHtml('./js/css/frontend.css', 'stylesheet'));

requirejs(['Base','BaseVariant','Position','Size','WorkZone','Project','VariantProject','FontSettings','Widget','ProjectSettings'],
    () => {
        requirejs(['TxtWidget','ImageWidget','ComplexWidget', 'Path', 'Font','Print', 'BaseLine',],
            () => {
                requirejs(['VerticalBaseLine', 'HorizontalBaseLine'], () => App.start());
            });
    });



// function loadingScripts() {
//     if (loader < classes.length) {
//         requestAnimationFrame(loadingScripts);

//     } else {
//         const script = document.createElement('script');
//         script.src = 'js/Core.js';

//         document.head.appendChild(script);

//         script.onload = function () {
//             new Core().init();
//         }
//     }
// }

// loadingScripts();

// var convaseSettings;

// var Slider = {
//     init: function(basis){
//         this.onSlideClick(basis);
//     }
//     ,getMainImgSlider: function(){
//         var mainImg = document.querySelector('.workspace img');
//         return mainImg;
//     }
//     ,getAllImgSlider: function(){
//         var allImgs = document.querySelectorAll('.slider-workspace .img-slider img');
//         return allImgs;
//     }
//     ,onSlideClick: function(basis){
//         var slides = this.getAllImgSlider(),
//             mainSlide = this.getMainImgSlider();

//             CanvasController.putImage({src: basis.settings[0].imgPath})

//         slides.forEach((item) => {
//             item.addEventListener('click', (e) => {
//             	CanvasController.putImage({src: e.srcElement.getAttribute('src')})
//                 //mainSlide.src = e.srcElement.getAttribute('src');
//                 //convaseSettings = ConvasSettings.copySettings(basis, mainSlide.getAttribute('src'));
//                 //console.log(convaseSettings);
//             });
//         });
//     }
//     ,setSliderImgs: function(arrayImgs){
//         var container = $('.slider-workspace'),
//             mainSlide = this.getMainImgSlider();
//             templateStr = '';
//         var template = `<din class="img-slider">
//                             <img src="{path}" alt="">
//                         </din>`;
//         //mainSlide.src = arrayImgs[0];
//         if(arrayImgs.length > 1){
//             arrayImgs.forEach((item) => {
//                 var temp
//                 templateStr += template.replace("{path}", item);
//             });
//             container[0].innerHTML = templateStr;
//         } else {
//             container[0].innerHTML = template.replace("{path}", arrayImgs[0]);
//         }
        

        
//     }
// };

// var EditorText = {
//     init: function() {
//         this.connectAllFonts();
//         // this.fillFontEditor();
//         this.onBtnWeightText();
//         this.onBtnCursiveText();
//         this.onBtnUnderlineText();
//         this.onBtnColorText();
//         this.onBtnSizeText();
//         this.onSelectListStyleText();
//         this.onBtnTextPosition();
//     }
//     ,getTextarea: function(){
//         var area = document.querySelector('#text-workspace');
//         // var selectedText = text.value;

//         // if(text.selectionStart != 'undefined' && text.selectionStart != text.value.length){
//         //     var startPos = text.selectionStart;
//         //     var endPos = text.selectionEnd;
//         //     selectedText = text.value.substring(startPos,endPos);
//         // }

//         return area;
//     }
//     ,getBtnColorText: function(){
//         var btn = document.querySelector('.text-decoration .btn-color');
//         return btn;
//     }
//     ,getBtnWeightText: function(){
//         var btn = document.querySelector('.text-decoration .btn-bold');
//         return btn;
//     }
//     ,getBtnCursiveText: function(){
//         var btn = document.querySelector('.text-decoration .btn-cursive');
//         return btn;
//     }
//     ,getBtnUnderlineText: function(){
//         var btn = document.querySelector('.text-decoration .btn-underline');
//         return btn;
//     }
//     ,getBtnSizeText: function(){
//         var btn = document.querySelector('.text-decoration .btn-size');
//         return btn;
//     }
//     ,getAllBtmPositionText: function() {
//         var arrayBtn = document.querySelectorAll('.text-position button');
//         return arrayBtn;
//     }
//     ,getAllFontsText: function() {

//         var arrayFonts = document.querySelectorAll('#style-text option');
//         return arrayFonts;
//     }
//     // ,getBtnTextPositionLeft: function(){
//     //     var btn = document.querySelector('.text-position .btn-text-left');
//     //     return btn;
//     // }
//     // ,getBtnTextPositionCenter: function(){
//     //     var btn = document.querySelector('.text-position .btn-text-center');
//     //     return btn;
//     // }
//     // ,getBtnTextPositionRight: function(){
//     //     var btn = document.querySelector('.text-position .btn-text-right');
//     //     return btn;
//     // }
//     // ,getBtnTextPositionStretch: function(){
//     //     var btn = document.querySelector('.text-position .btn-text-stretch');
//     //     return btn;
//     // }
//     ,onBtnClick: function(btn){

//         var background = btn.style.backgroundColor;

//         if(btn.style.backgroundColor !== 'rgb(221, 221, 221)'){
//             btn.style.backgroundColor = '#ddd';
//         } else {
//             btn.style.backgroundColor = "#fff";
//         }
//     }
//     ,onBtnWeightText: function(){

//         var btn = this.getBtnWeightText();
//         var textArea = this.getTextarea();

//         btn.addEventListener('click', (e) => {
//             this.onBtnClick(btn);
//             if(textArea.style.fontWeight == 'bold'){
//                 textArea.style.fontWeight = '100';
//             } else {
//                 textArea.style.fontWeight = 'bold';                      
//             }
//         });
//     },
//     onBtnCursiveText: function(){

//         var btn = this.getBtnCursiveText();
//         var textArea = this.getTextarea();

//         btn.addEventListener('click', (e) => {
//             this.onBtnClick(btn);
//             if(textArea.style.fontStyle == 'italic'){
//                 textArea.style.fontStyle = 'normal';
//             } else {
//                 textArea.style.fontStyle = 'italic';                      
//             }
//         });
//     }
//     ,onBtnUnderlineText: function(){

//         var btn = this.getBtnUnderlineText();
//         var textArea = this.getTextarea();

//         btn.addEventListener('click', (e) => {
//             this.onBtnClick(btn);
//             if(textArea.style.textDecoration == 'underline'){
//                 textArea.style.textDecoration = 'none';
//             } else {
//                 textArea.style.textDecoration = 'underline';                      
//             }
//         });
//     },
//     onBtnColorText: function(){   

//         var btn = this.getBtnColorText();
//         var textArea = this.getTextarea();

//         btn.addEventListener('input', (e) => {
//             var color = btn.value;
//             // this.onBtmClick(btn);
//            textArea.style.color = color;
//         });
//     }
//     ,onBtnSizeText: function() {

//         var btn = this.getBtnSizeText();
//         var textArea = this.getTextarea();

//         // btn.addEventListener('input', (e) => {
//         //     var size = btn.value;
//         //     textArea.style.fontSize = size + 'px';

//         // });
//     }
//     ,connectAllFonts: function(){
//         var fonts = ServerJSON.getDataFonts(),
//             tempFontFaceString = '';
//         var head = document.body || document.getElementsByTagName('body')[0],
//             style = document.createElement('style');


//         fonts.forEach((item) => {
//             var fontFaceTemplate = `@font-face {
//                 font-family: ${item.name};
//                 src: url(${item.src});
//             }\n`;

//             tempFontFaceString += fontFaceTemplate;
//         });
//         style.type = 'text/css';
//         style.innerHTML = tempFontFaceString;
//         head.appendChild(style);

//         this.fillFontEditor(fonts);
//     }
//     ,fillFontEditor: function(fonts){
//         var listContainer = document.querySelector('.list-fonts'),
//             textArea = this.getTextarea(),
//             tempString = '';


//         fonts.forEach((item) => {
//             var template = `<li style="font-family: ${item.name}">${item.name}</li>`;

//             tempString += template;

//         });

//         listContainer.innerHTML = tempString;

//     }
//     // ,onBtnLeftText: function(){
        
//     //     var btn = this.getBtnTextPositionLeft();
//     //     var textArea = this.getTextarea();

//     //     btn.addEventListener('click', (e) => {
//     //         this.onBtnClick(btn);
//     //         textArea.style.textAlign = 'left';
//     //     });
//     // }
//     // ,onBtnCenterText: function(){
//     //     var btn = this.getBtnTextPositionCenter();
//     //     var textArea = this.getTextarea();

//     //     btn.addEventListener('click', (e) => {
//     //         this.onBtnClick(btn);
//     //         textArea.style.textAlign = 'center';
//     //     });
//     // }
//     // ,onBtnRightText: function(){
//     //     var btn = this.getBtnTextPositionRight();
//     //     var textArea = this.getTextarea();

//     //     btn.addEventListener('click', (e) => {
//     //         this.onBtnClick(btn);
//     //         textArea.style.textAlign = 'right';
//     //     });
//     // }
//     // ,onBtnStretchText: function(){
//     //     var btn = this.getBtnTextPositionStretch();
//     //     var textArea = this.getTextarea();

//     //     btn.addEventListener('click', (e) => {
//     //         this.onBtnClick(btn);
//     //         textArea.style.textAlign = 'justify';
//     //     });
//     // }
//     ,onBtnTextPosition: function(){

//         var arrayBtn = this.getAllBtmPositionText();
//         var textArea = this.getTextarea();
//         var arrayStyleValue = ['left', 'center', 'right', 'justify'];

//         arrayBtn.forEach((item, i) => {
//             item.addEventListener('click', (e) => {
//                 this.clearStyleBtnPositionText();
//                 this.onBtnClick(item);
//                 textArea.style.textAlign = arrayStyleValue[i];
//             });
//         });
//     }
//     ,onSelectListStyleText: function(){

//         var select = document.querySelectorAll('.fonts-text .list-fonts li');
//         var textArea = this.getTextarea();

//         select.forEach(item => {
//             item.addEventListener('click', (e) => {
//                 this.clearListStyle(select);
//                 item.style.background = "rgb(244, 242, 243)";
//             });
//         });
        
//     }
//     ,clearListStyle: function(array){
//         array.forEach((item) => {
//             item.style.background = "none";
//         });
//     }
//     ,clearStyleBtnPositionText: function(){

//         var arrayBtn = this.getAllBtmPositionText();

//         arrayBtn.forEach((item) => {
//             item.style.backgroundColor = "#fff";
//         });
//     }
// };


// var MainMenu = {
//     init: function(){
//         this.onListSettings();
//     }
//     ,getMenuItems: function(){
//         var items = document.querySelectorAll('.main-list-item .list-settings li');
//         return items;
//     }
//     ,clearSelectItem: function(){
//         var items = this.getMenuItems();
//         items.forEach((i) => {
//             i.style.backgroundColor = "#fff";
//         });
//     }
//     ,selectedItem: function(){
//         MainMenu.clearSelectItem();
//         this.style.backgroundColor = "#F4F2F3";
//     }
//     ,getAdditionText: function(){
//         var blockText = document.querySelectorAll('.settings .addition-text');
//         return blockText;
//     }
//     ,getAdditionPrint: function(){
//         var blockPrint = document.querySelectorAll('.settings .addition-print');
//         return blockPrint;
//     }
//     ,getAdditionBasis: function(){
//         var blockPrint = document.querySelectorAll('.settings .addition-basis');
//         return blockPrint;
//     }
//     ,getAllSettingsBlock: function(){
//         var settingBlock = document.querySelectorAll('.settings>div');
//         return settingBlock
//     }
//     ,hideAllSettings: function(){
//         var settings = this.getAllSettingsBlock();
        
//         settings.forEach((item) => {
//             item.classList.remove('displayBlock');
//         });

//     }
//     ,showBlockSetting: function(){
//         this[0].classList.add('displayBlock');
//     }
//     ,onListSettings: function(){
//         var list = this.getMenuItems(),
//             print = this.getAdditionPrint(),
//             text = this.getAdditionText(),
//             basis = this.getAdditionBasis();
        
//         list.forEach((item) => {
//             item.addEventListener('click', (e) => {
//                 this.hideAllSettings();
//                 this.selectedItem.call(item);
//                 e.preventDefault();
//                 if(item.className == "basis-set"){
//                     this.showBlockSetting.call(basis);
//                 } else if(item.className == "text-set") {
//                     this.showBlockSetting.call(text);
//                     EditorText.init();
//                 }else if(item.className == "print-set") {
//                     this.showBlockSetting.call(print);
//                     PrintMenu.init();
//                 }
//             });
//         });
//     }
// };


// var PrintMenu = {
//     init: function(){
//         var startTab = this.getTabGallery();
//         this.startSettingsTabs();  
//         this.onListPrint();

//     }
//     ,startSettingsTabs: function() {
//         this.selectedList.call(this.getAllList()[0]);
//         this.showTabPrint.call(this.getTabGallery());
//         this.hideTabPrint.call(this.getTabFile());
//     }
//     ,getAllList: function() {
//         var list = document.querySelectorAll('.editor-print .controller-print li');
//         return list;
//     }
//     ,clearSelectList: function(){
//         var items = this.getAllList();
//         items.forEach((i) => {
//             i.style.backgroundColor = "#fff";
//         });
//     }
//     ,selectedList: function(){
//         PrintMenu.clearSelectList();
//         this.style.backgroundColor = "#F4F2F3";
//     }
//     ,getTabGallery: function(){
//         var tab = document.querySelector('.editor-print .gallery-print');
//         return tab;
//     }
//     ,getTabFile: function(){
//         var tab = document.querySelector('.editor-print .file-print');
//         return tab;
//     }
//     ,hideTabPrint: function(){
//         this.style.display = "none";
//     }
//     ,showTabPrint: function(){
//         this.style.display = "flex";
//     }

//     ,onListPrint: function(){
//         var list = this.getAllList();

//         list.forEach((item) => {
//             item.addEventListener('click', (e) => {
//                 this.selectedList.call(item);
//                 if(item.className == "pr-gal"){
//                     this.hideTabPrint.call(this.getTabFile());
//                     this.showTabPrint.call(this.getTabGallery());
//                 } else if(item.className == "pr-file"){
//                     this.hideTabPrint.call(this.getTabGallery());
//                     this.showTabPrint.call(this.getTabFile());
//                 }
//             });
//         })
//     }
// };

// function onBtnBuy() {
//     var btnPay = document.querySelector('.btn-buy'),
//         payDialog = document.querySelector('.dialog-pay');

//     btnPay.addEventListener('click', (e) => {
//         payDialog.style.display = "block";
//     });
// }

// var PayForm = {
//     init : function(){
//         this.onBtnCancel();
//     }
//     ,getPayDialog : function(){
//         var payDialog = document.querySelector('.dialog-pay');
//         return payDialog;
//     }
//     ,onBtnCancel: function(){
//         var btnCancel = document.querySelector('.pay-cancel');
//         btnCancel.addEventListener('click', (e) => {
//             this.getPayDialog().style.display = "none";
//         });
//     }
//     ,setPrice: function(costs){
//         var price = document.querySelector('.price .costs p:last-child');
        
//         price.innerHTML = costs + "p";
//     }
// }



// /** 
//  * Just run npm install http-server -g 
//  * and you will be able to use it in terminal 
//  * like http-server C:\location\to\app.
// **/



// var ServerJSON = {
//     getData: function(){
//         var data =  $.ajax({
//             type: 'GET',
//             url: 'server.json',
//             dataType: 'json',
//             success: function() { },
//             data: {},
//             async: false
//         });
        
//         return data.responseJSON;
//     },
//     getDataFonts: function(){
//         var data =  $.ajax({
//             type: 'GET',
//             url: 'fonts.json',
//             dataType: 'json',
//             success: function() { },
//             data: {},
//             async: false
//         });
        
//         return data.responseJSON.fonts;
//     },
//     sendData: function(info){
//         var data = $.ajax({
//             type: 'POST',
//             url: 'server.json',
//             dataType: 'json',
//             success: function() { },
//             data: {url: JSON.stringify(info)},
//             async: false
//         });
//     }
// };


// var Basis = {
//     init: function(){
//         var data = ServerJSON.getData();

//         this.fillBasisList(data);
//         this.onBasis(data);
//     }
//     ,fillBasisList: function(data) {
//         var basis = Object.keys(data);
//         var container = $('.basis-gallery');
//         var template = `<div data-basis="{basis}" class="basis-img">\
//                             <img src="{path}" alt="">\
//                         </div>`;
//         var arrayPath = [],
//             templatesString = '';

//         basis.forEach((item) => {
//             var temp = template.replace("{basis}", item);
//             templatesString += temp.replace("{path}", data[item].sliderImgs[0]);
//         });

//         container[0].innerHTML = templatesString;
            
//     }
//     ,getBasisList: function() {
//         var list = document.querySelectorAll('.basis-gallery .basis-img');
//         return list;
//     }
//     ,onBasis: function(data) {
//         var listBasis = this.getBasisList(),
//             workspace = Slider.getMainImgSlider();

//         listBasis.forEach((item) => {
//             item.addEventListener('click', (e) => {
//                 this.clearBasis(listBasis);
//                 var basis = item.getAttribute('data-basis');
//                 item.style.background= "#eee";
                
//                 $('.price').show();
//                 Slider.setSliderImgs(data[basis].sliderImgs);
//                 Slider.init(data[basis]);
//                 //convaseSettings = ConvasSettings.copySettings(data[basis], workspace.getAttribute('src'));
//                 //console.log(convaseSettings);
//                 PayForm.setPrice(data[basis].price);
                
//             });
//         });
//     }
//     ,clearBasis: function(list){
//         var settings = "none";
//         list.forEach(item => {
//             item.style.background = settings; 
//         });
//     }
// }

// var ConvasSettings = {
    
//     copySettings: function(basis, currentSrc){
//         var settings = basis.settings,
//             copy = {};
//         var conSettings = {};    
//         settings.forEach((item, i) => {
//             for(var key in item){
//                 if(item[key] == currentSrc){
//                     copy = item;
//                 }
//             }
//         });

//         return copy;
//     }
//     ,currentSettings: function(obj){

//     }
// };

// var CanvasController = {

// 	init: function() {
// 		this.ctx = (this.canvas = document.querySelector('.workspace canvas')).getContext("2d");
// 		this.virtCtx = (this.virtCanvas = document.createElement('canvas')).getContext("2d");
// 	},

// 	setDimentions: function() {
// 		this.canvas.width = window.innerWidth / 3;
// 		this.canvas.height = 0;

// 		this.height = this.canvas.height;
// 		this.width = this.canvas.width;
// 	},

// 	putImage: function() {
// 		if (arguments.length == 0 ) {
// 			this.clear();

// 			return this;

// 		} else if (arguments.length == 1 && typeof arguments[0] != "string") {
			
// 			this.image = new Image();
			
// 			let obj = arguments[0];

// 			this.image.src = obj.src;

// 			this.image.onload = () => {

// 				this.height = this.canvas.height = this.image.height/(this.image.width/this.width)

// 				this.image.height = this.height;
// 				this.image.width = this.width;

// 				this.ctx.drawImage(this.image, 0 , 0, this.width, this.height);



// 				// let data = this.virtCtx.getImageData(0,0,this.width,this.height);

// 				// this.ctx.putImageData(data, 0 ,0);
// 			}
// 		}
//     },
    

//     recount: function() {
// 		this.setDimentions(); 
// 	},

// 	render: function() {
// 		this.height = this.canvas.height = this.image.height/(this.image.width/this.width)

// 		this.image.height = this.height;
// 		this.image.width = this.width;

// 		this.clear();

// 		this.ctx.drawImage(this.image, 0 , 0, this.width, this.height);
// 	},

// 	clear: function() {
// 		this.ctx.fillStyle = "#FFFFFF";
// 		this.ctx.fillRect(0,0,this.width,this.height);

// 		return this;
// 	},

// 	onResize: function() {
// 		this.recount();
// 		this.render();

// 		console.log(window.innerWidth)
// 	}

// }


// window.onload = function(){
//     var arr = [
//            {"name": "Вася", "age": 20},
//            {"name": "Петя", "age": 22},
//            {"name": "Таня", "age": 18}
//     ];        

//     CanvasController.init();
//     CanvasController.setDimentions();

//     document.querySelector("body").onresize = () => { CanvasController.onResize(CanvasController); }

//     MainMenu.init();
//     PayForm.init();
//     Basis.init();
//     onBtnBuy();
//     // ServerJSON.sendData(arr);
// }