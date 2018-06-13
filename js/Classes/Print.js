class Print {
    constructor(text, src) {
        this.text = text;
        this.src = src;
    }

    static fromJSON(obj) {
        return new this(obj.text, obj.src);
    }
}