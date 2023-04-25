import { DanbooruImageObject, GelbooruImageObject, StandardImageObject } from "../../../interfaces/slash/fetch/ImageInterface"

export const EmptySIO: StandardImageObject = {
    tags: "",
    file_url: "",
    rating: "s"
}

export const EmptyDIO: DanbooruImageObject = {
    tag_string: "",
    file_url: "",
    rating: "g"
}

export const EmptyGIO: GelbooruImageObject = {
    tags: "",
    file_url: "",
    rating: "general"
}