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
    }

    /**
     * Добавляет варианты в проекты по вариантам основы.
     */

    addVariants() {
        this.base.variants.forEach( (elem) => {
            this.variants.push(new VariantProject(elem));
        });
    }

    nextVariant() {
        if (this.currentVariant < this.variants.length - 1) {
            this.currentVariant++;
            return this.variants[this.currentVariant];
        } else {
            this.currentVariant = 0;

            return this.variants[0];
        }
    }

    prevVarinat() {
        if (this.currentVariant > 0) {
            this.currentVariant--;

            return this.variants[this.currentVariant];
        } else {
            this.currentVariant = this.variants.length - 1;

            return this.variants[this.currentVariant];
        }
    }
}