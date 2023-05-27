import TagFilter from "./sauce/TagFilter";
import Danbooru from "./sauce/Danbooru"
import Gelbooru from "./sauce/Gelbooru";
import Yandere from "./sauce/Yandere";

export default class Sauce extends TagFilter{
    public danbooru: Danbooru;
    public gelbooru: Gelbooru;
    public yandere: Yandere

    constructor() {
        super()
        this.danbooru = new Danbooru();
        this.gelbooru = new Gelbooru();
        this.yandere = new Yandere();
    }
}