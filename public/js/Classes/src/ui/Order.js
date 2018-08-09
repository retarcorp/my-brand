class Order {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.form_section = $('[name="userCredsForOrder"]');
        this.create_order = $('[name="createOrder"]');

        this.create_order.on('click', this.openOrderForm.bind(this));
        this.form_section.on('click', this.checkEvent.bind(this));
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
                this.acceptOrder();

                return;
            }

            target = target.parent();
        }
    }

    acceptOrder() {
        console.log('Need orderAccept functionality');
    }

    openOrderForm() {
        this.form_section.addClass('active');
    }

    closeOrderForm() {
        this.form_section.removeClass('active');
    }
}