class Profile {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.logins = $('.authorization__form');
        this.logins_item = $('.main-menu__item.login');
        this.logins_submit = $('input[type="submit"][value="Вход"]');

        this.logout_item = $('.profile__link.link__logout');
        this.logout_admin = $('.header__logout');

        this.profile = $('.profile__menu');
        this.profile_item = $('.main-menu__item.profile');
        this.profile_name = $('.profile__name, .header__admin');

        this.container = $('.favorites__container');

        this.registration_item = $('.main-menu__item.registration')
        this.registration = $('section.registration');
        this.registration_accept = $('.post-reg__button');

        this.save_project_item = $('.details__link.save');
        this.save_project = $('.details__after');

        this.favorites_item = $('.favorites__item');
        this.favorites = $('.favorites__container');

        this.page_list = $('.panel__page-list.favorites');


        this.profile_item.on('click', this.showProfileMenu);

        this.registration_item.on('click', this.showRegistrationForm);
        this.registration.on('click', this.closeRegistration);
        this.registration_accept.on('click', (e) => {
            this.closeRegistration(e);
            this.logins_item.addClass('active');
        });

        this.logins_submit.on('click', () => this.logins.submit());
        this.logins.on('submit', () => { this.login(); return false;});

        this.logins_item.on('click', this.showLoginForm);

        this.logout_item.on('click', this.logout);
        this.logout_admin.on('click', this.logout);


        this.save_project_item.on('click', this.saveProject);

        this.favorites.on('click', this.checkFavoritesEvent);

        this.page_list.on('click', this.checkFavoritesEvent);

        //$('body').on('click', this.showLoginForm);


        this.checkLogged();

        if (this.container.length) {
            this.container.html('Favorites loading...');
        }
    }

    checkLogged() {
        if (App.logged) {
            this.logins_item.remove();

            this.registration_item.remove();
            this.registration.remove();

            this.profile_item.addClass('active');
            this.profile_name.text(App.user);
        }
    }

    checkFavoritesEvent(e) {
        const target = $(e.target);

        if (target.hasClass('favorites__edit')) {
            const card = target.parent().parent();
            const id = card.data('project_id');

            App.UI.Profile.openProjectInConstructor(id);
        }

        if (target.hasClass('favorites__remove')) {
            const card = target.parent().parent().parent();
            const id = card.data('project_id');

            App.UI.Profile.removeProject(id, card);
        }

        if (target.hasClass('favorites__buy')) {
            const card = target.parent().parent().parent(),
                id = card.data('project_id');

            App.UI.Profile.addToCart(id, card);
            // console.log('Need addToCart functionality');
        }

        if (target.hasClass('panel__page-point')) {
            const page = target.data('page');
            App.UI.Profile.page_list.addClass('loading');

            App.UI.Profile.formProjectsList(e, page);
        }
    }

    addToCart(id, card) {
        const data = JSON.stringify({ id: id });
        this.UI.App.Ajax.post('/cart/add', data, (response) => {
            response = JSON.parse(response);

            console.log(response);

            this.changeToLink(card);
        });
    }

    changeToLink(card) {
        card.addClass('in-cart');
    }

    openProjectInConstructor(project_id){
        localStorage.setItem('project_id', project_id);
        location.href = "/constructor";
    }

    logout(e) {
        e.preventDefault();

        //@TODO start using Ajax Module

        User.logout( (data) => {
            location.reload();
        });
    }

    showProfileMenu() {
        App.UI.Profile.profile.toggleClass('active');
    }

    showLoginForm(e) {
        if (!App.UI.Profile.logins_item.has($(e.target)).length || $(e.target).hasClass('login')) {
            App.UI.Profile.logins_item.removeClass('active');
        } else {
            App.UI.Profile.logins_item.addClass('active');
        }

        if (!App.logged && ($(e.target).hasClass('save') || $(e.target).hasClass('post-reg__button'))) {
            App.UI.Profile.logins_item.addClass('active');
        }
    }

    showRegistrationForm(e) {
        e.preventDefault();

        if ($(e.target).hasClass('button__registration')) {
            App.UI.Profile.registration.addClass('active');
        }
    }

    closeRegistration(e) {
        if ($(e.target).hasClass('registration') || $(e.target).hasClass('button__close') || $(e.target).hasClass('post-reg__button')) {
            if ($(e.target).hasClass('post-reg__button')) {
                $('body, html').animate( {
                    scrollTop: 0
                }, 500);

                App.UI.Profile.showLoginForm(e);
            }

            App.UI.Profile.registration.removeClass('active');
        }
    }

    hideForms(e) {
        App.UI.Profile.logins_item.removeClass('active');
        App.UI.Profile.registration_item.removeClass('active');
    }

    login() {
        event.preventDefault();
        let data = {
            name: $('input[name="user"]').val()
            ,password: $('input[name="pass"]').val()
        };

        App.Ajax.postJSON('/login', JSON.stringify(data), (data) => {
            data = JSON.parse(data);

            if (data.status) {
                App.logged = true;

                if (App.saveProject) {
                    App.UI.onSaveProject();
                }

                if (data.data.admin) {
                    location.href = '/admin';
                } else {
                    location.href = '/constructor';
                }
            } else {
                alert(data.message);
            }

        });
    }

    saveProject(e) {
        e.preventDefault();
        App.saveProject = true;

        if (App.logged) {
            App.UI.Profile.save_project.removeClass('pending');
            App.UI.Profile.save_project.addClass('active');
        }

        App.UI.onSaveProject(e, (response) => {
            if (App.logged) {
                console.log(response);
                response = JSON.parse(response);

                App.UI.Profile.save_project.removeClass('active');
                App.UI.Profile.save_project.addClass('pending');
                App.Project.id = response.id;
            }
        });
    }

    async formProjectsList(e, page) {
        await this.UI.App.Data.loadProjects(page);
        await this.setProjectsList();

        const collection = $('.panel__page-point.active'),
            target = $(`.panel__page-point[data-page=${page}]`);

        collection.removeClass('selected');
        target.addClass('selected');

        this.page_list.css('transform', `translateX(-${ (page - 1) * 100}%)`);
        this.page_list.removeClass('loading');
    }

    formPageList(pages) {
        this.page_list.html('');

        for (let page = 1; page <= pages; page++) {
            this.page_list.append(TemplateFactory.getAdminPanelPages(page));
            this.page_list.children(":last-child").attr('data-page', page);
        }

    }

    removeProject(id, card) {
        this.favorites.addClass('loading');

        this.UI.App.Ajax.get('/delete_project?id='+id, (data) => {
            this.favorites.removeClass('loading');
            let status = JSON.parse(data).status;

            if (status) {
                card.remove();
            }
        });
    }

    async setProjectsList() {
        if (!this.container.length) {
            return;
        }

        let projects = this.UI.App.Data.Projects,
            pages = Math.ceil(projects.length/20);

        if (!projects || !projects.length) {
            this.container.html('There is no favorites yet.');
        } else {
            this.container.html(
                projects.reduce((acc, project) => acc + TemplateFactory.getFavoritesListHtml(project), ``)
            );

            this.formPageList(pages);

            let index = 0;

            for (let project of projects) {
                await this.loadPreviewImage(project, $('.favorites__img')[index], this.favorites.children()[index]);
                index++;
            }

        }
    }

    async loadPreviewImage(project, img, card) {
        const app = this.UI.App;
        await app.setProject(project);

        app.isPreview = true;
        app.GraphCore.RenderList.render(app.GraphCore.ctx);
        app.isPreview = false;

        $(card).data('project_id', app.Project.id);
        $(card).data('project', app.Project);
        const dataURL = app.GraphCore.canvas.toDataURL('image/png');

        img.src = dataURL;
    }
}