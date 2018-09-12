//imports("app/App.js");

let App = null;

class Starter {
    constructor() {
        this.Libs = [
            ['../colorPicker', '../Logger', 'Base','BaseVariant','Position','Size','WorkZone','Project','VariantProject','FontSettings','Widget','ProjectSettings']
            ,['TxtWidget','ImageWidget','ComplexWidget', 'Path', 'Font','Print', 'BaseLine']
            ,['VerticalBaseLine', 'HorizontalBaseLine']
            ,['src/ui/BaseList', 'src/ui/BaseSettings', 'src/ui/Create', 'src/ui/FontsList', 'src/ui/Keyboard', 'src/ui/Layers', 'src/ui/LightBox', 'src/ui/Logos', 'src/ui/Menu', 'src/ui/PrintsList', 'src/ui/Profile', 'src/ui/Slider', 'src/ui/Tabs', 'src/ui/TextSettings', 'src/ui/Cart', 'src/ui/Order', 'src/ui/Brand']
            ,['src/ui/UI', 'src/graphCore/Canvas', 'src/graphCore/Filter', 'src/graphCore/RenderList', 'src/graphCore/Toolkit'],
            ,['src/graphCore/GraphCore', 'src/data/Data', 'src/ajax/Ajax']
            ,['src/app/App']
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
                    requirejs(this.Libs[3], () => {
                        requirejs(this.Libs[4], () => {
                            requirejs(this.Libs[6], () => {
                                requirejs(this.Libs[7], () => {
                                    this.App = new Application();
                                    App = this.App;
                                    Logger.setOptions({
                                        path: '/log/add',
                                    });
                                    this.App.start();
                                    console.log("Application loaded");
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}

var starter = new Starter();
starter.Start();

const PREVIEW_SCALE = 2,
    PREVIEW_OUT = 0.2,
    CANVAS_WIDTH = 400,
    PRINT_WIDTH = 100;
