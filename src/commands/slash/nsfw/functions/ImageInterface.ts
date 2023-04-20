interface StandardImageObject {
    tags: string,
    file_url: string,
    file_size: number,
    rating: "s" | "q" | "e"
}

interface DanbooruImageObject {
    tag_string: string,
    file_url: string,
    file_size: number,
    rating: "g" | "s" | "q" | "e"
}