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

        this.categories = [];


        this.userPrints.on('click', App.UI.onSelectPrint);
        this.gallery.on('click', App.UI.onSelectPrint);

        this.file.on('change', App.UI.onLoadImage);

        this.btnsOptions.on('click', this.changeGallery);


        this.userPrints.html('');
        this.loadSuitablePrints();
    }

    setGalleryData(data) {
        $.each(this.gallery.children(), (index, child) => {
            $(child).data('print', data[index]);
        });
    }

    setGallery() {

        this.gallery.html(
            this.UI.App.Data.Prints.reduce( (acc, print) => acc + TemplateFactory.getPrintHtml(print), `` )
        );
    }

    insertCategories(categories) {
        categories = categories || this.categories;
        const children = [];

        categories.forEach( category => {
            const child = $(TemplateFactory.getCategoryHtml(category)),
                printsContainer = child.find('.file__picture-category-container');

            category.prints.forEach( print => {
                const childItem = $(TemplateFactory.getCategoryItemHtml(print));
                childItem.data('print', print);
                printsContainer.append(childItem);
            });

            children.push(child);
        });

        this.gallery.html('');
        children.forEach( ch => this.gallery.append(ch));
    }

    formCategories(prints) {
        prints = prints || this.UI.App.Data.Prints;

        let uCategory = [];
        prints.map( print => {
            uCategory.find(category => print.category === category) || uCategory.push(print.category);
        });

        this.categories = uCategory.map( category => {
            return {
                title: category,
                prints: prints.filter( print => print.category === category)
            }
        });
    }

    loadSuitablePrints() {
        const app = this.UI.App;

        app.Ajax.getJSON('/find/prints/by/printType?types='+app.Project.base.getQueryStringPrintTypes())
            .then( response => {
                this.UI.App.Data.Prints = response.data.map((print) =>  Print.fromJSON(print));
                // this.setGallery();
                // this.setGalleryData(this.UI.App.Data.Prints);
                this.formCategories();
                this.insertCategories();
            })
            .catch(err => console.error(err));
    }


    reloadPrints() {
        this.UI.PrintsList.gallery && this.UI.PrintsList.loadSuitablePrints();
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