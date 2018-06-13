/**
 * ComplexWidget - составной виджет. Наследует класс Widget.
 * @param {Position} position - Позиция виджета в рабочей области
 * @param {Size} size - Размер виджета
 * @param {Array<Widget>} image - Состав виджета
 * @constructor
 * @augments Widget
 */

class ComplexWidget extends Widget {
    constructor(position, size, ...widgets){
        super(position, size);

        this.type = "ComplexWidget";

        this.widgets = widgets[0];
    }
}