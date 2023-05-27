import { NO_SUITABLE_PHOTO_MSG, SITE_UNREACHABLE_MSG, STANDARD_ERROR_MSG, INVALID_TAG_PARTIAL_MSG } from "../../../../../json/slash/fetch/fetchErrors.json";
import { DanbooruImageObject } from "../../../../interfaces/slash/fetch/ImageInterface";
import { DANBOORU_BOARD } from "../../../../objects/slash/fetch/ImageBoards";
import Booru from "./Booru";

/**
 * Fetch object for all image board commands
 */
export default class Danbooru extends Booru {
    imageUrl: string = DANBOORU_BOARD.image_query;
    imageBaseTag: string = DANBOORU_BOARD.base_tag;
    imageSfwTag: string = DANBOORU_BOARD.sfw_base_tag;
    imageSfwRating: string = DANBOORU_BOARD.sfw_rating;
    imageNsfwRatings: Array<string> = DANBOORU_BOARD.nsfw_ratings;
    tagBaseUrl: string = DANBOORU_BOARD.tag_query;
    tagWildcard: string = DANBOORU_BOARD.tag_query_wildcard;
    maxTags: number = DANBOORU_BOARD.max_tags;

    /**
     * Get photo from the image board
     * @async
     * @param {string} tag Tag(s) to be searched
     * @param {Array<string>} tagList List of tags
     * @returns {Promise<string>} Message containing image URL or error message.
     */
    async getPhoto(tag: string, tagList: Array<string>, sfwRequired: boolean): Promise<string> {
        let message = STANDARD_ERROR_MSG;
        // Build URL
        const baseTag = sfwRequired ? this.imageSfwTag : this.imageBaseTag;
        const url = `${this.imageUrl}${baseTag}+${tag}`;
        // Initialize parameters for the loop
        let interval = 0;
        let validTag = true;
        let photoFound = false;
        let photo: DanbooruImageObject | null = null;
        try {
            do {
                const jsonObj = await fetch(url);
                // Not OK status occured during fetch request
                if (!jsonObj.ok) {
                    // A definite error for any board that is not Danbooru
                    validTag = false;
                    let error = await jsonObj.json();
                    if (error.hasOwnProperty("message") && error.message === "That record was not found.") {
                        message = INVALID_TAG_PARTIAL_MSG;
                        // Get suggested tags
                        for (const tag of tagList) {
                            message += (await this.getTagSuggestions(tag, sfwRequired)) + "\n\n";
                        }
                        break;
                    // Danbooru site error
                    } else {
                        message = SITE_UNREACHABLE_MSG;
                        throw new Error("Bad status from danbooru");
                    }
                } else {
                    photo = await jsonObj.json();
                    photoFound = this.photoValidation(photo!, sfwRequired);
                }
                interval++;
            } while (interval < super.retries && validTag && !photoFound);
            if (validTag) {
                message = photoFound ? photo!.file_url : NO_SUITABLE_PHOTO_MSG
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            return message;
        }
    }

    /**
     * Gets a list of similar tags if any and puts them into a String
     * @async
     * @param {string} tag Tag to look up suggestions for
     * @returns {Promise<string>} A message containing the similar tags or a message stating no similar tags found
     */
    async getTagSuggestions(tag: string, sfwRequired: boolean): Promise<string> {
        let returnMsg = "There was an error trying to get the tags.";
        // Fetch request Board API
        try {
          const tagInfo = await this.tagSuggestionFetchTag(tag);
          returnMsg = this.tagSuggestionMessageCreate(tagInfo, sfwRequired);
        } catch (error) {
          this.handleError(error);
        }
        return returnMsg;
      }
}
