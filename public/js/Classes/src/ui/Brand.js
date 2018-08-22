class Brand {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.form = $('.new-brand__form');

        this.open_section = $('.create__button-create, .button__edit-mbr');
        this.section = $('.new-brand__create');

        this.hint_list = $('.brand__hint-list');
        this.hint_container = $('.new-brand__hint-container');

        this.tag_input = $('[name="brandTagInput_tag"]');
        this.tag_input_container = $('[name="brandTagContainer_tag"]');

        this.tags = [];
        this.search_tags = [];
        this.sign_text = "Text";
        this._sign = $('[name="brandSign_text"]');
        this.sign = $('[name="newBrand_text"]');

        this.create_brand = $('[name="brandCreateBrand_brand"]');

        this.container = $('[name="brandProductsGeneration_brand"]');
        this.tag_container = $('[name="brandTagContainer_read"]');

        if (this.section.length) {
            this.UI.App.Ajax.get('/load/tags', (response) => {
                response = JSON.parse(response);

                this.tags = response.data.tags;
            });


            this.tag_input.on('input', this.formTagHint.bind(this));
            this.tag_input.on('focus', this.formTagHint.bind(this));

            this.section.on('click', this.checkEvent.bind(this));
            this.open_section.on('click', this.checkCreateEvent.bind(this));

            this.create_brand.on('click', this.createBrand.bind(this));
        }

        if (this.container.length) {
            this.loadBrandPage();
            this.container.on('click', this.checkEvent.bind(this));
        }
    }

    checkEvent(e) {
        const currentTarget = $(e.currentTarget);
        let target = $(e.target);

        this.blurTagInput();

        if (target.is(currentTarget)) {
            this.closeSection();

            return;
        }

        while (!target.is(currentTarget)) {
            if (target.hasClass('close__tab')) {
                this.closeSection();

                return;
            }

            if (target.hasClass('hint-list__item')) {
                const tag = target.data('tag');
                this.addTag(tag);
                this.closeHint();
                this.tag_input.val('');
                this.tag_input.focus();

                return;
            }

            if (target.attr('name') == 'brandTag_close') {
                const child = target.parent(),
                    tag = child.data('tag');

                child.remove();
                this.removeSearchTag(tag);

                return;
            }

            if (target.hasClass('new-brand__input tags')) {
                this.tag_input.focus();

                return;
            }

            if (target.attr('name') == 'myBrand_item-btn-edit') {
                const child = target.parent().parent(),
                    brand = child.data('brand');

                this.editBrand(brand);
                return;
            }

            target = target.parent();
        }

    }

    checkCreateEvent(e) {
        const target = $(e.target);

        if (target.hasClass('create__button-create') || target.hasClass('button__edit-mbr')) {
            const base = this.base || this.UI.App.Project.base;

            this.setBase(base);
            this.openSection();

            return;
        }
    }

    blurTagInput() {
        this.tag_input.blur();
        this.closeHint();
    }

    addTag(tag) {
        const child = $(TemplateFactory.getTagSearchHtml(tag));
        child.data('tag', tag);
        this.search_tags.push(tag);
        this.tag_input_container.before(child);
    }

    addTagToContainer(tag) {
        this.tag_container.append(TemplateFactory.getTagItemHtml(tag));
    }

    formTagHint(e) {
        const target = $(e.currentTarget),
            value = target.val(),
            length = value.length,
            fTags = this.findTags(value);

        this.formHint(fTags);
        // if (value.indexOf(' ') < 0) {
        //     this.formHint(fTags);
        // } else {
        //     const tags = value.split(' ');
        //     tags.forEach( t => (t.length) ? this.addTag(t) : "");
        //     this.clearTagInput();
        // }
    }

    formHint(raw_tags) {
        if (raw_tags.length) {
            this.hint_list.html('');

            const children = [];

            raw_tags.forEach( parts => {
                const child = $(TemplateFactory.getHintHtml(parts));
                child.data('tag', parts.main+parts.unchecked);
                children.push(child);
            });

            children.forEach( ch => {
                this.hint_list.append(ch);
            });

            this.hint_container.addClass('active');
        } else {
            this.hint_container.removeClass('active');
            this.hint_list.html('');
        }
    }

    formTagsList(tags) {
        tags = tags || this.search_tags;

        this.tag_container.html('');
        tags.forEach( tag => {
            this.addTag(tag);
            this.addTagToContainer(tag);
        });
    }

    formData() {
        const data = {
            tags: this.search_tags || [],
            sign: (this.sign.val().length) ? this.sign.val() : 'Text',
            _id: (this.base && this.base._id) || this.UI.App.Project.base._id
        };

        return data;
    }

    setData(data) {
        localStorage.setItem('gen', data);
    }

    setPreloader() {
        this.container.html('');
        this.container.append(TemplateFactory.getPreloader());
    }

    setSign(sign) {
        sign = sign || this.sign_text;

        this._sign.text(sign);
        this.sign.val(sign);
    }

    setBase(base) {
        this.base = base;
    }

    findTags(part) {
        part = part.toLowerCase();

        if (part == '') {
            return [];
        }

        return this.tags.map( tag => {
            const subtag = tag.toLowerCase();
            let start = subtag.indexOf(part);

            if (start === 0 && !this.search_tags.find( t => t == subtag)) {
                return {
                    main: part,
                    unchecked: tag.slice(part.length)
                }
            }
        }).filter( t => t);
    }

    removeSearchTag(tag) {
        this.search_tags = this.search_tags.filter( t => t !== tag );
    }

    clearTagInput() {
        this.tag_input.val('');
        this.closeHint();
    }

    createBrand() {
        const data = this.formData();
        this.setData(JSON.stringify(data));
        location.href = '/mybrand.html';
    }

    openSection() {
        this.section.addClass('active');
    }

    closeSection() {
        this.section.removeClass('active');
    }

    closeHint() {
        this.hint_container.removeClass('active');
    }

    loadPrints() {
        const data = localStorage.getItem('gen');
        this.text = JSON.parse(data).sign;

        return new Promise( (resolve, reject) => {
            this.UI.App.Ajax.postJSON('/find/prints/by/tags', data, (response) => {
                response = JSON.parse(response);
                resolve(response.data)
            });
        });
    }

    loadTemplates(imageWidgetsCount) {
        const _id = JSON.parse(localStorage.getItem('gen'))._id;

        return new Promise( (resolve, reject) => {
            this.UI.App.Ajax.get(`/load/templates?_id=${_id}&imageWidgetsCount=${imageWidgetsCount}`, (response) => {
                response = JSON.parse(response);
                resolve(response.data);
            });
        });
    }

    async loadBrandPage() {
        const search_tags = JSON.parse(localStorage.getItem('gen')).tags;
        this.sign_text = JSON.parse(localStorage.getItem('gen')).sign;
        this.setSign();
        this.formTagsList(search_tags);

        this.prints = await this.loadPrints();
        this.templates = await this.loadTemplates(this.prints.length);

        await this.generateProjects();
    }

    generateRandomNumber(limit) {
        return Math.round(Math.random() * limit + 1);
    }

    async generateProjects() {
        const children = [],
            app = this.UI.App;

        let next_start = 0;

        for (const template of this.templates) {
            const length = this.prints.length;
            let count = 0,
                inner_count = 0;

            await app.setProject(template, false);

            for (let i = 0; i < this.prints.length; i++) {
                next_start++;

                if (next_start == length) {
                    next_start = 0;
                }

                inner_count = next_start;

                const child = $(TemplateFactory.getBrandProductHtml(template));

                for (const variant of app.Project.variants) {
                    await app.setCurrentVariant(variant);

                    const promises = variant.widgets.map(w => {
                        if (inner_count == length) {
                            inner_count = 0;
                            console.log('out');
                        }

                        if (w instanceof ImageWidget) {
                            const promise = variant.changeImageWidget(w.id, this.prints[inner_count]);
                            inner_count++;
                            return promise;
                        }

                        if (w instanceof TextWidget) {
                            w.text = this.text;
                            w.layer.text = this.text;
                        }
                    }).filter(w => w);

                    await Promise.all(promises);
                }

                await app.setCurrentVariant(app.Project.variants[0]);
                child.find('> img').attr('src', await app.getVariantPreview());
                child.data('brand', JSON.parse(JSON.stringify(app.Data.getProjectData())));
                children.push(child);
            }
        }

        this.container.html('');
        children.forEach( ch => this.container.append(ch));
    }

    editBrand(brand) {
    	const app = this.UI.App, 
    		data = app.Data.getProjectData(app.getProject(brand));

        this.UI.App.Ajax.postJSON('/temp/save?type=brand', JSON.stringify(data), (response) => {
            response = JSON.parse(response);
            const temp = response.data.temp;

            location.href = "/constructor?temp="+temp;
        });
        // localStorage.setItem('brand', JSON.stringify(brand));
        // location.href = "/constructor";
    }
}