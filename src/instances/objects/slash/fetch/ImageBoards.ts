import Board from "../../../interfaces/slash/fetch/BoardInterface"
import fetchParams from "../../../../json/slash/fetch/fetchParameter.json"

export const DANBOORU_BOARD: Board = {
    name: "danbooru",
    image_query: "https://danbooru.donmai.us/posts/random.json?tags=",
    tag_query: "https://danbooru.donmai.us/tags.json?search[order]=count&search[name_matches]=",
    tag_query_wildcard: "*",
    base_tag: "-rating:e",
    sfw_base_tag: "rating:g",
    sfw_rating: "g",
    nsfw_ratings: ["s","q","e"],
    max_tags: 2
}

export const GELBOORU_BOARD: Board = {
    name: "gelbooru",
    image_query: "https://gelbooru.com/index.php?page=dapi&q=index&json=1&limit=1&s=post&tags=sort:random+",
    tag_query: "https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&limit=30&orderby=count&name_pattern=",
    tag_query_wildcard: "%",
    base_tag: "-rating:explicit",
    sfw_base_tag: "rating:general",
    sfw_rating: "general",
    nsfw_ratings: ["questionable","suggestive","explicit"],
    max_tags: fetchParams.MAX_TAGS
}

export const YANDERE_BOARD: Board = {
    name: "yandere",
    image_query: "https://yande.re/post.json?limit=1&tags=order:random+",
    tag_query: "https://yande.re/tag.json?limit=30&type=&order=count&name=",
    tag_query_wildcard: "*",
    base_tag: "-rating:e",
    sfw_base_tag: "rating:s",
    sfw_rating: "g",
    nsfw_ratings: ["q","e"],
    max_tags: fetchParams.MAX_TAGS
}

export default {
    DANBOORU:DANBOORU_BOARD, GELBOORU:GELBOORU_BOARD, YANDERE:YANDERE_BOARD
}