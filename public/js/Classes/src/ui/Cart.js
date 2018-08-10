class Cart {
     constructor(ui) {
         this.UI = ui;
     }

     init() {
         this.container = $('.cart__container');
         this.total = $('.total__price').children(':first-child');

         if (this.container.length) {
             this.loadCart();

             this.container.on('click', this.checkEvent.bind(this))
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

             this.formCartList(response.data);
             // this.formPageList(response.pages);
             this.unsetAwaitLoading();
         });
     }

    async formCartList(list) {
         const app = this.UI.App;
         this.container.html('');

         for (let item of list) {
             await App.setProject(item);

             this.container.prepend(TemplateFactory.getCartItemHtml(item));

             this.container.children(':first-child').data('item', item);
             this.container.children(':first-child').find('.quantity-num').on('input', this.recountPrice.bind(this));
             this.container.children(':first-child').find('img').attr('src', await app.getVariantPreview());
         }

        this.recountPrice();
    }

    emptyCartList() {
         this.container.html('');
    }

    removeFromCart(cart_id, card) {
         App.Ajax.get('/delete/cart?cart_id='+cart_id, (response) => {
             response = JSON.parse(response);

             console.log(response);

             card.remove();
         });
    }

    recountPrice() {
         const child_nodes = this.container.children();
         let value = 0;

         $.each(child_nodes, (index, child) => {
             let item = $(child).data('item'),
                 price = parseInt(item.base.price),
                 amount = parseInt($(child).find('.quantity-num').val());

             value += amount * price;
         });

         this.total.text(value);
    }

    formPageList(pages, selected  = 1) {

    }

    setAwaitLoading() {
         this.container.addClass('loading');
    }

    unsetAwaitLoading() {
         this.container.removeClass('loading');
    }
}