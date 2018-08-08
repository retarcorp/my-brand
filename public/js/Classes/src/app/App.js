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

            this.UI.Profile.init();
            this.UI.Menu.init();

            // TODO use await Promise.all([])

            await Promise.all([this.Data.getBases(), this.Data.getFonts(), this.Data.getPrints()]);

            if (this.logged){
                await this.Data.loadProjects();

                const id = localStorage.getItem('project_id') || 0;
                const project = this.Data.Projects.find( p => p.id == id ) || this.Data.Projects[0];

                // TODO rename method setProject to more evident one
                (this.Data.Projects.length && !(this.parseURL()).id) ? await this.setProject(project) : await this.getNewProject();
            } else  {
                await this.getNewProject();
            }

            this.currentWorkzone = this.currentProjectVariant.variant.workzone;

            this.UI.init();
            this.GraphCore.init();

            this.GraphCore.ctx.translate(0.5,0.5);

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

            project.settings.size = data.settings.size;
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

            v.layers[index].id = ID;
            w.layer.id = ID;
            w.id = ID;
            w.tags = widget.tags || [];
            w._id = widget._id || 0;
            ID++;

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

    async getNewProject() {
        const id = (this.parseURL()).id;
        const base = this.Data.Bases.find( (base) => base._id == id);


        this.Project = Project.newProject(base || this.Data.Bases[0]);
        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        this.GraphCore.setCurrentWidget(null);
        await this.loadProjectAssets();

        await this.UI.BaseList.setVariantsList(this.Project);
        await this.setCurrentVariant(this.Project.variants[0]);

        return this.Project;
    }

    async setProject(project) {
        this.Project = this.getProject(project);
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;

        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        await this.loadProjectAssets();

        console.log('hellohu8')

        await this.UI.BaseList.setVariantsList(this.Project);

        return this.Project;
    }

    async setProjectOnBase(base) {
        this.Project = Project.newProject(base || this.Data.Bases[0]);
        this.currentProjectVariant = this.Project.variants[0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        this.GraphCore.setCurrentWidget(null);
        await this.loadProjectAssets();

        await this.UI.BaseList.setVariantsList(this.Project);
        await this.setCurrentVariant(this.Project.variants[0]);

        return this.Project;
    }

    async setCurrentVariant(variant) {
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
    }

    async setParsedProject(project, variant_index) {
        this.Project = project;
        this.currentProjectVariant = this.Project.variants[variant_index || 0];
        this.currentWorkzone = this.currentProjectVariant.variant.workzone;


        if (this.Project.base.fancywork == "true") $('.details__name .type__basis').prepend('<p class="type__basis-needle" title="Вышивка"></p>');
        if (this.Project.base.print == "true") $('.details__name .type__basis').prepend('<p class="type__basis-paint" title="Печать"></p>');

        $('.details__name span').text(this.Project.base.name);
        $('.price__value').text(this.Project.base.price);

        await this.loadProjectAssets();

        return this.Project;
    }

    async loadProjectAssets() {
        const variant = this.currentProjectVariant;
        await variant.loadLazy();
    }

    // async getProjectPreviewImage(variant) {

    // }

    async getVariantPreview(variant) {
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

        return ctx.canvas.toDataURL('image/png');
    }

    // TODO rename to verb-based name
    startRender() {
        if (!App.inProcess) {
            if (!App.isPreview)
                App.GraphCore.RenderList.render(App.GraphCore.ctx);
            else
                App.GraphCore.RenderList.renderPreview(App.GraphCore.ctx);
        }

        requestAnimationFrame(this.startRender.bind(this));
    }
}