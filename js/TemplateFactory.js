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
                    <button class="button picture__button picture__clone button_gradient_blue">Добавить</button>
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
            <div class="panel__basis" data-id="${layer.id}">
                <div class="panel__basis-text">${layer.text}</div>

                <input type="checkbox" class="panel__template-layer-config" name="template_config-layer" ${ (layer.config) ? "checked" : "som"}>

                <div class="panel__basis-btns">
                    <button class="basis-btn button button-remove"></button>
                    <button class="basis-btn button"></button>
                </div>
            </div>
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
            <li class="panel__page-point">
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
                    <span class="panel__basis-name">
                        ${base.name}
                        <div class="type__basis">
                            ${ (base.print == "true") ? '<p class="type__basis-paint" title="Печать"></p>' : "" }
                            ${ (base.fancywork == "true") ? '<p class="type__basis-needle" title="Вышивка"></p>' : "" }
                        </div>
                    </span>

                    <p class="panel__basis-type">${base.type} </p>
                    <p class="panel__basis-price">${base.price} Р</p>
                </div>
                <div class="panel__new-template">
                    <button class="panel__basis-add-templ">Добавить шаблоны</button>
                </div>
                <div class="panel__basis-button active">
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

    ,getAdminPanelTemplateListPointHtml(template) {
        return `
            <li class="panel__templ-item">
                <h1 class="template__header">${template.name}</h1>
                <div class="panel__turn-container" name="templateImageContainer">
                    
                </div>
                <div class="panel__templ-button">
                    <button class="panel__templ-edit" name="templateRedact">Редактировать</button>
                    <button class="panel__templ-remove" name="templateDelete">Удалить</button>
                </div>
            </li>
        `
    }

    ,getSliderSlideHtml(base) {
        return `
            <div class="slider__item">
                <a href="#" class="slider__link">
                    <img class="slider__item-img" src="${base.variants[0].src}" alt="">
                    <p class="slider__item-type">${base.type}</p>
                    <span class="slider__item-name">
                        ${base.name}
                        <div class="type__basis">
                            ${ (base.print == "true") ? '<p class="type__basis-paint" title="Печать"></p>' : "" }
                            ${ (base.fancywork == "true") ? '<p class="type__basis-needle" title="Вышивка"></p>' : "" }
                        </div>
                    </span>
                    <p class="slider__item-price">${base.price} P</p>
                    <div class="slider__buttons">
                        <button class="button slider__btn-edit button_gradient_yellow"></button>
                        <button class="button slider__btn-add button_gradient_blue">В корзину</button>
                    </div>
                </a>
            </div>
        `
    }

    ,getAdminPanelVariantTemplates() {
        return `
             <div class="panel__template">
                <img src="" alt="">
            </div>
        `
    }

    ,getAdminPanelTemplateAddHtml(variant, templates, index) {
        console.log(variant);
        const template = templates.find( t => t.index == index );
        return `
            <div class="template__basis">
                <div class="basis__img">
                    <img src="${variant.src}" alt="">
                </div>
                ${ (template) ?`<div class="panel__templ-container Scrollable">${template.variants.reduce( (acc, t) => acc + this.getAdminPanelVariantTemplates(t), ``)} </div>` : "" }
                <button class="template__btn-add"></button>
            </div>
        `
    }

    ,getVariantsHtml() {
        return `
            <div class="constr__item-templ">
                <img src="">
            </div>
        `
    }

    ,getImageHtml(src) {
        return `
            <img src="${src}">
        `
    }

}