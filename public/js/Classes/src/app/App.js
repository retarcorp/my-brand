//imports("../ui/UI.js");
//imports("../graphCore/GraphCore.js");
//imports("../data/Data.js");
//imports("../ajax/Ajax.js");

class Application {
    constructor() {
        this.UI = new UI(this);
        this.GraphCore = new GraphCore(this);
        this.Ajax = new Ajax(this);
        this.Data = new Data(this);
    }

    async start(){
        try {
            let session = await User.session();

            this.logged = session.status;
            this.user = session.user;
            this.saveProject = false;
            this.isPreview = false;
            this.inProcess = false;
            this.inSettingProject = false;

            // TODO use await Promise.all([])

            await Promise.all([this.Data.getBases(), /*this.Data.getFonts(), this.Data.getPrints(),*/ this.Data.loadProjects()]);

            this.UI.Profile.init();
            this.UI.Menu.init();
            this.UI.FontsList.injectFont();
            this.fontStyle = $('[name="FONTS_FACES"]');
            this.widgetsFonts = $('[name="WIDGETs_FONTS"]');

            if (this.logged){
                const id = localStorage.getItem('project_id') || 0;
                const temp = this.parseURL().temp;
                let project;

                if (!temp || !temp.length) {
                    project = this.Data.Projects.find( p => p.id == id ) || this.Data.Projects[0];
                } else {
                    project = await this.Data.getTemp('/temp/load?temp='+temp);
                }

                // TODO rename method setProject to more evident one
                (project && !(this.parseURL()).id) ? await this.setProject(project) : await this.getNewProject();

                this.setBreadcrumbs();
            } else  {
                const temp = this.parseURL().temp;

                (!temp || !temp.length) ?
                    await this.getNewProject() :
                    await this.setProject(await this.Data.getTemp('/temp/load?temp='+temp));

                this.setBreadcrumbs();
            }

            this.currentWorkzone = this.currentProjectVariant.variant.workzone;

            this.UI.init();
            this.GraphCore.init();

            //this.GraphCore.ctx.translate(0.5,0.5);

            await this.UI.Profile.setProjectsList();

            //Using for tests




            this.startRender();
        } catch (error) {
            console.error(error);
        }

        try {
            if (AdminApp) AdminApp.init();
        }

        catch(error) {
            console.error(error)
        }

    }

    parseURL() {
        const url = window.location.href;
        const query = url.replace(/[a-zA-Z0-9:\/.@*\-\+\_\$\\\%]+\?/, "").replace('#', "");
        const qBodyParts = query.split('&');
        const qBody = {};

        qBodyParts.forEach( (part) => {
            let eq = part.split('=');

            qBody[eq[0]] = eq[1];
        });

        return qBody;
    }

    makeid(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    getProject(data) {
        if (data) {
            const project = new Project(Base.fromJSON(data.base));

            project.settings.color = data.settings.color;
            project.settings.size = data.settings.size || data.base.size[0];
            project.id = data.id;
            // project.name = data.name;
            // project.price = project.base.price;
            // TODO replace foreach to .map

            project.variants = this.getProjectVariants(data.variants);
            this.currentProjectVariant = project.variants[0];

            // data.variants.map( (variant, index) => {
            //     const v = project.variants[index];
            //
            //     v.layers = variant.layers;
            //     v.widgets = variant.widgets.map( (widget, index) =>  {
            //         const w = Widget.fromJSON(widget);
            //         w.index = index;
            //         w.layer = widget.layer;
            //
            //         v.layers[index].id = ID;
            //         w.layer.id = ID;
            //         w.id = ID;
            //         ID++;
            //
            //         if (w instanceof TextWidget) {
            //             w.lines = widget.lines;
            //             let biggestLine = "";
            //
            //             w.lines.map( line => biggestLine = (line.length > biggestLine.length) ? line : biggestLine);
            //
            //             w.biggest_line = biggestLine;
            //         }
            //
            //         return w;
            //     });
            //
            //     return v;
            // });

            project.cart_id = data.cart_id;
            return project;
        }

        return null;
    }

    getProjectVariants(variants) {
         return variants.map(this.getProjectVariant.bind(this));
    }

    getProjectVariant(variant) {
        const v = new VariantProject(BaseVariant.fromJSON(variant.variant));
        let ID = 0;

        v.layers = variant.layers;
        v.widgets = variant.widgets.map( (widget, index) =>  {
            const w = Widget.fromJSON(widget);
            w.index = index;
            w.layer = widget.layer;

            v.layers[index].id = widget.id || ID;
            w.layer.id = widget.id || ID;
            w.id = widget.id || ID;
            w.tags = widget.tags || [];
            w._id = widget._id || 0;
            w.printType = widget.printType || 1;
            w.reverseX = widget.reverseX || 1;
            w.reverseY = widget.reverseY || 1;

            w.fancywork = widget.fancywork || 'false';
            w.print = widget.print || 'false';
            w._3D = widget._3D || 'false';

            ID = widget.id + 1 || ID + 1;

            if (w instanceof TextWidget) {
                w.lines = widget.lines;
                let biggestLine = "";

                w.lines.map( line => biggestLine = (line.length > biggestLine.length) ? line : biggestLine);

                w.biggest_line = biggestLine;
            }

            return w;
        });

        v.recountWidgets();

        return v;
    }

    getProjectOnBaseAsync(base) {
        const project = Project.newProject(base || this.Data.Bases[0]),
            variant = project.base.variants[0];

        return new Promise( (res, rej) => {
            this.GraphCore.Filter.getImageAverageColorAsync(variant.src)
                .then( color => {
                    project.settings.startColor = color;
                    res(project);
                })
                .catch(err => {
                    console.log(err);
                    rej(err);
                });
        });
    }

    async getNewProject(preview = true) {
        const id = (this.parseURL()).id;
        const base = this.Data.Bases.find( (base) => base._id == id);
        this.inSettingProject = true;


        this.Project = Project.newProject(base || this.Data.Bases[0]);
        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');
        if (this.Project.base._3D == "true") $('.details__name .type__basis').prepend('<p class="type__basis-3D" title="3D"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        this.GraphCore.setCurrentWidget(null);
        await this.loadProjectAssets();
        this.UI.Tabs.reload();

        if (preview) {
            await this.UI.BaseList.setVariantsList(this.Project);
        }

        await this.UI.BaseList.setBaseColors();

        this.inSettingProject = false;
        return this.Project;
    }

    async setProject(project, preview = true, preload = true) {
        this.Project = this.getProject(project);
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;
        this.inSettingProject = true;

        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');
        if (this.Project.base._3D == "true") $('.details__name .type__basis').prepend('<p class="type__basis-3D" title="3D"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        await this.loadProjectAssets();
        this.UI.Tabs.reload();

        if (preview) {
            await this.UI.BaseList.setVariantsList(this.Project);
        }

        this.inSettingProject = false;
        return this.Project;
    }

    async setProjectOnBase(base, preview = true) {
        this.Project = Project.newProject(base || this.Data.Bases[0]);
        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;
        this.inSettingProject = true;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');
        if (this.Project.base._3D == "true") $('.details__name .type__basis').prepend('<p class="type__basis-3D" title="3D"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        this.GraphCore.setCurrentWidget(null);
        await this.loadProjectAssets();
        this.UI.Tabs.reload();

        if (preview) {
            await this.UI.BaseList.setVariantsList(this.Project);
        }

        this.inSettingProject = false;
        return this.Project;
    }

    async setCurrentVariant(variant) {
        this.inSettingProject = true;
        // debugger;

        this.currentProjectVariant = variant;
        this.currentWorkzone = variant.variant.workzone;

        if (this.GraphCore.ctx) {
            this.GraphCore.defineDimensions();
        }

        await this.loadProjectAssets();

        //this.GraphCore.setCurrentWidget();

        if (this.GraphCore.ctx) {
            this.GraphCore.ctx.translate(0.5, 0.5);
        }

        this.inSettingProject = false;
    }

    async setParsedProject(project, variant_index) {
        this.Project = project;
        this.currentProjectVariant = this.Project.variants[variant_index || 0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');
        if (this.Project.base._3D == "true") $('.details__name .type__basis').prepend('<p class="type__basis-3D" title="3D"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        await this.loadProjectAssets();

        return this.Project;
    }

    setBreadcrumbs(crumbName) {
        const crumb = $('[ name="productName"]');

        crumb.text(crumbName || this.Project.base.name);
    }

    async loadProjectAssets() {
        const variant = this.currentProjectVariant;
        await variant.loadLazy();
    }

    // async getProjectPreviewImage(variant) {

    // }

    async getVariantPreview(variant) {
        this.inSettingProject = true;
        await this.setCurrentVariant(variant || App.currentProjectVariant);

        const ctx = document.createElement('canvas').getContext('2d');

        ctx.canvas.width = this.currentProjectVariant.variant.size.width;
        ctx.canvas.height = this.currentProjectVariant.variant.size.height;
        // if (isDefault) {
        //     this.GraphCore.Filter.setColorFilterImage(variant.variant.image, color);

        //     variant.variant.loadLazy();
        // }

        this.isPreview = true;
        this.GraphCore.RenderList.render(ctx);
        this.isPreview = false;

        this.inSettingProject = false;
        return ctx.canvas.toDataURL('image/png');
    }

    // TODO rename to verb-based name
    startRender() {
        if (!App.inProcess /*&& !App.inSettingProject*/) {
            if (!App.isPreview)
                App.GraphCore.RenderList.render(App.GraphCore.ctx);
            else
                App.GraphCore.RenderList.renderPreview(App.GraphCore.ctx);
        }

        requestAnimationFrame(this.startRender.bind(this));
    }
}