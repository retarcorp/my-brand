/**
 * TemplateFactory - формирует шаблоны контента.
 * @constant
 */

const TemplateFactory = {

    /**
     * Принимает основу и отправляет сформированную строку HTML.
     * @function
     * @param {Base} base - Основа
     * @returns {string}
     */

    getBaseHtml(base){
        return `
        <div class="img-slider basis-img">
            <img src="${base.getPreviewImage()}" alt="">
        </div>`;
    }

    ,getBaseColorHtml(color) {
        return `<input class="color" style="background-color: ${color};" readonly data-color="${color}">`;
    }

    /**
     * Принимает шрифт и отправляет сформированную строку HTNL.
     * @param {Font} font - Шрифт
     * @returns {string}
     */

    ,getFontHtml(font){
        return `
            <li>
                <p class="text-value" style="font-family: '${font.name}';">MyLittlePonny</p>
                <p class="font-name">${font.name}</p>
            </li>
            `
    }

    ,getStyleTag() {
        return (`
            <style rel="stylesheet" type="text/css">
                ${App.Data.Fonts.reduce((acc, font)=> acc + TemplateFactory.getFontStyle(font), ``)}
            </style>
            `);
    }

    ,getBaseVariantHtml(variant) {
        return (`
            <div class="img-slider in-maintain">
                 <img src="${variant.src}" alt="">
             </div>
        `);
    }

    ,getPrintHtml(print) {
        return (`
            <div class="print-img" name="${print.text}">
                <img src="${print.src}" alt="${print.text}">
            </div>
        `);
    }

    ,getFileInputHtml() {
        return `<input type="file">`;
    }

    ,getLayerHtml(layer) {
        return (`
            <li class="${layer.type} layer" data-id="${layer.id}">
                <p class="content">${layer.text}</p>
                <p class="layer_btns">
                    <button class="to-top__layer"></button>
                    <button class="to-bottom__layer"></button>
                    <button class="delete__layer"></button>
                </p>
            </li>
        `);
    }

    /**
     * Принимает шрифт и отправляет сформированный стиль CSS.
     * @param {Font} font - Шрифт
     * @returns {string}
     */

    ,getFontStyle(font){
        return `
        @font-face {
            font-family: '${font.name}';
            src: url('${font.src}');
        } \n`
    }

    ,getLinkHtml(link, ref) {
        return `<link rel="${ref}" href="${link}">`
    }

}