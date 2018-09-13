AdminApp = {
    init() {
        this.panelPageList = $('.panel__page-list.fonts');

        $('.panel__font-form').on('submit', this.uploadFont);
        $('input[type="file"][name="font_file"]').on('change', this.updateFile);
        this.panelPageList.on('click', this.onFontsPage);
        //$('.panel__font-delete').on('click', this.deleteFile);

        this.fontsPanel = $('.panel__font-list');
        this.fontsPanel.on('click', this.onEvent);

        this.font_print = $('input[name="font_print"]');
        this.font_fancywork = $('input[name="font_fancywork"]');
        this.font_3D = $('input[name="font_3D"]');

        this.fontPage = 1;

        this.style = $('[name="FONTS_FACES"]');

        this.loadingPage = false;

        this.font_print.on('click', this.checkPrint.bind(this));
        this.font_fancywork.on('click', this.checkPrint.bind(this));
        this.font_3D.on('click', this.checkPrint.bind(this));


        this.getFonts(1);

        this.UI.init();
        this.BaseList.init();
        this.BasePanel.init();
        this.TemplatePanel.init();
        //this.TemplatesList.init();
        this.TemplatesUI.init();
        this.PrintsList.init();
        this.PrintRedactor.init();
        this.OrdersList.init();
        this.OrderUI.init();

        console.log('AdminPanel init');
    }

    ,makeid(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    ,onEvent(e) {
        if ($(e.target).hasClass('panel__font-delete')) {
            AdminApp.deleteFile(e);
        }
    }

    ,onFontsPage(e) {
        if ($(e.target).hasClass('panel__page-point')) {
            let page = parseInt($(e.target).text());

            AdminApp.fontPage = page;

            AdminApp.panelPageList.children('.selected').removeClass('selected');
            $(e.target).addClass('selected');

            AdminApp.fontsPanel.addClass('loading');

            AdminApp.loadFontsPage(page, (data) => {
                AdminApp.fontsPanel.removeClass('loading');

                let top = AdminApp.fontsPanel.offset().top;
                $('body, html').animate( {scrollTop: top}, 1000 );
            });
        }

    }

    ,checkPrint(e) {
        const target = $(e.target);

        if (!$('input[name="font_print"]').prop('checked') && !$('input[name="font_fancywork"]').prop('checked')) {
            this.font_3D.prop('checked', true);
        }

        if (!$('input[name="font_print"]').prop('checked') && !$('input[name="font_3D"]').prop('checked')) {
            this.font_fancywork.prop('checked', true);
        }

        if (!$('input[name="font_3D"]').prop('checked') && !$('input[name="font_fancywork"]').prop('checked')) {
            this.font_print.prop('checked', true);
        }

    }

    ,uploadFont(e) {
        e.preventDefault();

        if (!document.querySelector('input[name="font_file"]').files.length) {
            alert('Choose any font file! (.otf, .ttf)');
            return;
        }

        $('.panel__font-form').addClass('loading')

        Admin.uploadFont(() => {

            let page = parseInt($('.panel__page-point.selected span').text());

            AdminApp.fontsPanel.addClass('loading');

            AdminApp.loadFontsPage(1, (data) => {
                AdminApp.fontsPanel.removeClass('loading');
                AdminApp.resetUpload();
            });

        });
    }

    ,getFonts(page, callback) {
        if (typeof page != 'number') page = 1;
        this.setPreloader();

        User.Ajax.get(`/fonts?page=${page}`, (data) => {

            data = JSON.parse(data);

            this.setPagesCount(data.pages);
            this.setFontsHtml(data.fonts, callback);
        });
    }

    ,resetUpload() {
        $('input[name="font"]').val('');

        $('input[type="file"][name="font_file"]').val('');
        $('input[type="file"][name="font_file"]')[0].dataset.after = "Выберите файл";
        // $('input[name="font"]').after(TemplateFactory.getAdminPanelFontFileInput());
        // $('input[type="file"]').on('change', this.updateFile);

        $('.panel__font-form').removeClass('loading');
    }

    ,setPagesCount(pages) {
        let inner = "";

        for (let i = 1; i <= pages; i++) {
            inner += TemplateFactory.getAdminPanelPages(i);
        }

        AdminApp.panelPageList.html(inner);
        AdminApp.panelPageList.children(`:nth-child(${AdminApp.fontPage})`).addClass('selected');
    }

    ,setFontsHtml(fonts, callback) {
        const children = [];

        fonts.forEach( font => {
            const child = $(TemplateFactory.getAdminPanelFontshtml(font));
            children.push(child);

            App.UI.FontsList.checkFont(font);
        });

        this.fontsPanel.html('');
        children.forEach( ch => this.fontsPanel.append(ch));

        // this.style.html(
        //     fonts.reduce( (acc, font) => acc + TemplateFactory.getFontStyle(font), ``)
        // );

        //$('head').append(this.style);

        // console.log('styled')

        if (callback) callback(fonts);
    }

    ,setPreloader() {
        this.fontsPanel.html('');
        this.fontsPanel.append(TemplateFactory.getPreloader());
    }

    ,updateFile() {
        if (this.files[0].name.indexOf('.ttf') >= 0 || this.files[0].name.indexOf('.otf') >= 0) {
            this.dataset.after = this.files[0].name;
        } else {
            $('input[type="file"][name="font_file"]').val('');
            alert('Only .otf and .ttf files allowed');
        }
    }

    ,loadFontsPage(page, callback) {
        if (typeof page != 'number') page = 1;

        AdminApp.getFonts(page, callback);
    }

    ,deleteFile(e) {
        User.Ajax.get(`/delete?type=${$(e.target).parent().data('type')}&src=${$(e.target).data('src')}`, (data) => {
            AdminApp.fontsPanel.addClass('loading');

            let page = parseInt($('.panel__page-point.selected span').text());

            AdminApp.loadFontsPage(1, () => {
                AdminApp.fontsPanel.removeClass('loading');
                AdminApp.resetUpload();
            });
        });
    }

    ,UI: {
        init() {
            this.menu.on('click', this.selectPanels)
        }

        ,selectPanels(e) {
            if ($(e.target).hasClass('baseUI') || $(e.target).hasClass('basis_back')) {
                $('.panel__card').removeClass('active');
                AdminApp.BaseList.openPanel();
            }

            if ($(e.target).hasClass('fontsUI')){
                $('.panel__card').removeClass('active');
                $('.panel__card.fonts__panel').addClass('active');

                AdminApp.loadFontsPage();
            }

            if ($(e.target).hasClass('templateUI')) {
                $('.panel__card').removeClass('active');
                AdminApp.TemplatesList.loadTemplates();
                AdminApp.TemplatesList.panel.addClass('active');
            }

            if ($(e.target).hasClass('printUI')) {
                $('.panel__card').removeClass('active');
                AdminApp.PrintsList.loadPanel();
            }

            if ($(e.target).hasClass('ordersUI')) {
                $('.panel__card').removeClass('active');
                AdminApp.OrdersList.loadPanel();
            }

            AdminApp.UI.menu_point.removeClass('active');
            $(e.target).addClass('active');
        }

        ,menu: $('.menu__list')
        ,menu_point: $('.menu__point')

    }

    ,FontsPanel: {

    }

    ,BasePanel: {
        init() {

            this.upload_base_variant.on('change', this.onLoadVariant);
            this.main_file.on('change', this.onLoadVariant);
            this.variants.on('click', this.checkVariantEvent);
            this.size.on('click', this.checkSizeEvent);

            this.colorInputs.on('input', this.checkColorInputs.bind(this));
            this.colorAdd.on('click', this.checkAddColorEvent.bind(this));
            this.colorContainer.on('click', this.checkRemoveColorEvent.bind(this));

            this.workzoneInputs = {
                x: $('input[name="workzone_x"]')
                ,y: $('input[name="workzone_y"]')
                ,width: $('input[name="workzone_width"]')
                ,height: $('input[name="workzone_height"]')
            }

            this.inputs = {
                name: $('input[name="base_name"]')
                ,price: $('input[name="base_price"]')
                ,print: $('input[name="base_print"]')
                ,fancywork: $('input[name="base_fancywork"]')
                ,size: $('input[name="base_size"]')
                ,type: $('select[name="base_type"]')
                ,_3D: $('input[name="base_3D"]')
            }

            this.inputs.print.on('change', this.setPrintType);
            this.inputs.fancywork.on('change', this.setPrintType);
            this.inputs._3D.on('change', this.setPrintType);
            this.inputs.price.on('input', this.checkPrice.bind(this));

            $('.base__add .add-size').on('click', this.addSize);
            $('.add-basis-upload').on('click', this.sendData);

            this.workzoneInputs.x.on('input', this.updateWorkzone);
            this.workzoneInputs.y.on('input', this.updateWorkzone);
            this.workzoneInputs.width.on('input', this.updateWorkzone);
            this.workzoneInputs.height.on('input', this.updateWorkzone);

            this.canvas.addEventListener('mousedown', this.setWorkzonePoint);
            this.canvas.addEventListener('mousemove', this.setWorkzoneSize);

            this.ctx = this.canvas.getContext('2d');
            //this.ctx.translate(0.5, 0.5);

            this.clearInputs();

            this.renderWorkzone();
        }

        ,checkPrice(e) {
            const target = $(e.target);
            let value = parseInt(target.val());

            if (isNaN(value)) {
                value = "";
                this.setPrice(value);

                return;
            }

            if (value < 0) {
                value = Math.abs(value);
                this.setPrice(value);

                return;
            }

            this.setPrice(value);
        }

        ,checkColorInputs(e) {
            const target = $(e.target);
            let value = target.val();

            if (isNaN(parseInt(value)) || value <= 0) {
                value = "";
                this.setInputValue(target, value);

                return;
            }

            if (value > 255) {
                value = 255;
                this.setInputValue(target, value);

                return;
            }

            this.setInputValue(target, value);
        }

        ,checkAddColorEvent(e) {
            const target = $(e.target),
                rgb = {
                    r: this.colorInputs.eq(0).val() || 0,
                    g: this.colorInputs.eq(1).val() || 0,
                    b: this.colorInputs.eq(2).val() || 0,
                },
                color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;

            this.addBaseColor(color);
            //TODO need to create addColor method and extend endpoint with constructor app
            console.log('waiting..');
        }

        ,checkRemoveColorEvent(e) {
            const target = $(e.target);

            target.remove();
        }

        ,addBaseColor(color) {
            this.colorContainer.append(TemplateFactory.getAdminPanelBaseColorHtml(color));
        }

        ,setInputValue(input, val) {
            input.val(val);
        }

        ,sendData() {
            let files = AdminApp.BasePanel.files,
                name = AdminApp.BasePanel.inputs.name.val(),
                price = AdminApp.BasePanel.inputs.price.val(),
                print = "",
                data = new FormData();

            if (AdminApp.BasePanel.variants.children().length && name.length && price.length) {
                $.each(AdminApp.BasePanel.size.children(), (index, child) => {
                    data.append('size', $(child).data('size'));
                });

                if(!data.get('size')) {
                    data.append('size', []);
                }

                $.each(AdminApp.BasePanel.variants.children(), (index, child) => {
                    if (!$(child).hasClass('panel__uploaded-pic-add')) {

                        let info = { width: 0, height: 0, workzone: null, main: false };

                        info.width = $(child).data('size').width;
                        info.height = $(child).data('size').height;
                        info.workzone = $(child).data('workzone');

                        let _x = info.workzone.x,
                            _y = info.workzone.y,
                            _width = info.workzone.width,
                            _height = info.workzone.height,
                            _int_w = info.width/AdminApp.BasePanel.canvas.width,
                            _int_h = info.height/AdminApp.BasePanel.canvas.height;

                        info.workzone.x *= _int_w;
                        info.workzone.y *= _int_h;
                        info.workzone.width *= _int_w;
                        info.workzone.height *= _int_h;

                        ($(child).hasClass('first_all')) ? info.main = true : info.main = false;

                        data.append(index, $(child).data('file'));
                        data.append(index, JSON.stringify(info));

                        info.workzone.x = _x;
                        info.workzone.y = _y;
                        info.workzone.width = _width;
                        info.workzone.height = _height;
                    }
                });

                if (!AdminApp.BasePanel._id.length) AdminApp.BasePanel._id = AdminApp.BasePanel.makeid();

                $.each(AdminApp.BasePanel.colorContainer.children(), (index, ch) => {
                    data.append('colors', ch.dataset.color);
                });

                data.append('name', name);
                data.append('price', price);
                data.append('type', AdminApp.BasePanel.inputs.type.val());
                data.append('print', AdminApp.BasePanel.inputs.print.prop('checked'));
                data.append('fancywork', AdminApp.BasePanel.inputs.fancywork.prop('checked'));
                data.append('_3D', AdminApp.BasePanel.inputs._3D.prop('checked'));
                data.append('_id', AdminApp.BasePanel._id);
                //data.append('redact', AdminApp.BasePanel.redact || false);
                AdminApp.BasePanel.panel.addClass('loading');

                User.Ajax.post('/upload'+AdminApp.BasePanel.redact, data, (data) => {
                    AdminApp.BasePanel.panel.removeClass('loading');
                    AdminApp.BasePanel.redact = '/redact';

                    AdminApp.BasePanel.parseData((JSON.parse(data)).base);                    
                });
            }

        }

       ,makeid() {
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for (var i = 0; i < 17; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

          return text;
        }

        ,loadData() {
            AdminApp.BasePanel.panel.addClass('loading');

            User.Ajax.get('/bases', (data) => {
                AdminApp.BasePanel.parseData(JSON.parse(data)[0]);
                AdminApp.BasePanel.panel.removeClass('loading');

            });
        }

        ,parseData(data) {
            let base = data,
                main = null;

            AdminApp.BasePanel.clearInputs();

            AdminApp.BasePanel.redact = '/redact';
            AdminApp.BasePanel._id = base._id;

            AdminApp.BasePanel.inputs.name.val(base.name);
            AdminApp.BasePanel.inputs.price.val(base.price);

            let options = AdminApp.BasePanel.inputs.type[0].options,
                print = base.print;

            AdminApp.BasePanel.inputs.print.prop('checked', (base.print == "true") ? true : false);
            AdminApp.BasePanel.inputs.fancywork.prop('checked', (base.fancywork == "true") ? true : false);
            AdminApp.BasePanel.inputs._3D.prop('checked', (base._3D == "true") ? true : false);

            $.each(options, (index, option) => {
                if (option.value == base.value) {
                    AdminApp.BasePanel.inputs.type[0].options[index].selected = 'selected';
                    return;
                }
            });

            AdminApp.BasePanel.size.html(
                base.size.reduce( (acc, size) => acc + TemplateFactory.getAdminPanelSizeHtml(size), ``)
            );

            $.each(AdminApp.BasePanel.size.children(), (index, child) => {
                $(child).data('size', base.size[index]);
            });

            data.colorArray = data.colorArray || [];

            AdminApp.BasePanel.colorContainer.html(
                data.colorArray.reduce( (acc, color) => acc + TemplateFactory.getAdminPanelBaseColorHtml(color), ``)
            );

            AdminApp.BasePanel.fileCount = base.variants.length;

            base.variants.forEach( (variant, index) => {
                fetch(variant.image).then( data => data.blob() ).then( (blob) => {
                    let file = new File([blob], variant.image.replace(/[a-zA-Z0-9\.\-\_\\]+\//g, ""), { type: blob.type, size: blob.size });

                    AdminApp.BasePanel.checkFileSpace();

                    let child = AdminApp.BasePanel.addVariant(variant.image, file),
                        _int_w = variant.width/AdminApp.BasePanel.canvas.width,
                        _int_h = variant.height/AdminApp.BasePanel.canvas.height;

                    variant.workzone.x /= _int_w;
                    variant.workzone.y /= _int_h;
                    variant.workzone.width /= _int_w;
                    variant.workzone.height /= _int_h;

                    child.data('workzone', variant.workzone);

                    if (variant.main) main = child;
                    if (main) AdminApp.BasePanel.setMainVariant(main);
                });
            });

            // data.forEach( (base, index) => {
            //     AdminApp.BasePanel.inputs.name.val(base.name);
            //     AdminApp.BasePanel.inputs.price.val(base.price);
            //     AdminApp.BasePanel.inputs.type.val(base.type);
            //
            //     AdminApp.BasePanel.size.html(
            //         base.size.reduce( (acc, size) => acc + TemplateFactory.getAdminPanelSizeHtml(size), ``)
            //     );
            //
            //     $.each(AdminApp.BasePanel.size.children(), (index, child) => {
            //         $(child).data('size', base.size[index]);
            //     });
            //
            //     base.variants
            //
            // });
        }

        ,checkVariantEvent(e) {
            if ($(e.target).hasClass('panel__uploaded-remove')) {
                AdminApp.BasePanel.onDeleteVariant(e);
            } else if($(e.target).parent().hasClass('panel__uploaded-pic')) {
                AdminApp.BasePanel.setMainVariant($(e.target).parent());
            }
        }

        ,checkSizeEvent(e) {
            if ($(e.target).hasClass('size-container__close')) {
                $(e.target).parent().remove();
            }
        }

        ,onLoadVariant() {
            let file = this.files[0],
                reader = new FileReader();

            this.value = '';

            if (!file) {
                return;
            }

            if (file.name.indexOf('.png') >= 0) {

                reader.onload = (e) => {
                    AdminApp.BasePanel.fileCount++;
                    AdminApp.BasePanel.checkFileSpace();
                    AdminApp.BasePanel.addVariant(e.target.result, file);
                }

                reader.readAsDataURL(file);
                AdminApp.BasePanel.main_variant.addClass('active');

                return;
            }

            alert('Only .png files accepted!');
        }

        ,onDeleteVariant(e) {
            let _delete = $(e.target).parent();
            this.fileCount--;

            if (_delete.hasClass('first_all')) {
                let child = this.variants.children()[0];
                this.setMainVariant($(child));
            }

            _delete.remove();
            this.checkFileSpace();
        }

        ,addVariant(src, file) {
            let child = $(TemplateFactory.getAdminPanelBaseVariantHtml(src)),
                image = new Image();
                size = { width: 0, height: 0 };

            image.src = src;

            child.data('index', this.fileCount - 1);
            child.data('file', file);
            child.data('workzone', { x: 0, y: 0, width: 0, height: 0 });

            image.onload = () => {
                size.width = CANVAS_WIDTH;
                size.height = Math.round(size.width * (image.height/image.width));
                size.int = image.height/image.width;

                child.data('size', size);
            }

            this.setMainVariant(child);
            this.variants.prepend(child);

            child.data('index', this.variants.length);

            return child;
        }

        ,setMainVariant(node) {
            $('.panel__uploaded-pic.first_all').removeClass('first_all');
            node.addClass('first_all');
            this.currVariant = node;
            this.currWorkzone = node.data('workzone');

            this.main_variant.addClass('active');
            this.main_variant_image.attr('src', node.find('img').attr('src'));
        }

        ,setPrice(price) {
            this.inputs.price.val(price || 0);
        }

        ,checkFileSpace() {
            if (this.fileCount >= 4) {
                this.upload_base_variant.addClass('inactive');
            } else if (this.fileCount <= 0) {
                this.upload_base_variant.addClass('inactive');
                this.main_variant.removeClass('active');
            } else if (this.fileCount <= 3) {
                this.upload_base_variant.removeClass('inactive');
            }
        }

        ,addSize(e) {
            let size = (AdminApp.BasePanel.inputs.size.val()).replace(/[ ]+/, ""),
                child = $(TemplateFactory.getAdminPanelSizeHtml(size));

            if (size.length) {
                child.data('size', size);
                AdminApp.BasePanel.size.append(child);
            }
        }

        ,setPrintType(e) {
            if (!$('input[name="base_print"]').prop('checked') && !$('input[name="base_fancywork"]').prop('checked')) {
                AdminApp.BasePanel.inputs._3D.prop('checked', true);
            }

            if (!$('input[name="base_print"]').prop('checked') && !$('input[name="base_3D"]').prop('checked')) {
                AdminApp.BasePanel.inputs.fancywork.prop('checked', true);
            }

            if (!$('input[name="base_3D"]').prop('checked') && !$('input[name="base_fancywork"]').prop('checked')) {
                AdminApp.BasePanel.inputs.print.prop('checked', true);
            }
        }

        ,setWorkzonePoint(e) {
            if (!AdminApp.BasePanel.workzoneResizing) {
                AdminApp.BasePanel.currWorkzone.x = e.offsetX;
                AdminApp.BasePanel.currWorkzone.y = e.offsetY;

                AdminApp.BasePanel.currWorkzone.width = 0;
                AdminApp.BasePanel.currWorkzone.height = 0;
            }

            AdminApp.BasePanel.workzoneResizing = !AdminApp.BasePanel.workzoneResizing;
        }

        ,setWorkzoneSize(e) {
            if (AdminApp.BasePanel.workzoneResizing) {
                let _x = e.offsetX,
                    _y = e.offsetY,
                    width = e.offsetX - AdminApp.BasePanel.currWorkzone.x,
                    height = e.offsetY - AdminApp.BasePanel.currWorkzone.y;

                if (width < 0) {
                    width = 1;
                }

                if (height < 0) {
                    height = 1;
                }

                AdminApp.BasePanel.currWorkzone.width = width;
                AdminApp.BasePanel.currWorkzone.height = height;
            }
        }

        ,updateInputs() {
            this.workzoneInputs.x.val(this.currWorkzone.x);
            this.workzoneInputs.y.val(this.currWorkzone.y);
            this.workzoneInputs.width.val(this.currWorkzone.width);
            this.workzoneInputs.height.val(this.currWorkzone.height);
        }

        ,updateWorkzone() {
            AdminApp.BasePanel.currWorkzone.x = parseInt(AdminApp.BasePanel.workzoneInputs.x.val());
            AdminApp.BasePanel.currWorkzone.y = parseInt(AdminApp.BasePanel.workzoneInputs.y.val());
            AdminApp.BasePanel.currWorkzone.width = parseInt(AdminApp.BasePanel.workzoneInputs.width.val());
            AdminApp.BasePanel.currWorkzone.height = parseInt(AdminApp.BasePanel.workzoneInputs.height.val());
        }

        ,renderWorkzone() {
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            this.ctx.strokeRect(this.currWorkzone.x, this.currWorkzone.y, this.currWorkzone.width, this.currWorkzone.height);

            this.updateInputs();
            requestAnimationFrame(this.renderWorkzone.bind(this));
        }

        ,clearInputs() {
            this.redact = "";
            this._id = "";

            this.variants.html(this.upload_base_variant);
            this.size.html(``);

            this.main_variant.removeClass('active');

            this.main_file.attr('type', "");
            this.main_file.attr('type', "file");

            this.currVariant = null;
            this.currWorkzone = { x: 0, y: 0, width: 0, height: 0 };
            this.workzoneResizing = false;
            this.main_variant_image.attr('src', "");

            this.fileCount = 0;
            this.checkFileSpace();

            this.inputs.print.prop('checked', true);
            this.inputs.fancywork.prop('checked', true);
            this.inputs.type[0].options[0].selected = "selected";
            this.inputs.name.val("");
            this.inputs.price.val("");
        }

        ,panel: $('.base__add')
        ,variants: $('.panel__container-picture')
        ,main_file: $('#new-basis')
        ,main_variant: $('.panel__main-variant')
        ,main_variant_image: $('.panel__main-variant img')
        ,upload_base_variant: $('.panel__uploaded-pic-add')
        ,fileCount: 0
        ,currVariant: null
        ,currWorkzone: { x: 0, y: 0, width: 0, height: 0 }
        ,workzoneResizing: false
        ,canvas: document.querySelector('.panel__main-variant canvas')
        ,size: $('.base__add .panel__size-container')
        ,colorInputs: $('[name="baseColorInput_base"]')
        ,colorAdd: $('[name="baseAddColor_base"]')
        ,colorContainer: $('[name="baseColorsContainer_colors"]')
    }

    ,BaseList: {
        init() {
            this.loadBases(1, this.loadFinishing);

            this.template_on.on('click', this.changeConf.bind(this));
            this.list.on('click', this.checkBaseListEvent);
            $('.button__add-basis').on('click', this.checkBaseListEvent);

            this.pages.on('click', this.loadBasesPage);

        }

        ,openPanel() {
            this.loadBases(1, this.loadFinishing);
            this.panel.addClass('active');
        }

        ,loadBases(page = 1, callback) {
            this.list.addClass('loading');

            this.getBases(page, callback);
        }

        ,loadBasesPage(e) {
            if ($(e.target).hasClass('panel__page-point')) {
                let page = $(e.target).data('page');

                AdminApp.BaseList.loadBases(page, (data) => {
                    AdminApp.BaseList.loadFinishing(data);

                   // $('.panel__page-point.selected').removeClass('selected');
                    AdminApp.BaseList.pages.children().removeClass('selected');
                    AdminApp.BaseList.pages.children(":nth-child("+page+")").addClass('selected');
                    AdminApp.BaseList.pages.css('transform', `translateX(-${44 * (page - 1)}px)`);
                });
            }
        }

        ,loadFinishing(data) {
            AdminApp.BaseList.list.removeClass('loading');

            let bases = JSON.parse(data);

            AdminApp.BaseList.setBaseListHtml(bases.bases);
            AdminApp.BaseList.setBasePagesHtml(bases.pages);
        }

        ,getBases(page = 1, callback) {
            AdminApp.BaseList.setPreloader();

            User.Ajax.get('/bases?page='+page, callback);
        }

        ,checkBaseListEvent(e) {
            if ($(e.target).hasClass('panel__basis-edit')) {
                AdminApp.BaseList.redactBase(e);
            }

            if ($(e.target).hasClass('button__add-basis')) {
                AdminApp.BaseList.createBase(e);
            }

            if ($(e.target).hasClass('panel__basis-remove')) {
                AdminApp.BaseList.deleteBase(e);
            }

            if ($(e.target).hasClass('panel__basis-add-templ')) {
                const base = $(e.target).parent().parent().data('base');

                AdminApp.BaseList.openTemplateUI(base);
            }
        }

        ,setConf(conf) {
            this.template_on.prop('checked', conf);
        }

        ,setPreloader() {
            this.list.html('');
            this.list.append(TemplateFactory.getPreloader());
        }

        ,changeConf(e) {
            const target = $(e.target),
                currentTaget = $(e.currentTarget),
                prop = target.prop('checked');

            if (prop) {
                this.setTemplateConf();
            } else {
                this.setBaseConf();
            }
        }

        ,setTemplateConf() {
            $('.panel__new-template').addClass('active');
            $('.panel__basis-button').removeClass('active');
        }

        ,setBaseConf() {
            $('.panel__new-template').removeClass('active');
            $('.panel__basis-button').addClass('active');
        }

        ,openTemplateUI(base) {
            // debugger
            // console.log(base);
            this.setConf(false);
            this.panel.removeClass('active');

            AdminApp.TemplatesUI.loadUI(base);
        }

        ,redactBase(e) {
            let base = $(e.target).parent().parent().data('base'),
                copy = {};

            this.panel.removeClass('active');

            this.copyObject(copy, base);

            AdminApp.BasePanel.panel.addClass('active');
            AdminApp.BasePanel.parseData(copy);
        }

        ,createBase(e) {
            this.panel.removeClass('active');

            AdminApp.BasePanel.clearInputs();
            AdminApp.BasePanel.panel.addClass('active');
        }

        ,deleteBase(e) {
            let base = $(e.target).parent().parent().data('base'),
                variants = base.variants,
                images = [],
                file_string = "";

            variants.forEach( (variant) => {
                images.push(variant.image);
            });

            file_string = images.join('|');

            User.Ajax.get(`/delete?name=${base.name}&type=base&files=${file_string}&_id=${base._id}`, (data) => {
                this.loadBases(1, this.loadFinishing);
            });
        }

        ,setBaseListHtml(bases) {
            const children = [];


            bases.forEach( base => {
                const child = $(TemplateFactory.getAdminPanelBaseListPointHtml(base, base.variants.find( (variant) => variant.main)));
                child.data('base', base);

                children.push(child);
            });

            this.list.html('');
            children.forEach( ch => this.list.append(ch));
        }

        ,setBasePagesHtml(pages) {
            this.pagesCount = pages;
            this.pages.html('');

            for (let page = 1; page <= pages; page++) {
                this.pages.append(TemplateFactory.getAdminPanelPages(page));
                this.pages.children(":last-child").data('page', page);
            }
        }

        ,copyObject(copy, object) {
            for (let key in object) {

                if (typeof object[key] == "object" && object[key] !== null) {

                    if (object[key].length) {
                        copy[key] = [];
                        this.copyObject(copy[key], object[key]);
                    } else {
                        copy[key] = {};
                        this.copyObject(copy[key], object[key]);
                    }

                } else {
                    copy[key] = object[key];
                }

            }
        }

        ,list: $('.base-list .panel__basis-list')
        ,panel: $('.base-list')
        ,pages: $('.panel__page-list.bases')
        ,pagesCount: 0
        ,template_on: $('[name="templates_conf"]')
        ,new_template: $('.panel__new-template')
        ,add_template: $('.panel__basis-add-templ')
        ,base_buttons: $('.panel__basis-button')
    }

    ,TemplatesUI: {
        init() {
            this.template.html('');

            this.template.on('click', this.checkEvent.bind(this));
            this.new_template.on('click', this.createNewTemplate.bind(this));
            this.pages.on('click', this.checkEvent.bind(this));
            this.list.on('click', this.checkEvent.bind(this));
            this.back.on('click', this.goBackToBaseList.bind(this));
        }

        ,checkEvent(e) {
            let target = $(e.target),
                currentTarget = $(e.currentTarget);

            while (!target.is(currentTarget)) {
                if (target.hasClass('panel__page-point')) {
                    const page = target.data('page');
                    this.loadUIPage(page);

                    break;
                }

                if (target.attr('name') == 'templateRedact') {
                    const template = target.parent().parent().data('template');

                    this.openTemplateConstructor(template);
                    break;
                }

                if (target.attr('name') == 'templateDelete') {
                    const child = target.parent().parent(),
                        template = child.data('template');

                    this.deleteTemplate(template, child);
                    break;
                }
                console.log('Cycle AdminPanel1')
                target = target.parent();
            }

        }

        ,loadUI(base) {
            this.setPreloader();
            this.openPanel();
            this.list.addClass('loading');
            this.addNew = false;

            this.base = Base.fromJSON(base);

            this.loadTemplatesPage(1, base._id, (response) => {
                response = JSON.parse(response);

                this.formTemplatesList(response.data);
                this.formPages(response.pages, 1);
            });
        }

        ,loadUIPage(page) {
            this.setPreloader();
            this.openPanel();
            this.list.addClass('loading');
            this.addNew = false;

            this.loadTemplatesPage(page, this.base._id, (response) => {
                response = JSON.parse(response);

                this.formTemplatesList(response.data);
                this.formPages(response.pages, page);
            });
        }

        ,loadTemplatesAll(_id, cb) {
            App.Ajax.get('/load/templates?page=all&_id='+_id, cb);
        }

        ,loadTemplatesPage(page = 1, _id, cb) {
            App.Ajax.get(`/load/templates?page=${page}&_id=${_id}`, cb);
        }

        ,createNewTemplate(e) {
            const target = $(e.target),
                currentTarget = $(e.currentTarget);

            if (this.addNew) {
                this.openBaseConstructor();
            }

        }

        ,openTemplateConstructor(template) {
            this.closePanel();
            AdminApp.TemplatePanel.openPanel();
            AdminApp.TemplatePanel.useTemplate(template);
        }

        ,openBaseConstructor() {
            this.closePanel();
            AdminApp.TemplatePanel.openPanel();
            AdminApp.TemplatePanel.useBase(this.base);
        }

        ,deleteTemplate(template, child) {
            child.remove();

            App.Ajax.get('/delete/template?_id='+template._id, (response) => {
                response = JSON.parse(response);
                console.log(response);
            });
        }

        ,goBackToBaseList() {
            this.closePanel();

            AdminApp.BaseList.openPanel();
        }

        ,openPanel(base) {
            this.panel.addClass('active');
        }

        ,closePanel() {
            this.panel.removeClass('active');
        }

        ,async formTemplatesList(templates) {
            const children = [];
            let sources = [];

            App.setProjectOnBase(this.base, false);
            const color = App.GraphCore.Filter.getAverageImageColor(App.currentProjectVariant.variant.image);

            if (templates.length) {
                for (let t of templates) {
                    const child = $(TemplateFactory.getAdminPanelTemplateListPointHtml(t));
                    child.data('template', t);
                    // this.list.append(TemplateFactory.getAdminPanelTemplateListPointHtml(t));
                    // this.list.children(':last-child').data('template', t);

                    await App.setProject(t);
                    App.Project.settings.color = App.GraphCore.Filter.getAverageImageColor(App.Project.variants[0].variant.image);

                    for (let v of App.Project.variants) {
                        sources.push(await App.getVariantPreview(v, true, color));
                    }

                    child.find('[name="templateImageContainer"]').html(
                        sources.reduce( (acc, src) => acc + TemplateFactory.getImageHtml(src), ``)
                    );

                    sources = [];
                    children.push(child);
                }

                this.list.html('');
                children.forEach( ch => this.list.append(ch));
            } else {
                this.list.html('');
            }

            this.list.removeClass('loading');
            this.addNew = true;
        }

        ,formPages(pages, selected) {
            this.pages.html('');

            for(let page = 1; page <= pages; page++) {
                this.pages.append(TemplateFactory.getAdminPanelPages(page));
                this.pages.children(':last-child').data('page', page);
            }

            this.pages.children(`:nth-child(${selected || 1})`).addClass('selected');
        }

        ,setPreloader() {
            this.list.html('');
            this.list.append(TemplateFactory.getPreloader());
        }

        // ,async getPreviewImage(variant, ti, vi) {
        //     await App.setCurrentVariant(variant);

        //     console.log(variant);

        //     console.log(App.currentProjectVariant);

        //     const template_container = $('.panel__templ-container').eq(ti),
        //         node = template_container.children().eq(vi),
        //         image = template_container.find('img').eq(vi);

        //     App.isPreview = true;
        //     App.GraphCore.RenderList.render(App.GraphCore.ctx);
        //     App.isPreview = false;

        //     $(image).attr('src', App.GraphCore.canvas.toDataURL('image/png'));

        //     node.data('variant', variant);
        //     // $('body').append(image);
        // }

        ,panel: $('.panel__card.templates-list')
        ,list: $('[name="templatesList"]')
        ,pages: $('[name="templatesPages"]')
        ,template: $('.panel__templates')
        ,new_template: $('[name="templateAdd"]')
        ,back: $('[name="backToBasesList"]')
        ,base: null
    }

    ,TemplatePanel: {
        init() {
            this.save.on('click', this.formData.bind(this));
            this.back.on('click', this.goBackToTemplates.bind(this));
            this.zoom.on('input', this.changeGraphOption.bind(this));
        }

        ,sendData(data, cb) {
            App.Ajax.post('/save/template', data, cb)
        }

        ,formData() {
            const data = App.Data.getProjectData();

            this.panel.addClass('loading');

            data.name = this.name.val();
            data._id = this.template._id;

            this.sendData(JSON.stringify(data), (response) => {
                response = JSON.parse(response);

                this.panel.removeClass('loading');
                this.goBackToTemplates();
            });
        }

        ,async useTemplate(template) {
            await App.setProject(template);
            App.Project.settings.color = App.GraphCore.Filter.getAverageImageColor(App.Project.variants[0].variant.image);
            App.GraphCore.Filter.setColorFilterImage(App.Project.variants[0].variant.image, App.Project.settings.color);

            this.template = App.Project;
            this.template._id = template._id;
            this.template.name = template.name;

            this.setTemplateData();
        }

        ,async useBase(base) {
            await App.setProjectOnBase(base);

            this.template = App.Project;
            this.template._id = 0;

            this.setTemplateData();
        }

        ,setTemplateData() {
            this.name.val(this.template.name);
        }

        ,goBackToTemplates() {
            this.closePanel();
            AdminApp.TemplatesUI.loadUIPage();
        }

        ,openPanel() {
            this.panel.addClass('active');
        }

        ,closePanel() {
            this.panel.removeClass('active');
        }

        ,changeGraphOption(e) { 
            const target = $(e.target),
                value = target.val();

            if (App.GraphCore.canvasScale) {
                App.GraphCore.setCanvasScale(parseFloat(value));
            }
        }

        ,panel: $('.templates-add')
        ,template_save: $('.save-template')
        ,name: $('[name="template_name"]')
        ,save: $('[name="saveTemplate"]')
        ,back: $('[name="goBackToTemplates"]')
        ,zoom: $('.zoom-input')
        ,template: null
    }

    // ,TemplatesList: {
    //     init() {
    //         this.list.on('click', this.checkEvent.bind(this));
    //         this.page_list.on('click', this.checkEvent.bind(this));
    //         this.loadTemplates(1);
    //
    //     }
    //
    //     ,checkEvent(e) {
    //         const target = $(e.target);
    //
    //         if(target.hasClass('panel__basis-edit')) {
    //             const template = target.parent().parent().data('template');
    //
    //             this.panel.removeClass('active');
    //             this.list.addClass('loading');
    //             AdminApp.TemplatePanel.setTemplate(template);
    //             AdminApp.TemplatePanel.panel.addClass('active');
    //         }
    //
    //         if(target.hasClass('panel__page-point')) {
    //             const page = target.data('page');
    //             this.loadTemplates(page);
    //         }
    //
    //         if(target.hasClass('panel__basis-remove')) {
    //             const id = (target.parent().parent().data('template')).id;
    //             this.removeTemplate(id);
    //         }
    //     }
    //
    //     ,loadTemplates(page = 1) {
    //         this.list.addClass('loading');
    //
    //         App.Ajax.get('/load/templates?page='+page, (response) => {
    //             const data = JSON.parse(response);
    //
    //             this.list.removeClass('loading');
    //             //this.formTemplatesPage(data.data, data.pages, page);
    //         });
    //     }
    //
    //     ,async formTemplatesPage(templates, page_count, page) {
    //         this.list.html(
    //             templates.reduce( (acc, template) => acc + TemplateFactory.getAdminPanelTemplateListPointHtml(template), ``)
    //         );
    //
    //         this.formPages(page_count, page);
    //
    //         let index = 0;
    //
    //         for (let template of templates) {
    //             await this.setPreviewImage(template, this.list.children()[index]);
    //             index++;
    //         }
    //     }
    //
    //     ,formPages(page_count, page = 1) {
    //         this.page_list.html('');
    //
    //         for (let page = 1; page <= page_count; page++) {
    //             this.page_list.append(TemplateFactory.getAdminPanelPages(page));
    //             this.page_list.children(':last-child').attr('data-page', page);
    //         }
    //
    //         this.page_list.children().removeClass('selected');
    //         this.page_list.children(`[data-page="${page}"]`).addClass('selected');
    //     }
    //
    //     ,async setPreviewImage(template, child) {
    //         await App.setProject(template);
    //
    //         App.isPreview = true;
    //         App.GraphCore.RenderList.render(App.GraphCore.ctx);
    //         App.isPreview = false;
    //
    //         $(child).find('.panel__basis-img img').attr('src', App.GraphCore.canvas.toDataURL());
    //         $(child).data('template', template);
    //     }
    //
    //     ,removeTemplate(id) {
    //         App.Ajax.get('/delete/template?id='+id, (data) => {
    //             this.loadTemplates(1);
    //         });
    //     }
    //
    //     ,list: $('.templates-list .panel__basis-list')
    //     ,page_list: $('.panel__page-list.templates')
    //     ,panel: $('.templates-list')
    //     //,new_template: $('[name="templateAdd"]')
    //     ,base: null
    // }

    ,PrintsList: {
        init() {
            this.list.on('click', this.checkEvent.bind(this));
            this.uploadButton.on('click', this.createNewPrint.bind(this));
            this.pages.on('click', this.checkPagesEvent.bind(this));

            // this.loadPanel();
        }

        ,checkPagesEvent(e) {
            const target = $(e.target);

            if (target.hasClass('panel__page-point')) {
                const page = target.data('page');

                this.loadPanelPage(page);
            }
        }

        ,checkEvent(e) {
            e.preventDefault();

            const currentTarget = $(e.currentTarget);
            let target = $(e.target);

            while (!target.is(currentTarget)) {
                if (target.attr('name') == "printItem") {
                    const print = target.data('print');
                    this.openPrintEditor(print);

                    break;
                }

                if (target.hasClass('btn__print-remove')) {
                    const child = target.parent(),
                        print = child.data('print');
                    this.removePrint(print, child);

                    break;
                }
                console.log('Cycle AdminPanel 1')
                target = target.parent();
            }

        }

        ,loadPrintsAll(cb) {
            App.Ajax.get('/load/prints?page=all', cb);
        }

        ,loadPrintsPage(page = 1, cb) {
            if (typeof page == 'function') {
                cb = page;
                page = 1;
            }

            App.Ajax.get('/load/prints?page='+page, cb);
        }

        ,formPrintsList(prints) {
            const children = [];
            this.setPreloader();

            prints.forEach( print => {
                const child = $(TemplateFactory.getAdminPanelPrintItemHtml(print));
                child.data('print', print);

                children.push(child);
            });

            this.list.html('');
            children.forEach( ch => this.list.append(ch));
        }

        ,formPrintsPages(pages, selected = 1) {
            this.pages.html('');

            for (let page = 1; page <= pages; page++) {
                this.pages.append(TemplateFactory.getAdminPanelPages(page));
                this.pages.children(':last-child').data('page', page);
            }

            this.pages.children(`:nth-child(${selected})`).addClass('selected');
        }

        ,createNewPrint() {
            this.closePanel();
            AdminApp.PrintRedactor.createPrint();
        }

        ,openPrintEditor(print) {
            this.closePanel();
            AdminApp.PrintRedactor.usePrint(print);
        }

        ,removePrint(print, child) {
            App.Ajax.get('/delete/print?_id='+print._id+'&src='+print.src, (response) => {
                response = JSON.parse(response);

                console.log(response);

                child.remove();
                this.loadPanel();
            });
        }

        ,setAwaitLoading() {
            this.list.addClass('loading');
            this.uploadButton.addClass('_no-events');
        }

        ,setPreloader() {
            this.list.html('');
            this.list.append(TemplateFactory.getPreloader());
        }

        ,unsetAwaitLoading() {
            this.list.removeClass('loading');
            this.uploadButton.removeClass('_no-events');
        }

        ,loadPanel() {
            this.openPanel();
            this.setAwaitLoading();

            this.loadPrintsPage((response) => {
                response = JSON.parse(response);

                this.formPrintsList(response.data);
                this.formPrintsPages(response.pages);

                this.unsetAwaitLoading();
            });
        }

        ,loadPanelPage(page) {
            this.openPanel();
            this.setAwaitLoading();

            this.loadPrintsPage(page, (response) => {
                response = JSON.parse(response);

                this.formPrintsList(response.data);
                this.formPrintsPages(response.pages, page);

                this.unsetAwaitLoading();
            });
        }

        ,openPanel() {
            this.panel.addClass('active');
        }

        ,closePanel() {
            this.panel.removeClass('active');
        }

        ,panel: $('[name="panelPrints"]')
        ,list: $('[name="printsContainer"]')
        ,pages: $('[name="pritnsPages"]')
        ,uploadButton: $('[name="uploadPrint"]')
    }

    ,PrintRedactor: {
        init() {
            //this.loadPanel();

            this.options = {
                print: $('[name="print_print"]'),
                fancywork: $('[name="fancywork_print"]'),
                _3D: $('[name="3D_print"]')
            }

            this.optionsBin = 0b111;
            this.setOption(this.optionsBin);

            this.file.on('change', this.onFileInput.bind(this));
            this.remove.on('click', this.clearFile.bind(this));
            this.add_tag.on('click', this.createTag.bind(this));
            this.tag_container.on('click', this.checkTagEvent.bind(this));

            this.options.print.on('click', this.checkOptionsEvent.bind(this));
            this.options.fancywork.on('click', this.checkOptionsEvent.bind(this));
            this.options._3D.on('click', this.checkOptionsEvent.bind(this));

            this.upload.on('click', this.uploadPrint.bind(this));
            this.back.on('click', this.goBack.bind(this));
        }

        ,sendData(data, query) {
            App.Ajax.post('/upload/print'+query, data, (response) => {
                response = JSON.parse(response);

                console.log(response);

                this.closePanel();
                AdminApp.PrintsList.loadPanel();
            });
        }

        ,formData() {
            if (this.name.val().length && (this.file[0].files.length || this.file_storage)) {
                const data = new FormData(),
                    tags = [];

                data.append('name', this.name.val());
                data.append('category', this.category.val());
                data.append('print', this.options.print.prop('checked'));
                data.append('fancywork', this.options.fancywork.prop('checked'));
                data.append('_3D', this.options._3D.prop('checked'));

                $.each(this.tag_container.children(), (index, child) => {
                    tags.push($(child).data('tag'));
                });

                data.append('tags', JSON.stringify(tags));
                data.append('file_name', this.file_name);
                data.append('file', this.file[0].files[0] || this.file_storage);

                const _id = (this.print) ? this.print._id : 0;
                data.append('_id', _id);

                return data;
            }
        }

        ,uploadPrint() {
            if (!this.uploading) {
                this.uploading = true;
                const data = this.formData()
                this.sendData(data, '?_id=' + data.get('_id'));
            }
        }

        ,checkTagEvent(e) {
            const currentTarget = $(e.currentTarget);
            let target = $(e.target);

            while (!target.is(currentTarget)) {
                if (target.hasClass('tags-container__close')) {
                    const tag = target.parent();

                    this.removeTag(tag);
                    break;
                }
                console.log('Cycle AdminPanel 3')
                target = target.parent();
            }
        }

        ,onFileInput(e) {
            const target = $(e.target),
                currentTarget = $(e.currentTarget),
                file = currentTarget[0].files[0];

            if (file.type.indexOf('image/png') >= 0) {
                this.file_storage = file;
                this.previewImageFile(file);
            } else {
                alert('Need png file');
                this.file.val('');
            }
        }

        ,previewImageFile(file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                this.preview.attr('src', e.target.result);
                this.openPreview();
            }

            reader.readAsDataURL(file);
        }

        ,clearFile(e) {
            this.file.val('');
            this.file_storage = null;
            this.closePreview();
        }

        ,clearInputs() {
            this.name.val('');
            this.tag_container.html('');
            this.file.val('');

            this.uploading = false;

            this.preview.attr('src', '');
            this.print = null;
            this.file_storage = null;
            this.closePreview();
        }

        ,checkOptionsEvent(e) {
            const currentTarget = $(e.currentTarget);
            let bin = 0b000;

            if (currentTarget.attr('name') == "print_print") {
                this.optionsBin ^= 0b001;
                bin = 0b001;
            }

            if (currentTarget.attr('name') == "fancywork_print") {
                this.optionsBin ^= 0b010;
                bin = 0b010;
            }

            if (currentTarget.attr('name') == "3D_print") {
                this.optionsBin ^= 0b100;
                bin = 0b100;
            }

            this.checkOption(bin);
        }

        ,checkOption(bin) {
            !(this.optionsBin & 0b111) ? this.setOption(bin) : "";
        }

        ,setOption(bin) {
            this.optionsBin = bin;

            (bin & 0b001) ? this.options.print.prop('checked', true) : "";
            (bin & 0b010) ? this.options.fancywork.prop('checked', true): "";
            (bin & 0b100) ? this.options._3D.prop('checked', true) : "";
        }

        ,setPanleLoading() {
            this.panel.addClass('loading');
            this.loading = true;
        }

        ,unsetPanleLoading() {
            this.panel.removeClass('loading');
            this.loading = false;
        }

        ,usePrint(print) {
            this.loadPanel();
            this.setPanleLoading();
            this.print = print;

            App.Ajax.getBlob(print.src, (response) => {
                this.unsetPanleLoading();
                const file = new File([response], print.src.replace(/[a-zA-Z0-9\.\-\_\\]+\//g, ""), {type: response.type });

                this.file_name = file.name;
                this.file_storage = file;
                this.formPanel();
            }, 'blob');
        }

        ,createPrint() {
            this.clearInputs();
            this.loadPanel();
        }

        ,formPanel() {
            this.name.val(this.print.name);
            this.category.val(this.print.category || 'Другое');
            this.print.tags.forEach( tag => this.addTag(tag));

            this.options.print.prop('checked', (this.print.print == 'true') ? true : false);
            this.options.fancywork.prop('checked', (this.print.fancywork == 'true') ? true : false);
            this.options._3D.prop('checked', (this.print._3D == 'true') ? true : false);

            this.preview.attr('src', this.print.src);
            this.openPreview();
1        }

        ,createTag() {
            const tag = this.tag_input.val();
            this.addTag(tag);
        }

        ,addTag(tag) {
            if (tag.length) {
                this.tag_container.prepend(TemplateFactory.getAdminPanelTagHtml(tag));
                this.tag_container.children(':first-child').data('tag', tag);
            }
        }

        ,removeTag(tag) {
            tag.remove();
        }

        ,openPreview() {
            this.preview.addClass('active');
        }

        ,closePreview() {
            this.preview.removeClass('active');
        }

        ,loadPanel() {
            this.clearInputs();
            this.openPanel();
        }

        ,openPanel() {
            this.panel.addClass('active');
        }

        ,closePanel() {
            this.panel.removeClass('active');
        }

        ,goBack() {
            this.closePanel();
            AdminApp.PrintsList.loadPanel();
        }

        ,panel: $('[name="printRedactor"]')
        ,file: $('[name="addFile_print"]')
        ,preview: $('[name="printPreview_print"]')
        ,remove: $('[name="printRemove_print"]')
        ,tag_input: $('[name="printTags_print"]')
        ,add_tag: $('[name="addTag_print"]')
        ,tag_container: $('[name="tagContainer_print"]')
        ,name: $('[name="printName_print"]')
        ,upload: $('[name="printUpload_print"]')
        ,print: null
        ,file_storage: null
        ,file_name: ""
        ,back: $('[name="backToPrintsList_print"]')
        ,category: $('[name="printCategory_print"]')
        ,loading: false
        ,uploading: false
    }

    ,OrdersList: {
        init() {
            this.table.on('click', this.checkEvent.bind(this));
            this.pages.on('click', this.checkPagesEvent.bind(this));
            this.category.on('click', this.checkCategoryEvent.bind(this));
        }

        ,checkPagesEvent(e) {
            const target = $(e.target);

            if (target.hasClass('panel__page-point')) {
                const page = target.data('page');

                this.loadPanelPage(page);
            }
        }

        ,checkEvent(e) {
            const currentTarget = $(e.currentTarget);
            let target = $(e.target);

            while (!target.is(currentTarget)) {
                if (target.hasClass('link__table')) {
                    e.preventDefault();

                    const row = target.parent().parent(),
                        order = row.data('order');

                    this.openOrderUI(order);

                    return;
                }
                console.log('Cycle AdminPanel 4')
                target = target.parent()
            }
        }

        ,checkCategoryEvent(e) {
            const target = $(e.target);

            if (target.hasClass('onen__order')) {
                this.openInProgressOrders(target);
            }

            if (target.hasClass('close__order')) {
                this.openClosedOrders(target);
            }
        }

        ,loadOrdersPage(page = 1, cb) {
            if (typeof page === 'function') {
                cb = page;
                page = 1;
            }
            const type = this.type.replace(' ', '+');

            App.Ajax.get(`/order/load?page=${page}&type=${type}`, cb);
        }

        ,loadOrdersAll(cb) {
            App.Ajax.get('/order/load', cb);
        }

        ,formOrdersTable(orders) {
            const children = [];

            orders.forEach( (order) => {
                const child = $(TemplateFactory.getAdminPanelOrderItemHtml(order));
                child.data('order', order);
                children.push(child);
            });

            this.table.html('');
            this.table.append(TemplateFactory.getAdminPanelOrderHeadHtml());
            children.forEach( ch => this.table.append(ch));
        }

        ,formOrdersPages(pages = 1, selected = 1) {
            this.pages.html('');

            for (let page = 1; page <= pages; page++) {
                this.pages.append(TemplateFactory.getAdminPanelPages(page));
                this.pages.children(':last-child').data('page', page);
            }

            this.pages.children(`:nth-child(${selected})`).addClass('selected');
        }

        ,setPreloader() {
            this.table.html('');
            this.table.append(TemplateFactory.getPreloader());
        }

        ,openOrderUI(order) {
            this.closePanel();

            console.log(order);

            AdminApp.OrderUI.loadPanel(order);
            // console.log('Need orderUI layout');
        }

        ,loadPanelPage(page = 1) {
            this.setPreloader();
            this.openPanel();
            this.setAwaitLoading();

            this.loadOrdersPage( (response) => {
                response = JSON.parse(response);

                this.unsetAwaitLoading();
                this.formOrdersTable(response.data);
                this.formOrdersPages(response.pages, page);

                this.orders = response.data;
                console.log(response);
            });
        }

        ,openClosedOrders(btn) {
            // this.table.removeClass('active');
            // this.closed.addClass('active');
            if (this.onPending) {
                return;
            }

            btn && btn.addClass('active');

            this.type = 'Закрыт';
            this.loadPanel();
            $('.onen__order').removeClass('active');
        }

        ,openInProgressOrders(btn) {
            // this.table.addClass('active');
            // this.closed.removeClass('active');
            if (this.onPending) {
                return;
            }

            btn && btn.addClass('active');

            this.type = 'В обработке';
            this.loadPanel();
            $('.close__order').removeClass('active');
        }

        ,loadPanel() {
            this.setPreloader();
            this.openPanel();
            this.setAwaitLoading();
            this.onPending = true;

            this.loadOrdersPage( (response) => {
                response = JSON.parse(response);

                this.onPending = false;

                this.unsetAwaitLoading();
                this.formOrdersTable(response.data);
                this.formOrdersPages(response.pages);

                console.log(response);
            });
        }

        ,openPanel() {
            this.panel.addClass('active');
        }

        ,closePanel() {
            this.panel.removeClass('active');
        }

        ,unsetAwaitLoading() {
            this.table.removeClass('loading');
        }

        ,setAwaitLoading() {
            this.table.addClass('loading');
        }

        ,panel: $('[name="orderPanel_order"]')
        ,table: $('[name="orderTableInProgress_order"]')
        ,closed: $('[name="orderTableClosed_order"]')
        ,pages: $('[name="ordersPages_order"]')
        ,category: $('[name="orderSelectCategory_order"]')
        ,type: 'В обработке'
        ,orders: null
    }

    ,OrderUI: {
        init() {
            this.list.on('click', this.checkEvent.bind(this));
            this.order_status.on('click', this.checkOrderStatusEvent.bind(this));
            this.comment.on('input', this.checkCommentEvent.bind(this));
            this.update.on('click', this.updateOrder.bind(this));
        }

        ,checkEvent(e) {
            const currentTarget = $(e.currentTarget);
            let target = $(e.target);

            while (!target.is(currentTarget)) {
                if (target.hasClass('product_status')) {
                    const child = target.parent().parent().parent().parent().parent(),
                        item = child.data('item'),
                        status = target.val();

                    this.setCartItemStatus(child, item, status);

                    return;
                }

                if (target.hasClass('constr__item-templ')) {
                    const child = target.parent().parent().parent().parent(),
                        item = child.data('item'),
                        variant = target.data('variant');


                    this.showVariantPreview(child, target, variant);

                    return;
                }

                if (target.hasClass('button__layer-info')) {
                    const child = target.parent().parent().parent().parent(),
                        item = child.data('item'),
                        layer = target.parent();

                    this.toggleDetailedLayer(layer);

                    return;
                }

                if (target.hasClass('order__btn-show')) {
                    const child = target.parent().parent(),
                        item = child.data('item');

                    this.showOrderItem(child, target);
                    return;
                }

                if (target.hasClass('order__btn-hide')) {
                    const child = target.parent().parent(),
                        item = child.data('item');

                    this.hideOrderItem(child, target);
                    return;
                }
                console.log('Cycle AdminPanel 5')
                target = target.parent();
            }
        }

        ,checkOrderStatusEvent(e) {
            const currentTarget = $(e.currentTarget);
            let target = $(e.target);

            while (!target.is(currentTarget)) {
                if (target.attr('name') == 'status__all-order') {
                    const status = target.val();
                    this.setOrderStatus(status);

                    return;
                }
                console.log('Cycle AdminPanel 6')
                target = target.parent();
            }
        }

        ,checkCommentEvent(e) {
            const currentTarget = $(e.currentTarget),
                target = $(e.target),
                comment = target.val();

            this.setOrderComment(comment);
        }

        ,sendData(data, cb) {
            App.Ajax.postJSON('/order/update?_id='+this.order._id, data, cb);
        }

        ,updateOrder(e) {
            console.log(this.order);
            this.sendData(JSON.stringify(this.order), (response) => {
                response = JSON.parse(response);

                console.log(response);
                this.openOrdersList();
            });
        }

        ,async formOrderList(cart) {
            this.cart = cart;

            // this.setListLoading();
            this.setOrderNumber(this.order.number);
            this.setComment(this.order.comment);
            this.setOrderStatus(this.order.status);
            this.formCustomerInfo();

            let previews = [];
            let children = [];

            for (let p of cart) {
                const Project = await App.setProject(p, false);
                const ch = $(TemplateFactory.getAdminPanelOrderPreviewHtml(this.order, p));
                children.push(ch);

                for (let v of Project.variants) {
                    previews.push(await App.getVariantPreview(v));
                }

                //this.list.append(TemplateFactory.getAdminPanelOrderPreviewHtml(this.order, p));
                ch.find('> img').attr('src', previews[0]);

                ch.data('item', p);

                ch.find('.order__main-img > img').attr('src', previews[0]);

                previews.forEach( (src, index) => {
                    ch.find('[name="orderImagePreview_order"]').children().eq(index).find('img').attr('src', src)
                    ch.find('[name="orderImagePreview_order"]').children().eq(index).data('variant', p.variants[index]);
                });

                //const child = this.list.children(':last-child');
                    // find('[name="orderItemLayers_order"]');
                this.loadLayers(ch, ch.data('item').variants[0].widgets);

                previews = [];
            }

            this.list.html('');

            children.forEach(ch => {
                this.list.append(ch);
            });
        }

        ,formCustomerInfo() {
            this.customer.html(TemplateFactory.getAdminPanelCustomerInfoHtml(this.order.info));
        }

        ,setCartItemStatus(child, item, status) {
            item.status = status;
            child.find('[name="orderCartStatus_order"]').text(status);
        }

        ,setOrderStatus(status) {
            if (status == "Закрыт") {
                this.order.status = 'Закрыт';
                this.order_status.find('[data-status="closed"]').prop('checked', true);
            } else {
                this.order.status = 'В обработке';
                this.order_status.find('[data-status="inProgress"]').prop('checked', true);
            }
        }

        ,setOrderComment(comment) {
            this.order.comment = comment;
        }

        ,setComment(comment) {
            this.comment.val(comment);
        }

        ,setOrderNumber(number) {
            this.head.find('.order__number').text(number);
        }

        ,setListLoading() {
            this.customer.html('')
            this.list.html('');
            this.list.append(TemplateFactory.getPreloader());
        }

        ,showVariantPreview(child, target, variant) {
            const main = child.find('.order__main-img');
            main.find('img').attr('src', target.find('img').attr('src'));

            child.find('[name="orderImagePreview_order"]').children().removeClass('active');
            target.addClass('active');

            this.loadLayers(child, variant.widgets);
        }

        ,showOrderItem(item_node, btn) {
            this.list.children().removeClass('active');
            this.list.children().addClass('in_pending');

            item_node.removeClass('in_pending');
            item_node.addClass('active');
        }

        ,hideOrderItem(item_node, btn) {
            item_node.removeClass('active');
            this.list.children().removeClass('in_pending')
        }

        ,toggleDetailedLayer(layer) {
            layer.toggleClass('active');
        }

        ,loadLayers(child, widgets) {
            const layerContainer = child.find('[name="orderItemLayers_order"]');
            layerContainer.html('');

            widgets.forEach( (w) => {
                if (w.type == 'ImageWidget') {
                    layerContainer.append(TemplateFactory.getImageLayerHtml(w));
                }

                if (w.type == 'TextWidget') {
                    layerContainer.append(TemplateFactory.getTextLayerHtml(w));
                }
            });
        }

        ,loadOrder(number, callback) {
            App.Ajax.get('/order/get?number='+number, callback);
        }

        ,loadPanel(order) {
            this.setListLoading();
            this.openPanel();

            this.loadOrder(order.number, (response) => {
                response = JSON.parse(response);

                this.order = response.data;
                this.formOrderList(this.order.cart);
            });

            // this.formOrderList(order.cart);
        }

        ,openOrdersList() {
            this.closePanel();
            AdminApp.OrdersList.loadPanel();
        }

        ,openPanel() {
            this.panel.addClass('active');
        }

        ,closePanel() {
            this.panel.removeClass('active');
        }

        ,panel: $('[name="orderShowPanel_order"]')
        ,list: $('[name="orderShowCart_order"]')
        ,customer: $('[name="orderCustomerInfo_order"]')
        ,order_status: $('[name="orderSetStatus_order"]')
        ,comment: $('[name="orderComments_order"]')
        ,update: $('[name="orderUpdateOrder_order"]')
        ,head: $('.order-head')
        ,order: null
        ,cart: null
    }
}

//AdminApp.init();
