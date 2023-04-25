export interface StandardImageObject {
    tags: string,
    file_url: string,
    rating: "s" | "q" | "e",
}

export interface DanbooruImageObject {
    tag_string: string,
    file_url: string,
    rating: "g" | "s" | "q" | "e"
}

export interface GelbooruImageObject {
    tags: string,
    file_url: string,
    rating: "general" | "sensitive" | "questionable" | "explicit"
}