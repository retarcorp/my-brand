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
    }

    /**
     * Добавляет варианты в проекты по вариантам основы.
     */

    addVariants() {
        this.base.variants.forEach( (elem) => {
            this.variants.push(new VariantProject(elem));
        });
    }

}