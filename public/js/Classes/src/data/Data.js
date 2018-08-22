class Data {
    constructor(app) {
        this.App = app;

        this.Bases = [];
        this.Fonts = [];
        this.Prints = [];
        this.Projects = [];
    }

    serialize(object) {
        if (typeof object === 'object') {
            return Object.keys(object).reduce( (acc, key, index) => `${acc}&${key}=${Object.values(object)[index]}`, ``).slice(1).replace(/ /g, '+');
        } else {
            return "";
        }
    }

    async getBases(){
        const data = await this.App.Ajax.getJSON("/bases");
        this.Bases = data.bases.map((obj) => Base.fromJSON(obj));
    }

    async getPrints() {
        const data = await App.Ajax.getJSON('/load/prints?page=all');
        this.Prints = data.data.map( (obj) =>  Print.fromJSON(obj));
    }

    async getFonts(page) {
        if (typeof page != 'number') page = 1;

        const data = await this.App.Ajax.getJSON(`/fonts?page=`+page);
        this.Fonts = data.fonts.map((obj) => Font.fromJSON(obj));

        this.App.UI.FontsList.injectFont();
        const promises = this.Fonts.map( (font) => {
            document.fonts.load('12px ' + font.name);
        });

        await Promise.all(promises);
    }

    async getTemp(path, temp) {
        const response = await this.App.Ajax.getJSON(path);
        this.Temp = response.data;

        return this.Temp;
    }

    async loadProjects(page = 1) {
        const response = (await this.App.Ajax.getJSON('/load?page='+page));
        const projects = response.projects;
        this.Projects = projects;
        this.UserProjectsCount = response.amount;
    }

    getProjectData(p) {
        App.GraphCore.setCurrentWidget(null);
        const project = p || App.Project;
        const variants = project.variants.map(v => {
            return {
                layers: v.layers,
                widgets: v.widgets.map( w => w.getData()),
                variant: v.variant.getData()
            }
        });

        let data = {
            variants: variants
            ,base: project.base
            ,settings: project.settings
            ,id: project.id
            ,cart_id: project.cart_id
        }

        //data.templates = (project.templates) ? project.templates : [];

        return data;
    }

    saveProjectData(data, callback) {
        if (typeof data == "function") {
            callback = data;
            data = null;
        }

        this.App.Ajax.post('/save', JSON.stringify(data || this.getProjectData()), callback);
    }

}