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
            $(child).on('click', this.emitBaseChange.bind(this));
        });

        if(container.length) {
            $('.slider__container').slick({
                dots: false,
                infinite: false,
                speed: 300,
                variableWidth: true,
                slidesToShow: 5,
                prevArrow: '<button type="button" class="slick-prev slider__button button button__left"></button>',
                nextArrow: '<button type="button" class="slick-next slider__button button button__right"></button>',
                slidesToScroll: 1,
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
        const target = $(e.target),
            currentTarget = $(e.currentTarget),
            base = $(currentTarget).data('base');

        if (target.hasClass('slider__btn-add')) {
            this.UI.App.getProjectOnBaseAsync(base)
                .then( project => this.UI.Profile.addToCartProject(project))
                .catch(err => console.log(err));
        } else {
            location.href = '/constructor?id='+base._id;
        }
    }
}