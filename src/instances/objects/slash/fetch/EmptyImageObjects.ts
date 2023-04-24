import { DanbooruImageObject, StandardImageObject } from "../../../interfaces/slash/fetch/ImageInterface"

export const EmptySIO: StandardImageObject = {
    tags: "",
    file_url: "",
    file_size: 0,
    rating: "s"
}

export const EmptyDIO: DanbooruImageObject = {
    tag_string: "",
    file_url: "",
    file_size: 0,
    rating: "g"
}