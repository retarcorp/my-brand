/**
 * ProjectSettings - класс настроек проекта. На данном этапе хранит только цвет футболок.
 * @constructor
 * @param {string} color - Цвет виджета. Принимается строка в формате HEX, rgb, rgba или название цвета
 */

class ProjectSettings {
    constructor(color) {
        this.color = color;
        this.startColor = color;
    }


}