class Print {
    constructor(name, src, tags, _id, fancywork, print, _3D, category) {
        this.text = name;
        this.src = src;
        this.tags = tags;
        this._id = _id;
        this.fancywork = fancywork;
        this.print = print;
        this._3D = _3D;
        this.category = category || "Другие";
    }

    static fromJSON(obj) {
        return new this(obj.name, obj.src, obj.tags, obj._id, obj.fancywork, obj.print, obj._3D, obj.category);
    }
}