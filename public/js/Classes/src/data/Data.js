class Data {
    constructor(app) {
        this.App = app;

        this.Bases = [];
        this.Fonts = [];
        this.Prints = [];
        this.Projects = [];
    }

    async getBases(){
        const data = await this.App.Ajax.getJSON("/bases");
        this.Bases = data.bases.map((obj) => Base.fromJSON(obj));
    }

    async getPrints() {
        const data = await App.Ajax.getJSON('prints.json');
        this.Prints = data.map( (obj) =>  Print.fromJSON(obj));
    }

    async getFonts(page) {
        if (typeof page != 'number') page = 1;

        const data = await this.App.Ajax.getJSON(`/fonts?page=${page}`);
        this.Fonts = data.fonts.map((obj) => Font.fromJSON(obj));

        this.App.UI.FontsList.injectFont();
        const promises = this.Fonts.map( (font) => {
            document.fonts.load('12px ' + font.name);
        });

        Promise.all(promises);
    }

    async loadProjects(page = 1) {
        const projects = (await this.App.Ajax.getJSON('/load?page='+page)).projects;
        this.Projects = projects;
    }

    getProjectData() {
        let data = {
            variants: App.Project.variants
            ,base: App.Project.base
            ,settings: App.Project.settings
            ,id: App.Project.id
        }

        data.templates = (App.Project.templates) ? App.Project.templates : [];

        return data;
    }

    saveProjectData(data, callback) {
        if (typeof data == "function") {
            callback = data;
            data = null;
        }

        this.App.Ajax.postJSON('/save', JSON.stringify(data || this.getProjectData()), callback);
    }

}