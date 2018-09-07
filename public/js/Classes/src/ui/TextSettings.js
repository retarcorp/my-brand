class TextSettings {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.inputs = {
            widgetText: $('.editor__text-input'),
            textSize: $('.size__input'),
            color: $('#_color__text')
        };

        this.color_picker = $('.color-picker');
        this.color_button = $('.color-pick');

        this.colorView = $('.editor__color');

        this.btnsStyle = $('.decoration__button');


        this.inputs.widgetText.on('input', this.UI.onChangeText);

        this.inputs.textSize.on('input', this.UI.onSize);

        this.color_button.on('click', this.toggleTextColorPicker.bind(this));
        this.color_picker.on('click', this.UI.onColor);
        this.inputs.color.on('change', this.UI.onColor);

        //this.btnsStyle.on('click', App.UI.onStyle);
    }

    setSettings() {
        const curr = App.GraphCore.currentWidget;

        if (curr instanceof TextWidget) {
            this.colorView.css('backgroundColor', curr.color);
            this.inputs.color.css("backgroundColor", curr.color);
            this.inputs.color.val(curr.color);
            this.inputs.textSize.val(curr.fontSettings.fontSize);
            this.inputs.widgetText.val(curr.text);
        }
    }

    toggleTextColorPicker() {
        this.color_picker.toggleClass('active');
    }

    closeTextColorPicker() {
        this.color_picker.removeClass('active');
    }

    closeColorPicker(e) {
        const target = $(e.target);

        if (!this.color_picker.has(target).length && !this.color_picker.is(target) && !target.is(this.color_button) && !target[0]._jscInstance) {
            this.closeTextColorPicker();
        }
    }
}