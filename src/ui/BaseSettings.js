class BaseSettings {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.color = $('.details__color');
        this.dynamic_color = $('#base_color');

        this.dynamic_color.on('change', this.UI.onBaseColor);
        this.color.on('click', this.UI.onBaseColor);
    }
}