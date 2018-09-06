/**
 * Project - класс проекта. Является текущим в рабочей области. Используется сохранения изменений.
 * @constructor
 * @param {Base} base - Текущая основа.
 */

class Project {
    constructor(base) {
        this.base = base;
        this.ordered = new Date();
        this.modified = new Date();
        this.variants = [];
        this.settings = new ProjectSettings(base.color);
        this.currentVariant = 0;

        this.addVariants();
        //this.setBaseColors();
    }

    /**
     * Добавляет варианты в проекты по вариантам основы.
     */

    addVariants() {
        this.base.variants.forEach( (elem) => {
            this.variants.push(new VariantProject(elem));
        });
    }

    setBaseColors(base) {
        base = base || this.base;
        App.UI.BaseList.setBaseColors(base);
    }

    // TODO method names must contain verb
    getNextVariant() {
        if (this.currentVariant < this.variants.length - 1) {
            this.currentVariant++;
            return this.variants[this.currentVariant];
        } else {
            this.currentVariant = 0;

            return this.variants[0];
        }
    }

    // TODO fix typo error
    getPrevVariant() {
        if (this.currentVariant > 0) {
            this.currentVariant--;

            return this.variants[this.currentVariant];
        } else {
            this.currentVariant = this.variants.length - 1;

            return this.variants[this.currentVariant];
        }
    }

    // TODO methods are called from small letter!!!!
    static newProject(base, date) {
        let project = new this(base);

        project.id = 0;

        return project;
    }
}