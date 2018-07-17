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

        this.fontPage = 1;

        this.style = $('<style></style>');


        this.font_print.on('click', this.checkPrint.bind(this));
        this.font_fancywork.on('click', this.checkPrint.bind(this));


        this.getFonts(1);

        this.UI.init();
        this.BaseList.init();
        this.BasePanel.init();
        this.TemplatePanel.init();
        this.TemplatesList.init();

        console.log('AdminPanel init');
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
            console.log(AdminApp.fontPage);

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

        console.log(target.attr('name'));

        if (target.attr('name') == "font_fancywork" && !target.prop('checked')) {
            this.font_print.prop('checked', true);
        } else if (target.attr('name') == 'font_print' && !target.prop('checked')){
            this.font_fancywork.prop('checked', true);
        }

    }

    ,uploadFont() {
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

        User.Ajax.get(`/fonts?page=${page}`, (data) => {

            data = JSON.parse(data);

            this.setPagesCount(data.pages);
            this.setFontsHtml(data.fonts, callback);
        });
    }

    ,resetUpload() {
        $('input[name="font"]').val('');

        $('input[type="file"][name="font_file"]').remove();
        $('input[name="font"]').after(TemplateFactory.getAdminPanelFontFileInput());
        $('input[type="file"]').on('change', this.updateFile);

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
        this.fontsPanel.html(
            fonts.reduce(  (acc, font) => acc + TemplateFactory.getAdminPanelFontshtml(font), `` )
        );

        this.style.html(
            fonts.reduce( (acc, font) => acc + TemplateFactory.getFontStyle(font), ``)
        );

        $('head').append(this.style);

        if (callback) callback(fonts);
    }

    ,updateFile() {
        this.dataset.after = this.files[0].name;
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
            if ($(e.target).hasClass('baseUI')) {
                $('.panel__card').removeClass('active');
                AdminApp.BaseList.loadBases(1, AdminApp.BaseList.loadFinishing);
                AdminApp.BaseList.panel.addClass('active');
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
            }

            this.inputs.print.on('change', this.setPrintType);
            this.inputs.fancywork.on('change', this.setPrintType);

            $('.base__add .add-size').on('click', this.addSize);
            $('.panel__font-submit').on('click', this.sendData);

            this.workzoneInputs.x.on('input', this.updateWorkzone);
            this.workzoneInputs.y.on('input', this.updateWorkzone);
            this.workzoneInputs.width.on('input', this.updateWorkzone);
            this.workzoneInputs.height.on('input', this.updateWorkzone);

            this.canvas.addEventListener('mousedown', this.setWorkzonePoint);
            this.canvas.addEventListener('mousemove', this.setWorkzoneSize);

            this.ctx = this.canvas.getContext('2d');
            this.ctx.translate(0.5, 0.5);

            this.clearInputs();

            this.renderWorkzone();
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

                        ($(child).hasClass('main')) ? info.main = true : info.main = false;

                        data.append(index, $(child).data('file'));
                        data.append(index, JSON.stringify(info));

                        info.workzone.x = _x;
                        info.workzone.y = _y;
                        info.workzone.width = _width;
                        info.workzone.height = _height;
                    }
                });

                data.append('name', name);
                data.append('price', price);
                data.append('type', AdminApp.BasePanel.inputs.type.val());
                data.append('print', AdminApp.BasePanel.inputs.print.prop('checked'));
                data.append('fancywork', AdminApp.BasePanel.inputs.fancywork.prop('checked'));

                AdminApp.BasePanel.panel.addClass('loading');

                User.Ajax.post('/upload', data, (data) => {
                    AdminApp.BasePanel.panel.removeClass('loading');
                    console.log(data);
                })
            }

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

            this.clearInputs();

            AdminApp.BasePanel.inputs.name.val(base.name);
            AdminApp.BasePanel.inputs.price.val(base.price);

            let options = AdminApp.BasePanel.inputs.type[0].options,
                print = base.print;

            AdminApp.BasePanel.inputs.print.prop('checked', (base.print == "true") ? true : false);
            AdminApp.BasePanel.inputs.fancywork.prop('checked', (base.fancywork == "true") ? true : false);

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

            AdminApp.BasePanel.fileCount = base.variants.length;

            base.variants.forEach( (variant, index) => {
                fetch(variant.image).then( data => data.blob() ).then( (blob) => {
                    let file = new File([blob], variant.image.replace(/[a-zA-Z:]*\//g, ""), { type: blob.type, size: blob.size });

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

            reader.onload = (e) => {
                console.log(AdminApp.BasePanel.main_variant_image);

                AdminApp.BasePanel.fileCount++;
                AdminApp.BasePanel.checkFileSpace();

                AdminApp.BasePanel.addVariant(e.target.result, file);
            }

            reader.readAsDataURL(file);
            AdminApp.BasePanel.main_variant.addClass('active');
        }

        ,onDeleteVariant(e) {
            let _delete = $(e.target).parent();
            this.fileCount--;

            if (_delete.hasClass('main')) {
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
                size.width = 400;
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
            $('.panel__uploaded-pic.main').removeClass('main');
            node.addClass('main');
            this.currVariant = node;
            this.currWorkzone = node.data('workzone');

            this.main_variant.addClass('active');
            this.main_variant_image.attr('src', node.find('img').attr('src'));
        }

        ,checkFileSpace() {
            console.log('check file space');
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
            let size = AdminApp.BasePanel.inputs.size.val(),
                child = $(TemplateFactory.getAdminPanelSizeHtml(size));

            child.data('size', size);
            AdminApp.BasePanel.size.append(child);
        }

        ,setPrintType() {
            if (!$('input[name="base_print"]').prop('checked') && !$('input[type="base_fancywork"]').prop('checked')) {
                if ($(this).attr('name') == "base_print") {
                    AdminApp.BasePanel.inputs.fancywork.prop('checked', true);
                } else {
                    AdminApp.BasePanel.inputs.print.prop('checked', true);
                }
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
    }

    ,BaseList: {
        init() {
            this.loadBases(1, this.loadFinishing);

            this.list.on('click', this.checkBaseListEvent);
            $('.button__add-basis').on('click', this.checkBaseListEvent);

            this.pages.on('click', this.loadBasesPage)
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

            User.Ajax.get(`/delete?name=${base.name}&type=base&files=${file_string}`, (data) => {
                this.loadBases(1, this.loadFinishing);

                console.log(data);
            });
        }

        ,setBaseListHtml(bases) {
            this.list.html(
                bases.reduce( (acc, base) => acc + TemplateFactory.getAdminPanelBaseListPointHtml(base, base.variants.find( (variant) => variant.main)), ``));

            $.each(this.list.children(), (index, child) => {
                $(child).data('base', bases[index]);
            });
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

                if (typeof object[key] == "object") {

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
    }

    ,TemplatePanel: {
        init() {

            this.inputs = {
                tag: $('input[name="template_size"]'),
                name: $('input[name="template_name"]')
            }

            this.tag.on('click', this.checkTagEvent.bind(this));
            this.tag_add.on('click', this.addTag.bind(this));
            this.template_save.on('click', this.formData.bind(this));
        }

        ,sendData(data) {
            this.panel.addClass('loading');

            App.Ajax.post('/save/template', JSON.stringify(data), (data) => {
                this.panel.removeClass('loading');
                console.log(data);
            });
        }

        ,formData() {
            const data = App.Data.getProjectData(),
                name = this.inputs.name.val(),
                tags = [];

            $.each(this.tag.children().children('.size-container__value'), (index, tag) => {
                tags.push($(tag).text());
            });

            data.name = name;
            data.tags = tags;

            this.sendData(data);
        }

        ,async setTemplate(template, cb) {
            await App.setProject(template);

            console.log(template);

            this.inputs.name.val(template.name);
            this.tag.html(
                template.tags.reduce( (acc, tag) => acc + TemplateFactory.getAdminPanelSizeHtml(tag), ``)
            );

            App.GraphCore.setCurrentWidget(null);
            App.UI.Layers.formLayersHtml();

            if (cb) {
                cb();
            }
        }

        ,checkTagEvent(e) {
            const target = $(e.target);

            if (target.hasClass('size-container__close')) {
                this.removeTag(target.parent());
            }

            if (target.hasClass('panel__template-layer-config')) {
                const id = target.data('id'),
                    layer = App.currentProjectVariant.layers.find( l => l.id == id);

                console.log(layer);
            }
        }

        ,addTag() {
            const tag = this.inputs.tag.val();

            this.tag.append(TemplateFactory.getAdminPanelSizeHtml(tag));
        }

        ,removeTag(tag) {
            tag.remove();
        }

        ,panel: $('.templates-add')
        ,tag: $('.templates-add .panel__tag-container')
        ,tag_add: $('.templates-add .add-tag')
        ,template_save: $('.save-template')
        ,layers: $('.panel__container-basis')

}

    ,TemplatesList: {
        init() {
            console.log('Templates panel init');

            this.list.on('click', this.checkEvent.bind(this));
            this.page_list.on('click', this.checkEvent.bind(this));
            this.loadTemplates(1);

        }

        ,checkEvent(e) {
            const target = $(e.target);

            if(target.hasClass('panel__basis-edit')) {
                const template = target.parent().parent().data('template');

                this.panel.removeClass('active');
                this.list.addClass('loading');
                AdminApp.TemplatePanel.setTemplate(template);
                AdminApp.TemplatePanel.panel.addClass('active');
            }

            if(target.hasClass('panel__page-point')) {
                const page = target.data('page');
                this.loadTemplates(page);
            }

            if(target.hasClass('panel__basis-remove')) {
                const id = (target.parent().parent().data('template')).id;

                console.log(id);
                this.removeTemplate(id);
            }
        }

        ,loadTemplates(page = 1) {
            this.list.addClass('loading');

            App.Ajax.get('/load/templates?page='+page, (response) => {
                const data = JSON.parse(response);

                this.list.removeClass('loading');
                this.formTemplatesPage(data.data, data.pages, page);
            });
        }

        ,async formTemplatesPage(templates, page_count, page) {
            this.list.html(
                templates.reduce( (acc, template) => acc + TemplateFactory.getAdminPanelTemplateListPointHtml(template), ``)
            );

            this.formPages(page_count, page);

            let index = 0;

            for (let template of templates) {
                await this.setPreviewImage(template, this.list.children()[index]);
                index++;
            }
        }

        ,formPages(page_count, page = 1) {
            this.page_list.html('');

            for (let page = 1; page <= page_count; page++) {
                this.page_list.append(TemplateFactory.getAdminPanelPages(page));
                this.page_list.children(':last-child').attr('data-page', page);
            }

            this.page_list.children().removeClass('selected');
            this.page_list.children(`[data-page="${page}"]`).addClass('selected');
        }

        ,async setPreviewImage(template, child) {
            await App.setProject(template);

            App.isPreview = true;
            App.GraphCore.RenderList.render(App.GraphCore.ctx);
            App.isPreview = false;

            $(child).find('.panel__basis-img img').attr('src', App.GraphCore.canvas.toDataURL());
            $(child).data('template', template);
        }

        ,removeTemplate(id) {
            App.Ajax.get('/delete/template?id='+id, (data) => {
                console.log(data);
            });
        }

        ,list: $('.templates-list .panel__basis-list')
        ,page_list: $('.panel__page-list.templates')
        ,panel: $('.templates-list')
    }
}

//AdminApp.init();
