export default interface Board {
    name: string,
    image_query: string,
    tag_query: string,
    tag_query_wildcard: string,
    base_tag: string,
    sfw_base_tag: string,
    sfw_rating: string,
    nsfw_ratings: Array<string>,
}
