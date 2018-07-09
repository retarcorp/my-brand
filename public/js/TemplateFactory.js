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
            <option style="font-family: '${font.name}';">${font.name}</option>
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

    ,getPrintHtml(print, isLoad) {
        return (`
            <div class="picture-list__picture picture-list__picture_margin">
                <img src="${print.src}" alt="" class="picture__img">
                <div class="picture-btns">
                    <button class="button picture__button picture__clone button_gradient_blue">Дублировать</button>
                    ${(!isLoad) ? `` : `<button class="button picture__button picture__remove">Удалить</button>`}
                </div>
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
            font-family: '${font.name || font.font}';
            src: url('${font.src}');
        } \n`
    }

    ,getLinkHtml(link, ref) {
        return `<link rel="${ref}" href="${link}">`
    }

    ,getSizeHtml(size) {
        return `
            <label class="size__block size__block_margin" data-size="${size}">
                <input class="size__radio" type="radio" name="size">
                <span class="size__radio-custom">${size}</span>
            </label>
        `;
    }

    ,getTextColorHtml() {
        return `
            <input type="hidden" value="" id="_color__text">
        `
    }

    ,getLoginHtml() {
        return `
            <form class="login">
                <input type="text" name="user">
                <input type="password" name="pass">
                <input type="submit">
            </form>
        `
    }

    ,getAdminPanelFontshtml(font) {
        return `
            <li class="panel__font-point" data-type="font">
                <div class="panel__font-type">
                    <p style="font-family: ${font.font};">${font.font}</p>
                    <span>${font.font}</span>
                </div>
                
                <div class="panel__font-delete" data-src="${font.src}"></div>
            </li>
        `
    }

    ,getAdminPanelFontFileInput() {
        return `<input type="file" name="font_file" data-after="Выберите файл">`;
    }

    ,getAdminPanelPages(page) {
        return `
            <li class="panel__page-point ${ (page == 1) ? "selected" : "" }">
                <span class="panel__page-num">${page}</span>
            </li>
        `
    }

    ,getLogoutHtml() {
        return `<li class="main-menu__item main-menu__item_margin logout">
                    <a href="#" class="main-menu__link text_color_main">Выход</a>
                </li>`
    }

    ,getAdminPanelBaseVariantHtml(src) {
        return `
            <div class="panel__uploaded-pic">
                <button class="panel__uploaded-remove"></button>
                <img src="${src}">
                <div class="panel__uploaded-name">Главная</div>
            </div>
        `
    }

    ,getAdminPanelBaseVariantUploadHtml() {
        return `
            <div class="panel__uploaded-pic-add inactive">
                <img src="img/admin-panel/camera.png" alt="">
                <label for="new-basis">
                    <input class="panel__file-add" type="file" id="new-basis">
                    <span class="panel__file help-layout">Добавить</span>
                </label>
            </div>
        `
    }

    ,getAdminPanelSizeHtml(size) {
        return `
            <div class="size-container__item">
                <span class="size-container__value">${size}</span>
                <button class="size-container__close"></button>
            </div>
        `
    }

    ,getAdminPanelBaseListPointHtml(base, main_variant) {
        return `
            <li class="panel__basis-item">
                <div class="panel__basis-img">
                    <img src="${main_variant.image}" alt="">
                </div>
                <div class="panel__basis-description">
                    <p class="panel__basis-name">${base.name}</p>
                    <p class="panel__basis-type">${base.type} - ${ (base.fancywork == "true") ? "вышивка" : "" } ${(base.fancywork == "true" && base.print == "true") ? "," : "" } ${ (base.print == "true") ? "принт" : "" }</p>
                    <p class="panel__basis-price">${base.price} Р</p>
                </div>
                <div class="panel__basis-button">
                    <button class="panel__basis-edit">Редактировать</button>
                    <button class="panel__basis-remove">Удалить</button>
                </div>
            </li>
        `
    }

    ,getProjectsListHtml(project, main_variant) {
        return `
            <div class="favorites__item">
                <img class="favorites__img" src="img/1.png" alt="">
                <div class="info">
                    <p class="favorites__type">${project.base.type}</p>
                    <p class="favorites__name">${project.base.name}</p>
                    <p class="favorites__price">${project.base.price} P</p>
                </div>
                <div class="favorites__buttons">
                    <button class="button favorites__edit">
                        Изменить
                        <img src="img/icon/paintbrush.png" alt="">
                    </button>
                    <div class="favorites__hover">
                        <button class="button favorites__buy">В корзину</button>
                        <button class="button favorites__remove">Убрать из избранного</button>        
                    </div>
                </div>
            </div>
        `
    }

}