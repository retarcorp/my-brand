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