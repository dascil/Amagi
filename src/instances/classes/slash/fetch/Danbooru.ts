import { load } from "cheerio";
import { EmptyDIO } from "../../../objects/slash/fetch/EmptyImageObjects";
import FetchImage from "./FetchImage";
import { DanbooruImageObject } from "../../../interfaces/slash/fetch/ImageInterface";

export default class Danbooru extends FetchImage {
  #NOT_FOUND_PROMISE_RESPONSE: string = "That record was not found.";
  /**
   * Constructor for Danbooru object
   * @param {string} tag Tag sting passed in by the user
   */
  constructor(tag: string) {
    super(tag);
    this.maxTags = 2;
    this.nsfwRatings = ["q", "s", "e"];
  }

  /**
   * Get photo from the image board
   * @async
   * @returns {Promise<string>} Message containing image URL or error message.
   */
  async getPhoto(): Promise<string> {
    let message = this.errorMsgs.STANDARD_ERROR_MSG;
    let sfwTag = "";
    if (this.sfw) {
      sfwTag = "rating:general ";
    }
    let url =
      "https://danbooru.donmai.us/posts/random.json?tags=" + sfwTag + this.tag;
    // If fetch requests fails due to bad image,
    // it will retry a set amount of times
    let interval = 0;
    let validTag = true;
    let photoFound = false;
    let jsonObj: Response;
    let photo: DanbooruImageObject = EmptyDIO;
    try {
      do {
        // Fetch request Danbooru API
        jsonObj = await fetch(url);
        // If error during fetch request
        if (!jsonObj.ok) {
          message = this.errorMsgs.SITE_UNREACHABLE_MSG;
          let error = await jsonObj.json();
          // Invalid tag present
          if (
            error.hasOwnProperty("message") &&
            error.message === this.#NOT_FOUND_PROMISE_RESPONSE
          ) {
            message = this.INVALID_TAG_PARTIAL_MESSAGE;
            // Get suggested tags
            for (let i = 0; i < this.tagList.length; i++) {
              message += (await this.getTagSuggestions(this.tagList[i])) + "\n\n";
            }
            validTag = false;
            // Danbooru site error
          } else {
            if (this.sfw) {
              message +=
                "\nSome of your chosen tags might not be compatible for safe mode.";
            }
            throw new Error("Bad status from danbooru");
          }
        } else {
          photo = await jsonObj.json();
          // Valid photo found with correct format
          photoFound = this.photoValidation(photo);
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
    let url = `https://danbooru.donmai.us/autocomplete?search[query]=${tag}&search[type]=tag_query&limit=30`;
    let returnMsg = "There was an error trying to get the tags.";
    // Fetch request Danbooru API
    try {
      const jsonObj = await fetch(url);
      // Catch error during fetch request
      if (!jsonObj.ok) {
        throw new Error("Error getting tags.");
      }
      const html = await jsonObj.text();
      // Parse html page
      const $ = load(html);
      const tagList = $("li");
      let goodTags: Array<string> = [];
      let goodTagsCount = 0;
      // Find and filter potential tags
      for (let i = 0; i < tagList.length; i++) {
        const potentialTag = tagList[i].attribs["data-autocomplete-value"];
        if (potentialTag.includes(tag)) {
          // Filter out undesireable tags
          if (this.containsBadTag(potentialTag) || (this.sfw && this.containsBadTagSFW(potentialTag))) {
            continue;
          }
          goodTags.push("`" + potentialTag + "`");
          goodTagsCount += 1;
          if (goodTagsCount === 10) {
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
        returnMsg = `These are some tags similar to ${tagMsg.toLowerCase()}:\n` + goodTags.join("\n");
      }
    } catch (error) {
      this.handleError(error);
    }
    return returnMsg;
  }

  /**
   * Checks if photo is valid for posting
   * @param {DanbooruImageObject} imageObj JSON object returned from image board
   * @returns {boolean} Returns True if photo is valid to post
   */
  photoValidation(imageObj: DanbooruImageObject): boolean {
    return super.photoValidation(imageObj);
  }

  /**
   * Takes in a JSON object from image board
   * and returns true if the JSON object contains
   * file_url parameter and is a photo url
   * @param {DanbooruImageObject} imageObj JSON object returned from image board
   * @returns {boolean} True if a valid image link
   */
  goodPhoto(imageObj: DanbooruImageObject): boolean {
    return super.goodPhoto(imageObj);
  }

  /**
   * Checks if photo is small enough for Discord
   * @param {DanbooruImageObject} imageObj JSON object of the image
   * @returns {boolean} Returns true if image is small enough in bytes
   */
  rightSizePhoto(imageObj: DanbooruImageObject): boolean {
    return super.rightSizePhoto(imageObj);
  }

  /**
   * A function to catch disallowed content on server
   * @param {DanbooruImageObject} imageObj JSON object returned from Yandere
   * @returns {boolean} True if photo is allowed
   */
  allowedPhoto(imageObj: DanbooruImageObject): boolean {
    // Catches photos not allowed
    if (this.nsfwRatings.includes(imageObj.rating)) {
      let tagList = imageObj.tag_string.split(" ");
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