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

    ,getPreloader() {
        return `
            <div class="loader-container">
                <div class="loader"></div>
            </div>
        `
    }

    ,getHintHtml(parts) {
        return `
            <li class="hint-list__item">
                ${parts.main}<span class="text-rest">${parts.unchecked}</span>
            </li>
        `
    }

    ,getTagSearchHtml(tag) {
        return `
            <div class="brand__tag">
                <p>${tag}</p>
                <button class="brand__tag-close" name="brandTag_close"></button>
            </div>
        `
    }

    ,getStyleTag() {
        return (`
            <style rel="stylesheet" type="text/css" name="FONTS_FACES">
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

    ,getFavoritesListHtml(project, main_variant) {
        return `
            <div class="favorites__item">
                <img class="favorites__img" src="" alt="">
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
                        <div class="favorites__cart-page">
                            Товар добавлен
                            <a href="/cart.html" class="button favorites__to-cart">Перейти в корзину</a>
                        </div>
                        <button class="button favorites__remove">Убрать из избранного</button>
                    </div>
                </div>
            </div>
        `
    }

    ,getProjectsListHtml(project, main_variant) {
        return `
            <div class="slider__item">
                <a href="#" class="slider__link">
                    <img class="slider__item-img" src="${project.base.variants[0].src}" alt="">
                    <p class="slider__item-type">${project.base.type}</p>
                    <span class="slider__item-name">
                        ${project.base.name}
                        <div class="type__basis">
                            ${ (project.base.print == "true") ? '<p class="type__basis-paint" title="Печать"></p>' : "" }
                            ${ (project.base.fancywork == "true") ? '<p class="type__basis-needle" title="Вышивка"></p>' : "" }
                        </div>
                    </span>
                    <p class="slider__item-price">${project.base.price} P</p>
                    <div class="slider__buttons">
                        <button class="button slider__btn-edit button_gradient_yellow"></button>
                        <button class="button slider__btn-add button_gradient_blue">В корзину</button>
                    </div>
                </a>
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

    ,getAdminPanelTagHtml(tag) {
        return `<div class="tags-container__item">
                    <span class="tags-container__value">${tag}</span>
                    <button class="tags-container__close"></button>
                </div>`;
    }

    ,getAdminPanelPrintItemHtml(print) {
        return `<div class="prints__item" name="printItem">
                    <img src="${print.src}" alt="">
                    <h4 class="prints__item-name">${print.name}</h4>
                    <p class="prints__item-tags">
                        ${print.tags.join(', ')}
                    </p>
                    <button class="btn__print-remove"></button>
                </div>`
    }

    ,getCartItemSizeHtml(size) {
        return `
            <div class="item__size">${size}</div>
        `
    }

    ,getCartItemHtml(item) {
        return `
            <div class="cart__item">
                <img src="" alt="">
                <div class="cart__description">
                    <p class="cart__name">${item.base.name}</p>
                    <div class="cart__size">
                        <p>Размеры: </p>
                        <div class="item__size">${ this.getCartItemSizeHtml(item.settings.size || item.base.size[0])}</div>
                    </div>
                    <div class="cart__color">
                        <p>Цвет:</p>
                        <div class="item__color" style="background-color: ${ (typeof item.settings.color === 'object') ? "rgb("+item.settings.color.join(',')+")" : (typeof item.settings.color === 'string') ? item.settings.color : item.settings.startColor};"></div>
                    </div>
                </div>
                <div class="quantity-block">
                    <button class="quantity-arrow-minus"> - </button>
                    <input class="quantity-num" type="number" value="1">
                    <button class="quantity-arrow-plus"> + </button>
                </div>
                <p class="cart__price">${item.base.price} <span>P</span></p>
                <button class="cart__remove-btn" name="removeFromCart"></button>
            </div>
        `
    }

    ,getOrderHeadHtml() {
        return `
            <tr class="header-row table__tr">
                <th class="table__th">№</th>
                <th class="table__th">Дата заказа</th>
                <th class="table__th">Статус</th>
                <th class="table__th">Сумма</th>
                <th class="table__th"></th>
            </tr>
        `
    }

    ,getOrderItemHtml(order) {
        const time = parseInt(order.info.ordered);

        return `
            <tr class="table__row">
                <td class="table__td" name="order__number">${order.number}</td>
                <td class="table__td" name="order__date">${new Date(time).toLocaleDateString()} ${new Date(time).toLocaleTimeString()}</td>
                <td class="table__td" name="order__status">${order.status}</td>
                <td class="table__td order__price" name="order__price">${order.info.price} руб</td>
                <td class="table__td" name="order__showLink">
                    <a href="#" name="orderShow_user">Просмотреть</a>
                </td>
            </tr>
        `
    }

    ,getAdminPanelOrderHeadHtml() {
        return `
            <tr class="o_tr-head">
                <th class="o_th th_number">№</th>
                <th class="o_th th_date">Дата заказа</th>
                <th class="o_th th_status">Статус</th>
                <th class="o_th th_price">Сумма</th>
                <th class="o_th th_link"></th>
            </tr>
        `
    }

    ,getAdminPanelOrderItemHtml(order) {
        const time = parseInt(order.info.ordered);

        return `
            <tr class="o_tr">
                <td class="o_td td_number">${order.number}</td>
                <td class="o_td td_date">${new Date(time).toLocaleDateString()} ${new Date(time).toLocaleTimeString()}</td>
                <td class="o_td td_status">${order.status}</td>
                <td class="o_td td_price">${order.info.price} руб</td>
                <td class="o_td td_link">
                    <a href="#" class="link__table">Просмотреть</a>
                </td>
            </tr>
        `
    }

    ,getOrderPreviewHtml(order, product) {
        const prodColor = product.settings.color || product.settings.startColor;
        let color = [];

        if (prodColor.indexOf('#') >= 0) {
            color = App.GraphCore.Filter.hexToRgb(prodColor);
            color = Object.assign([], Object.values(color)).join(',');
        } else {
            if (prodColor instanceof Array) {
                color = prodColor.join(',');
            }
        }

        const rgb = color.replace(/[^0-9,]/gm, '').split(',').map(c => parseInt(c));

        return `
            <div class="order__item">
                <img src="" alt="">
                <div class="order__description">
                    <p class="order__name">${product.base.name}</p>
                    <div class="order__size">
                        <p>Размеры: </p>
                        <p>${product.settings.size || product.base.size[0]}</p>
                    </div>
                    <div class="order__color">
                        <p>Цвет: </p>
                        <div class="item__color" style="background-color: rgb(${rgb.join(',')})"></div>
                    </div>
                </div>
                <div class="order__count">
                    <p> <span>${product.amount}</span> шт. </p>
                </div>
                <p class="order__price">${product.amount * parseInt(product.base.price)} <span>P</span></p>
            </div>
        `
    }

    ,getAdminPanelProductPreviewInfoHtml(order, product) {
        const prodColor = product.settings.color || product.settings.startColor;
        let color = [];

        if (prodColor.indexOf('#') >= 0) {
            color = App.GraphCore.Filter.hexToRgb(prodColor);
            color = Object.assign([], Object.values(color)).join(',');
        } else {
            if (prodColor instanceof Array) {
                color = prodColor.join(',');
            }
        }

        const rgb = color.replace(/[^0-9,]/gm, '').split(',').map(c => parseInt(c));

        return `
            <div class="cart__item">
                <img src="img/basis/2.jpg" alt="">
                <div class="cart__description">
                    <p class="cart__name">
                        ${product.base.name} Заказ (№<span class="order__number">${order.number}</span>)
                    </p>
                    <div class="cart__size">
                        <p>Размеры: </p>
                        <p>${product.settings.size || product.base.size[0]}</p>
                    </div>
                    <div class="cart__color">
                        <p>Цвет: </p>
                        <div class="item__color" style="background-color: rgb(${rgb.join(',')})"></div>
                        <p class="cmyk">CMYK (${ App.GraphCore.Filter.RgbToCmyk(rgb[0], rgb[1], rgb[2]).map( cmyk => Math.ceil(cmyk*100)).join(' ') })</p>
                    </div>
                    <div class="order__status">
                        <p>Статус: </p>
                        <p name="orderCartStatus_order">${product.status || 'В обработке'}</p>
                        <div class="panel__column-item-radio font__radio order__tab-status">
                            <label class="panel__type-picture">
                                <input class="style-ratio product_status" type="radio" value="Готово" name="${product.cart_id}" ${(product.status == 'Готово') ? 'checked' : ""}>
                                Готово
                            </label>
                            <label class="panel__type-picture">
                                <input class="style-ratio product_status" type="radio" value="Ожидает" name="${product.cart_id}" ${(product.status == 'Ожидает') ? 'checked' : ""}>
                                Ожидает
                            </label>
                            <label class="panel__type-picture">
                                <input class="style-ratio product_status" type="radio" value="В обработке" name="${product.cart_id}" ${(product.status == 'В оработке' || !product.status) ? 'checked' : ""}>
                                В обработке
                            </label>
                        </div>
                    </div>
                </div>
                <div class="count">
                    <p>${product.amount} <span>шт.</span> </p>
                </div>
                <p class="cart__price">${product.amount * parseInt(product.base.price)} <span>P</span></p>
        `

    }

    ,getTextLayerHtml(widget) {
        let color = [];

        if (widget.color.indexOf('#') >= 0) {
            let hexRgb = App.GraphCore.Filter.hexToRgb(widget.color);
            Object.assign(color, Object.values(hexRgb));
            color = color.join(',');
        } else {
            color = widget.color;
        }

        const rgb = color.replace(/[^0-9,]/gm, '').split(',').map( c => parseInt(c));

        const font = App.Data.Fonts.find( f => f.name = widget.fontSettings.fontFamily);

        return `
            <div class="order__layer-item">
                <p class="layer__text">${widget.layer.text}</p>
                ${(font.fancywork == "true" || !(font.print == 'true')) ?`<div class="application__type needle"></div>` : ""}
                ${(font.print == "true")? `<div class="application__type paint"></div>` : ""}
                    <p class="layer__text-size">${widget.fontSettings.fontSize}</p>
                <div class="layer__color" style="background-color: ${widget.color};"></div>
                <p class="color__cmyk">CMYK (${App.GraphCore.Filter.RgbToCmyk(rgb[0], rgb[1], rgb[2]).map( c => Math.ceil(c*100)).join(' ')})</p>
                <button class="button button__layer-info"></button>
                <div class="layer__info">
                    <div class="layer__info-item">
                        <span>Полный текст:</span>
                        <span class="layer__full-text">${widget.layer.text}</span>
                    </div>
                    <div class="layer__info-item">
                        <span>Шрифт:</span>
                        <span class="layer__font-family">${widget.fontSettings.fontFamily}</span>
                    </div>
                </div>
            </div>
        `
    }

    ,getImageLayerHtml(widget) {
        const print = App.Data.Prints.find( p => p.text == widget.layer.text) || {};
        return `
            <div class="order__layer-item layer__img-item">
                <div class="layer__img">
                    <img src="${widget.src}" alt="">
                </div>
                ${(print.fancywork == "true" || !(print.print == 'true')) ?`<div class="application__type needle"></div>` : ""}
                ${(print.print == "true") ? `<div class="application__type paint"></div>` : ""}
                    <a href="${widget.src}" download class="layer__img-link">Скачать</a>
                <button class="button button__layer-info"></button>
                <div class="layer__info">
                    <div class="layer__info-item">
                        <span>Полный текст:</span>
                        <span class="layer__full-text">${widget.layer.text}</span>
                    </div>
                    <div class="layer__info-item">
                        <span>Шрифт:</span>
                        <span class="layer__font-family">Lato</span>
                    </div>
                </div>
            </div>
        `
    }

    ,getAdminPanelVariantsPreview() {
        return `
            <div class="constr__item-templ">
                ${this.getImageHtml()}
            </div>
        `
    }

    ,getAdminPanelOrderPreviewHtml(order, product) {
        return `
                ${this.getAdminPanelProductPreviewInfoHtml(order, product)}
                <div class="order__description">
                        <div class="product-work-zone">
                            <div class="order__image-list" name="orderImagePreview_order">
                                ${ product.variants.reduce((acc) => acc + this.getAdminPanelVariantsPreview(), `` ) }
                                </div>
                                <div class="order__main-img">
                                    ${this.getImageHtml()}
                                    <!--<div class="loader-container">-->
                                        <!--<div class="loader"></div>-->
                                    <!--</div>-->
                                </div>
                            </div>
                                
                                <div class="panel__right-side-create order__layers" name="orderItemLayers_order">
                                    
                                </div>
                                
                            </div>
                            
                        <div class="order__info-btn">
                            <button class="button btn__open-close order__btn-show">Подробнее</button>
                            <button class="button btn__open-close order__btn-hide">Свернуть</button>
                        </div>
                    </div>
`
    }

    ,getCustomerInfoHtml(order) {
        const info = order.info;
        return `
            <div class="customer__field">
                <p>Ф.И.О:</p>
                <p name="fio">${ (info.credentials) ? info.credentials : ""}</p>
            </div>
            <div class="customer__field">
                <p>Телефон:</p>
                <p name="phone">${ (info.phone) ? info.phone : ""}</p>
            </div>
            <div class="customer__field">
                <p>Адрес:</p>
                <p name="address">${ (info.location) ? info.location : ""}</p>
            </div>
            <div class="customer__field">
                <p>Доставка:</p>
                <p name="delivery">${ (info.delivery) ? info.delivery : "Почтой"}</p>
            </div>
            <div class="customer__field">
                <p>Email:</p>
                <p name="email">${ (info.email) ? info.email : ""}</p>
            </div>
            <div class="customer__field">
                <p>Город:</p>
                <p name="town">${ (info.town) ? info.town : ""}</p>
            </div>
            <div class="customer__field">
                <p>Оплата:</p>
                <p name="payment">${ (info.paytype) ? info.paytype : ""}</p>
            </div>
            <div class="customer__field">
                <p>Итог:</p>
                <p name="total" style="font-weight:700;font-size:18px;">${ (info.price) ? info.price : "0"} <span>P</span></p>
            </div>
        `
    }

    ,getAdminPanelCustomerInfoHtml(info) {
        return `
            <div class="field__customer">
                <span>Ф.И.О: </span>
                <span>${ (info.credentials) ? info.credentials : ""}</span>
            </div>
            <div class="field__customer">
                <span>Email: </span>
                <span>${ (info.email) ? info.email : ""}</span>
            </div>
            <div class="field__customer">
                <span>Телефон: </span>
                <span>${ (info.phone) ? info.phone : ""}</span>
            </div>
            <div class="field__customer">
                <span>Город: </span>
                <span>${ (info.town) ? info.town : ""}</span>
            </div>
            <div class="field__customer">
                <span>Адрес: </span>
                <span>${ (info.location) ? info.location : ""}</span>
            </div>
            <div class="field__customer">
                <span>Оплата: </span>
                <span>${ (info.paytype) ? info.paytype : ""}</span>
            </div>
            <div class="field__customer">
                <span>Доставка: </span>
                <span>${ (info.delivery) ? info.delivery : "Почтой"}</span>
            </div>
            <div class="field__customer">
                <span>Итог: </span>
                <span>${ (info.price) ? info.price : "0"} Р</span>
            </div>
        `
    }

}