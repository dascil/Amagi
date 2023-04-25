import FetchImage from "./FetchImage";
import { EmptyGIO } from "../../../objects/slash/fetch/EmptyImageObjects"
import { GelbooruImageObject } from "../../../interfaces/slash/fetch/ImageInterface";

export default class Gelbooru extends FetchImage {
    /**
     * Constructor for Danbooru object
     * @param {string} tag Tag sting passed in by the user
     */
    constructor(tag: string) {
        super(tag);
        this.nsfwRatings = ["questionable", "suggestive", "explicit"];
    }

    /**
     * Get photo from the image board
     * @async
     * @returns {Promise<string>} Message containing image URL or error message.
     */
    async getPhoto(): Promise<string> {
        let message = this.errorMsgs.STANDARD_ERROR_MSG;
        let sfwTag = "-rating:explicit+";
        if (this.sfw) {
            sfwTag = "rating:general+";
        }
        let url =
            "https://gelbooru.com/index.php?page=dapi&q=index&json=1&limit=1&s=post&tags=sort:random+" +
            sfwTag +
            this.tag;
        // If fetch requests fails due to bad image,
        // it will retry a set amount of times
        let interval = 0;
        let validTag = true;
        let photoFound = false;
        let jsonObj: Response;
        let photo: GelbooruImageObject = EmptyGIO;
        try {
            do {
                // Fetch request Danbooru API
                jsonObj = await fetch(url);
                // If error during fetch request
                if (!jsonObj.ok) {
                    message = this.errorMsgs.SITE_UNREACHABLE_MSG;
                    throw new Error(await jsonObj.text());
                } else {
                    let imageObj = await jsonObj.json();
                    // Tag does not exist
                    if (imageObj["@attributes"]["count"] === 0) {
                        message = this.INVALID_TAG_PARTIAL_MESSAGE;
                        // Get suggested tags
                        for (let i = 0; i < this.tagList.length; i++) {
                            message +=
                                (await this.getTagSuggestions(this.tagList[i])) + "\n\n";
                        }
                        if (this.sfw) {
                            message +=
                                "The chosen tags may also not have appropriate photos for safe mode.\n";
                        }
                        validTag = false;
                        // Danbooru site error
                    } else {
                        // Valid photo found with correct format
                        // Deal with TypeScript warning
                        if (imageObj.post && imageObj.post.length >= 1) {
                            photo = imageObj.post[0];
                            photoFound = this.photoValidation(photo);
                        }
                    }
                }
                interval++;
            } while (interval < this.retries && validTag && !photoFound);
            if (validTag) {
                // Still cannot find a suitable photo after retries
                if (!photoFound) {
                    message = this.errorMsgs.NO_SUITABLE_PHOTO_MSG;
                } else {
                    // Send picture
                    message = photo.file_url;
                }
            }
        } catch (error) {
            this.handleError(error);
            // Sends reply to user
        } finally {
            return message;
        }
    }

    /**
     * Gets a list of similar tags if any and puts them into a String
     * @async
     * @param {string} tag Tag string to look up
     * @returns {Promise<string>} A message containing the similar tags or a message stating no similar tags found
     */
    async getTagSuggestions(tag: string): Promise<string> {
        let url = `https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&limit=30&orderby=count&name_pattern=${tag}%`;
        let returnMsg = "There was an error trying to get the tags.";
        try {
            // Fetch request Danbooru API
            let jsonObj = await fetch(url);
            // Catch error during fetch request
            if (!jsonObj.ok) {
                throw new Error("Error getting tags.");
            }
            let photoInfo = await jsonObj.json();
            // Parse html page
            let goodTags: Array<string> = [];
            let goodTagsLength = 0;
            // Find and filter potential tags
            if (photoInfo["tag"]) {
                for (let i = 0; i < photoInfo["tag"].length; i++) {
                    let potentialTag = photoInfo["tag"][i]["name"];
                    potentialTag = potentialTag.replace(",", "");
                    // Filter out nsfw tags
                    if (this.containsBadTag(potentialTag) || (this.sfw && this.containsBadTagSFW(potentialTag) || photoInfo["tag"][i]["count"] < 10)) {
                        continue;
                    }
                    goodTags.push("`" + potentialTag + "`");
                    goodTagsLength++;
                    if (goodTagsLength === 10) {
                        break;
                    }
                }
            }
            // Change return message based on bot configurations
            let tagMsg = `**${tag}**`;
            if (!this.trustUser) {
                tagMsg = "Tag";
            }
            returnMsg = "";
            if (this.sfw) {
                returnMsg = `\n${tagMsg} may also not be allowed due to server configurations.`;
            }

            if (goodTags.length === 0) {
                returnMsg = `${tagMsg} does not exist. Remove some letters/symbols and try again.${returnMsg}`;
            } else {
                returnMsg =
                    `These are some tags similar to ${tagMsg.toLowerCase()}:\n` +
                    goodTags.join("\n");
            }
        } catch (error) {
            this.handleError(error);
        }
        return returnMsg;
    }

    /**
     * Checks if photo is valid for posting
     * @param {GelbooruImageObject} imageObj JSON object returned from image board
     * @returns {boolean} Returns True if photo is valid to post
     */
    photoValidation(imageObj: GelbooruImageObject): boolean {
        return this.goodPhoto(imageObj) && this.allowedPhoto(imageObj);
    }

    /**
     * Takes in a JSON object from image board
     * and returns true if the JSON object contains
     * file_url parameter and is a photo url
     * @param {GelbooruImageObject} imageObj JSON object returned from image board
     * @returns {boolean} True if a valid image link
     */
    goodPhoto(imageObj: GelbooruImageObject): boolean {
        return super.goodPhoto(imageObj);
    }

    /**
     * A function to catch disallowed content on server
     * @param {GelbooruImageObject} imageObj JSON object returned from Yandere
     * @returns {boolean} True if photo is allowed
     */
    allowedPhoto(imageObj: GelbooruImageObject): boolean {
        // Catches photos not allowed
        if (this.nsfwRatings.includes(imageObj.rating)) {
            let tagList = imageObj.tags.split(" ");
            tagList.forEach((tag: string) => {
                if (this.blacklist.has(tag)) {
                    return false;
                }
            });
        }
        return true;
    }

    /**
     * Checks if array of tags contain a blacklisted tag
     * @param {string} tag Submitted tags
     * @returns {boolean} True if a blacklisted tag is found
     */
    containsBadTag(tag: string): boolean {
        return super.containsBadTag(tag);
    }

    /**
     * Checks if array of tags contain a blacklisted tag
     * @param {string} tag Submitted tags
     * @returns {boolean} True if a blacklisted tag is found
     */
    containsBadTagSFW(tag: string): boolean {
        return super.containsBadTagSFW(tag);
    }

    /**
     * Logs information about error to console
     * @param {any} error Text from error
     */
    handleError(error: any) {
        super.handleError(error);
    }
}
