import { NO_SUITABLE_PHOTO_MSG, SITE_UNREACHABLE_MSG, STANDARD_ERROR_MSG, INVALID_TAG_PARTIAL_MSG } from "../../../../../json/slash/fetch/fetchErrors.json";
import { YandereImageObject } from "../../../../interfaces/slash/fetch/ImageInterface";
import { YANDERE_BOARD } from "../../../../objects/slash/fetch/ImageBoards";
import Booru from "./Booru";

/**
 * Fetch object for all image board commands
 */
export default class Yandere extends Booru {
    /**
     * Get photo from the image board
     * @async
     * @param {string} tag Tag(s) to be searched
     * @param {Array<string>} tagList List of tags
     * @returns {Promise<string>} Message containing image URL or error message.
     */

    imageUrl: string = YANDERE_BOARD.image_query;
    imageBaseTag: string = YANDERE_BOARD.base_tag;
    imageSfwTag: string = YANDERE_BOARD.sfw_base_tag;
    imageSfwRating: string = YANDERE_BOARD.sfw_rating;
    imageNsfwRatings: Array<string> = YANDERE_BOARD.nsfw_ratings;
    tagBaseUrl: string = YANDERE_BOARD.tag_query;
    tagWildcard: string = YANDERE_BOARD.tag_query_wildcard;
    maxTags: number = YANDERE_BOARD.max_tags;

    async getPhoto(tag: string, tagList: Array<string>, sfwRequired: boolean): Promise<string> {
        let message = STANDARD_ERROR_MSG;
        // Build URL
        const baseTag = sfwRequired ? this.imageSfwTag : this.imageBaseTag;
        const url = `${this.imageUrl}${baseTag}+${tag}`;
        // Initialize parameters for the loop
        let interval = 0;
        let validTag = true;
        let photoFound = false;
        let photo: YandereImageObject | null = null;
        try {
            do {
                let jsonObj = await fetch(url);
                // Not OK status occured during fetch request
                if (!jsonObj.ok) {
                    message = SITE_UNREACHABLE_MSG;
                    throw new Error(await jsonObj.text());
                }

                jsonObj = await jsonObj.json()
                if (jsonObj instanceof Array) {
                    if (jsonObj.length === 0) {
                        message = INVALID_TAG_PARTIAL_MSG;
                        // Get suggested tags
                        for (const tag of tagList) {
                            message += await this.getTagSuggestions(tag, sfwRequired) + "\n\n";
                            validTag = false;
                        }
                    } else {
                        photo = jsonObj[0];
                        photoFound = this.photoValidation(photo!, sfwRequired);
                    }
                }
                interval++;
            } while (interval < this.retries && validTag && !photoFound);
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
