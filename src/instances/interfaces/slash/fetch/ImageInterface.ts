interface BaseImageObject {
    tags?: string,
    tag_string?: string,
    rating: string,
    file_url: string
}

export interface YandereImageObject extends BaseImageObject {
    tags: string,
    tag_string: never,
    file_url: string,
    rating: "s" | "q" | "e",
}

export interface DanbooruImageObject extends BaseImageObject {
    tags: never,
    tag_string: string,
    file_url: string,
    rating: "g" | "s" | "q" | "e"
}

export interface GelbooruImageObject extends BaseImageObject {
    tags: string,
    tag_string: never,
    file_url: string,
    rating: "general" | "sensitive" | "questionable" | "explicit"
}