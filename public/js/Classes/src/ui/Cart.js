class Cart {
     constructor(ui) {
         this.UI = ui;
     }

     init() {
         this.container = $('[name="userCart"]');
         this.total = $('.total__price').children(':first-child');
         this.create_order = $('[name="createOrder"]');

         if (this.container.length) {
             this.loadCart();
             this.container.on('click', this.checkEvent.bind(this));
         }
     }

     checkEvent(e) {
         const currentTarget = $(e.currentTarget);
         let target = $(e.target);

         while (!target.is(currentTarget)) {
             if (target.attr('name') == 'removeFromCart') {
                 const item = target.parent(),
                     cart_id = item.data('item').cart_id;

                 this.removeFromCart(cart_id, item);
                 break;
             }

             if (target.hasClass('quantity-arrow-plus') || target.hasClass('quantity-arrow-minus')) {
                 const card = target.parent(),
                     item = card.data('item'),
                     amount = card.find('.quantity-num'),
                     value = parseInt(amount.val());

                 if (target.hasClass('quantity-arrow-plus')) {
                     amount.val(value + 1);
                 } else {
                    if (!(value - 1 <= 0)) {
                        amount.val(value - 1);
                    }
                 }

                 this.recountPrice();
                 break;
             }
             console.log('Cycle Cart 1')
             target = target.parent();
         }
     }

     loadCartListAll(cb) {
         this.UI.App.Ajax.get('/cart/load', cb);
     }

     loadCartListPage(page = 1, cb) {
         if (typeof page === 'function') {
             cb = page;
             page = 1;
         }

         this.UI.App.Ajax.get('/cart/load?page='+page, cb);
     }

     loadCart() {
         this.setAwaitLoading();
         this.loadCartListAll( (response) => {
             response = JSON.parse(response);

             if (!response.data.length) {
                 this.hideOptions();
             }

             this.formCartList(response.data);
             // this.formPageList(response.pages);
             this.unsetAwaitLoading();
         });
     }

    async formCartList(list) {
         const app = this.UI.App;
         const children = [];

         //this.setPreloader();

         for (let item of list) {
             await App.setProject(item, false);
             const child = $(TemplateFactory.getCartItemHtml(item));

             child.data('item', item);
             child.find('.quantity-num').on('input', this.recountPrice.bind(this));
             child.find('img').attr('src', await app.getVariantPreview());
             child.find('.quantity-num').val(item.amount || 1);

             children.push(child);
         }

         this.container.html('');
         children.forEach( ch => this.container.prepend(ch));

         this.recountPrice();
    }

    hideOptions() {
         this.create_order.remove();
         this.total.remove();
    }

    emptyCartList() {
         this.container.html('');
    }

    removeFromCart(cart_id, card) {
         App.Ajax.get('/delete/cart?cart_id='+cart_id, (response) => {
             response = JSON.parse(response);

             const amount = this.UI.Profile.cart_amount.text();
             this.UI.Profile.setCartAmount(amount-1);

             card.remove();
             this.recountPrice();
             if (!this.container.children().length) {
                 this.hideOptions();
             }
         });
    }

    recountPrice() {
         const child_nodes = this.container.children();
         let value = 0;

         $.each(child_nodes, (index, child) => {
             let item = $(child).data('item'),
                 price = parseInt(item.base.price),
                 amount = parseInt($(child).find('.quantity-num').val());

             if (amount <= 0 || isNaN(amount)) {
                 amount = 1;
                 $(child).find('.quantity-num').val(amount);
             }

             $(child).find('.cart__price').text(amount * price + ' P');
             value += amount * price;
         });

         this.total.text(value);
    }

    formPageList(pages, selected  = 1) {

    }

    setAwaitLoading() {
         this.container.addClass('loading');
    }

    setPreloader() {
         this.container.html(TemplateFactory.getPreloader());
    }

    unsetAwaitLoading() {
         this.container.removeClass('loading');
    }
}