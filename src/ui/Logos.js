class Logos {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        this.workspace = $('.right-workspace');
        this.logo = $('.workspace-print');


        this.workspace.addClass('active');
        this.logo.removeClass('active');
    }
}