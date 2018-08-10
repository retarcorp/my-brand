class Order {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.form_section = $('[name="userCredsForOrder"]');
        this.create_order = $('[name="createOrder"]');
        this.order_price = $('[name="orderPrice"] > span');

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
    }

    sendData(data, cb) {
        this.UI.App.Ajax.post('/order/set', data, cb);
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

        querystring = this.UI.App.Data.serialize(data);

        this.sendData(querystring, (response) => {
            response = JSON.parse(response);
            this.updateOrderForm();
            this.UI.Cart.emptyCartList();

            console.log(response);
        });
    }

    openOrderForm() {
        this.updateOrderPrice();
        this.form_section.addClass('active');
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
}