/**
 * FontWidget - класс настроек шрифта.
 * @constructor
 * @param {string} align - Выравнивание текста
 * @param {string} size - Размер текста
 * @param {string} family - Шрифт
 */

class FontSettings {
    constructor(align, size, family) {
        this.alignment = align;
        this.fontSize = size;
        this.fontFamily = family;

        this.isBold = false;
        this.isItalic = false;
        this.isUnderline = false;
    }

    getFontString(){
        let italic = (this.isItalic) ? 'italic ' : "",
            bold = (this.isBold) ? 'bold ' : "";

        //console.log(`${italic}${bold}${underline}${this.fontSize}px ${this.fontFamily}`)

        return `${italic}${bold}${this.fontSize}px ${this.fontFamily}`;
    }

    setFontSize(fontSize) {
        this.fontSize = fontSize;
    }

    static getDefault() {
        return new this(
            FontSettings.Default.alignment
            ,FontSettings.Default.fontSize
            ,FontSettings.Default.fontFamily
        );
    }
}

FontSettings.Alignment = {
    LEFT: "left"
    ,RIGHT: "right"
    ,CENTER: "center"
}

FontSettings.Style = {
    ITALIC: 'italic'
    ,BOLD: 'bold'
    ,UNDERLINE: 'underline'
}

FontSettings.Default = {
    alignment: 'left'
    ,fontSize: 15
    ,fontFamily: 'Arial'
}