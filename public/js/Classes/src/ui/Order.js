class Order {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.form_section = $('[name="userCredsForOrder"]');
        this.create_order = $('[name="createOrder"]');
        this.order_price = $('[name="orderPrice"] > span');
        this.cart = $('[name="userCart"]');

        this.table = $('[name="orderTableList_user"]');
        this.info = $('[name="orderInfo_user"]');
        this.order_status = this.info.find('.status__order > span');

        this.order_preview = $('[name="orderListContainer_user"]');
        this.order_customer_info = $('[name="orderCustomerInfo_user"]');

        this.orders_list_section = $('[name="orderOrdersList_order"]');
        this.orders_list_section_loader = this.orders_list_section.find('[name="orderSectionLoader_set"]');
        this.orders_preview_section = $('[name="orderOrderPreview_order"]');
        this.orders_preview_number = $('[name="textPreviewHeader_order"]');

        this.inputs = {
            credentials: this.form_section.find('#fio'),
            phone: this.form_section.find('#phone'),
            email: this.form_section.find('#email'),
            town: this.form_section.find('#town'),
            location: this.form_section.find('#address'),
            payOnPlace: this.form_section.find('[name="orderPayOnPlace"]'),
            payOnline: this.form_section.find('[name="orderPayOnline"]')
        }

        this.create_order.on('click', this.openOrderForm.bind(this));
        this.form_section.on('click', this.checkEvent.bind(this));
        this.orders_preview_section.on('click', this.checkEvent.bind(this));

        if (this.table.length) {
            this.offSectionLoader();
            this.loadUserOrders();
            this.setPreloader();
            this.table.on('click', this.checkEvent.bind(this));
        }
    }

    sendData(data, cb) {
        this.UI.App.Ajax.post('/order/set', data, cb);
    }

    loadUserOrders() {
        App.Ajax.get('/myOrders/load', (response) => {
            response = JSON.parse(response);

            this.formOrdersList(response.data);
        });
    }

    checkEvent(e) {
        e.stopPropagation();
        //e.preventDefault();

        const currentTarget = $(e.currentTarget);
        let target = $(e.target);

        if (target.is(currentTarget)) {
            this.closeOrderForm();

            return;
        }

        while (!target.is(currentTarget)) {
            if (target.hasClass('button__close')) {
                this.closeOrderForm();

                return;
            }

            if (target.attr('name') == 'acceptOrder') {
                e.preventDefault();
                this.acceptOrder();

                return;
            }

            if (target.attr('name') == "order__showLink") {
                e.preventDefault();
                const child = target.parent(),
                    order = child.data('order');

                this.closeOrdersList();
                this.openOrderPreview(order);
                this.showOrder(order);

                return;
            }

            if (target.hasClass('btn-back')) {
                e.preventDefault();

                this.closeOrderPreview();
                this.openOrdersList();

                return;
            }
            console.log('Cycle Order 1')
            target = target.parent();
        }
    }

    acceptOrder() {
        const data = {};
        let querystring = "";

        data.credentials = this.inputs.credentials.val();
        data.phone = this.inputs.phone.val();
        data.email = this.inputs.email.val();
        data.town = this.inputs.town.val();
        data.location = this.inputs.location.val();
        data.price = this.order_price.text();
        data.ordered = new Date().getTime();
        data.paytype = (this.inputs.payOnPlace.prop('checked')) ? 'onPlace' : 'online';

        data.cart = ([].map.bind(this.cart.children()))( (item, index) => {
            const project = $(item).data('item');
            project.amount = parseInt($(item).find('.quantity-num').val());

            return project;
        });

        //querystring = this.UI.App.Data.serialize(data);

        console.log(data);

        this.sendData(JSON.stringify(data), (response) => {
            response = JSON.parse(response);
            this.updateOrderForm();
            this.UI.Cart.emptyCartList();

            console.log(response);
            location.href = '/myOrders?number='+response.data.number;
        });
    }

    formOrdersList(orders) {
        const orderN = this.UI.App.parseURL();

        if (orderN && orderN.number) {
            this.order_status.text(orderN.number);
            this.info.addClass('active');
        } else {
            this.info.removeClass('active');
        }

        const children = [];

        orders.forEach( o => {
            const child = $(TemplateFactory.getOrderItemHtml(o));
            child.data('order', o);

            children.push(child);
        });

        this.table.html('');
        this.table.append(TemplateFactory.getOrderHeadHtml());
        children.forEach( ch => this.table.append(ch));
    }

    async formOrderPreview(order) {
        this.order_preview.html(TemplateFactory.getPreloader());

        this.setCustomerInfo(order);

        const children = [];
        const app = this.UI.App;

        for (let c of order.cart) {
            await app.setProject(c, false);
            const child = $(TemplateFactory.getOrderPreviewHtml(order, c));

            child.find('img').attr('src', await app.getVariantPreview());
            children.push(child);
        }

        this.order_preview.html('');
        children.forEach( ch => this.order_preview.append(ch));
    }

    setCustomerInfo(order) {
        this.order_customer_info.html(TemplateFactory.getCustomerInfoHtml(order));
    }

    setPreloader() {
        this.table.html('');
        this.table.append(TemplateFactory.getPreloader());
    }

    offSectionLoader() {
        this.orders_list_section_loader.addClass('off');
    }

    showOrder(order) {
        this.formOrderPreview(order)
    }

    openOrderForm() {
        this.updateOrderPrice();
        this.form_section.addClass('active');
    }

    openOrderPreview(order) {
        this.orders_preview_number.text(`Заказ №${order.number} (Отправлен)`);
        this.orders_preview_section.addClass('active');
    }

    openOrdersList() {
        this.orders_list_section.addClass('active');
    }

    updateOrderForm() {
        console.log('Need form changes');
    }

    updateOrderPrice() {
        this.order_price.text(this.UI.Cart.total.text());
    }

    closeOrderForm() {
        this.form_section.removeClass('active');
    }

    closeOrdersList() {
        this.orders_list_section.removeClass('active');
    }

    closeOrderPreview() {
        this.orders_preview_section.removeClass('active');
    }
}