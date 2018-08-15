class Brand {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.form = $('.new-brand__form');

        this.open_section = $('.create__button-create');
        this.section = $('.new-brand__create');

        this.hint_list = $('.brand__hint-list');
        this.hint_container = $('.new-brand__hint-container');

        this.tag_input = $('[name="brandTagInput_tag"]');
        this.tag_input_container = $('[name="brandTagContainer_tag"]');

        this.tags = [];
        this.search_tags = [];

        if (this.section.length) {
            this.UI.App.Ajax.get('/load/tags', (response) => {
                response = JSON.parse(response);

                this.tags = response.data.tags;
            });


            this.tag_input.on('input', this.formTagHint.bind(this));
            this.tag_input.on('focus', this.formTagHint.bind(this));

            this.section.on('click', this.checkEvent.bind(this));
            this.open_section.on('click', this.openSection.bind(this));
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

            target = target.parent();
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

    formTagHint(e) {
        const target = $(e.currentTarget),
            value = target.val(),
            length = value.length,
            fTags = this.findTags(value);

        if (value.indexOf(' ') < 0) {
            this.formHint(fTags);
        } else {
            const tags = value.split(' ');
            tags.forEach( t => (t.length) ? this.addTag(t) : "");
            this.clearTagInput();
        }
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

    openSection() {
        this.section.addClass('active');
    }

    closeSection() {
        this.section.removeClass('active');
    }

    closeHint() {
        this.hint_container.removeClass('active');
    }
}