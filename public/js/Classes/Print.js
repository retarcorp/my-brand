class Print {
    constructor(name, src, tags, _id, fancywork, print) {
        this.text = name;
        this.src = src;
        this.tags = tags;
        this._id = _id;
        this.fancywork = fancywork;
        this.print = print;
    }

    static fromJSON(obj) {
        return new this(obj.name, obj.src, obj.tags, obj._id, obj.fancywork, obj.print);
    }
}