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
        //this.formFontsList();
        this.setFontsData();
        this.loadSuitableFonts();
    }

    setFontsData() {
        $.each(this.container.children(), (index, child) => {
            $(child).data('font', App.Data.Fonts[index]);
        });
    }

    formFontsList(Fonts) {
        this.container.html(
            this.UI.App.Data.Fonts.reduce((acc, font) => acc + TemplateFactory.getFontHtml(font),``)
        );

        const that = this;

        $('select#selectbox1').each(function () {

            // Cache the number of options
            var $this = $(this),
                numberOfOptions = $(this).children('option').length;

            // Hides the select element
            $('.editor__fonts').after($this);
            $('.select').remove();
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
                li.css('font-family', App.Data.Fonts[i].name);
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

            that.list = $list;
        });
    }

    injectFont() {
        $('head').append(TemplateFactory.getStyleTag('FONTS_FACES'));
        $('head').append(TemplateFactory.getStyleTag('WIDGETS_FONTS'));
        //this.UI.App.fontStyle = $('[name="FONTS_FACES"]')
    }

    setFont(font) {
        const curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            if (document.fonts.check('12px '+ font.name)) {
                curr.fontSettings.fontFamily = font.name;
                curr.fancywork = font.fancywork == 'true';
                curr.print = font.print == 'true';
                curr._3D = font._3D == 'true';
            } else {
                this.addFont(font)
                .then( () => {
                    curr.fontSettings.fontFamily = font.name;
                    curr.fancywork = font.fancywork == 'true';
                    curr._3D = font._3D == 'true';
                    curr.print = font.print == 'true';
                })
                .catch(err => console.error(err));
            }
        }
    }

    insertFontFace() {

    }

    createFontFace(fontName, fontAsArrayBuffer) {
        return new FontFace(fontName, fontAsArrayBuffer);
    }

    readFontAsArrayBuffer(fontBlob) {
        return this.UI.App.Data.readAsArrayBuffer(fontBlob);
    }

    addFont(font) {
        return new Promise( (rsv, rej) => {
            App.Ajax.getBlob(font.src, (response) => {
                this.readFontAsArrayBuffer(response)
                    .then(fontArrayBuffer => {
                        const fontFace = this.createFontFace(font.font || font.name, fontArrayBuffer);
                        fontFace.loaded
                            .then( () => {
                                document.fonts.add(fontFace);
                                rsv();
                            })
                            .catch( (err) => rej(err));
                    })
                    .catch(err => {
                        console.error(err);
                        rej();
                    });
            });
        });
    }

    checkFont(font) {
        if (!(App.fontStyle.text().indexOf(font.font) >= 0)) {
            this.loadFont(font.font, (response) => {
                response = JSON.parse(response);
                font = response.data;

                if(!(font instanceof Array)) {
                    this.addFont(font);
                }
            });
        }
    }

    checkFontInStyle(font) {
        return App.fontStyle.text().indexOf(font.font) >= 0;
    }

    async loadSuitableFonts() {
        const queryTypes = this.UI.App.Project.base.getQueryStringPrintTypes();
        await this.loadFontsByPrintTypes(queryTypes, 20)
            .then( response => {
                const fonts = response.data.map((font) => {
                    document.fonts.check('12px '+font.font) || this.addFont(font);
                    return Font.fromJSON(font);
                });

                this.UI.App.Data.Fonts = [];
                this.UI.App.Data.Fonts.push(...fonts);
                this.formFontsList();
            })
            .catch(err => console.error(err));;
    }

    loadFontsByPrintTypes(queryTypes, limit) {
        return this.UI.App.Ajax.getJSON('/find/fonts/by/printType?types='+queryTypes+'&limit='+limit);
    }

    loadFont(font, cb) {
        App.Ajax.get('/find/font/by/name?font='+font, cb);
    }

    reloadFonts() {
        this.UI.FontsList.container && this.UI.FontsList.loadSuitableFonts();
    }

    getFont(e) {
        const curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            curr.fontSettings.fontFamily = $(e.target.options[e.target.selectedIndex]).data('font').name;
        }
    }
}