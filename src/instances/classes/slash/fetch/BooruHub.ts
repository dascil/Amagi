import TagFilter from "./TagFilter";
import Danbooru from "./Danbooru"
import Gelbooru from "./Gelbooru";
import Yandere from "./Yandere";

export default class BooruHub extends TagFilter{
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