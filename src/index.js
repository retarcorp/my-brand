//imports("app/App.js");

let App = null;

class Starter {
    constructor() {
        this.Libs = [
            ['Base','BaseVariant','Position','Size','WorkZone','Project','VariantProject','FontSettings','Widget','ProjectSettings']
            ,['TxtWidget','ImageWidget','ComplexWidget', 'Path', 'Font','Print', 'BaseLine']
            ,['VerticalBaseLine', 'HorizontalBaseLine']
        ];

        requirejs.config({
            baseUrl: 'js/Classes/'
        });
    }

    Start() {
        $('head').append(TemplateFactory.getLinkHtml('./js/css/frontend.css', 'stylesheet'));

        requirejs(this.Libs[0], () => {
            requirejs(this.Libs[1], () => {
                requirejs(this.Libs[2], () => {
                    this.App = new Application();
                    App = this.App;
                    this.App.start();
                    console.log("Application loaded");
                });
            });
        });
    }
}

new Starter().Start();

const PREVIEW_SCALE = 2,
    CANVAS_WIDTH = 400;