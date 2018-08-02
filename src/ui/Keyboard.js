class Keyboard {
    constructor(ui) {
        this.UI = ui;
    }

    init() {
        document.addEventListener('keydown', this.UI.onDelete);
    }

    checkKeyCode(e) {
        switch (e.keyCode) {
            case 46:
                App.UI.onDelete(e);
        }

    }
}