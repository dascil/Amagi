import FetchImage from "./FetchImage";
import { EmptySIO } from "./EmptyImageObjects"

export default class Yandere extends FetchImage {
  /**
   * Constructor for Danbooru object
   * @param {string} tag Tag sting passed in by the user
   */
  constructor(tag: string) {
    super(tag);
  }

  /**
   * Get photo from the image board
   * @async
   * @returns {Promise<string>} Message containing image URL or error message.
   */
  async getPhoto(): Promise<string> {
    let message = this.errorMsgs.STANDARD_ERROR_MSG;
    let sfwTag = "-rating:e";
    if (this.sfw) {
      sfwTag = "rating:s ";
    }
    let url =
      "https://yande.re/post.json?limit=1&tags=order:random+" +
      sfwTag +
      this.tag;
    // If fetch requests fails due to bad image,
    // it will retry a set amount of times
    let interval = 0;
    let validTag = true;
    let photoFound = false;
    let jsonObj: Response;
    let photo: StandardImageObject = EmptySIO;
    try {
      do {
        // Fetch request Danbooru API
        jsonObj = await fetch(url);
        // If error during fetch request
        if (!jsonObj.ok) {
          message = this.errorMsgs.SITE_UNREACHABLE_MSG;
          throw new Error(await jsonObj.text());
        } else {
          jsonObj = await jsonObj.json();
          // Tag does not exist
          if (jsonObj instanceof Array && jsonObj.length === 0) {
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
            if (jsonObj instanceof Array) { // Deal with TypeScript warning
              photo = jsonObj[0];
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
    } catch (error: any) {
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
    let url = `https://yande.re/tag.json?limit=20&name=${tag}*&type=&order=count`;
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
    for (let i = 0; i < photoInfo.length; i++) {
      const potentialTag = photoInfo[i]["name"];
      // Filter out nsfw tags
      if (this.containsBadTag(potentialTag) || (this.sfw && this.containsBadTagSFW(potentialTag))) {
        continue;
      }
      goodTags.push("`" + potentialTag + "`");
      goodTagsLength++;
      if (goodTagsLength === 10) {
        break;
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
   * @param {StandardImageObject} imageObj JSON object returned from image board
   * @returns {boolean} Returns True if photo is valid to post
   */
  photoValidation(imageObj: StandardImageObject): boolean {
    return super.photoValidation(imageObj) && this.allowedPhoto(imageObj);
  }

  /**
   * Takes in a JSON object from image board
   * and returns true if the JSON object contains
   * file_url parameter and is a photo url
   * @param {StandardImageObject} imageObj JSON object returned from image board
   * @returns {boolean} True if a valid image link
   */
  goodPhoto(imageObj: StandardImageObject): boolean {
    return super.goodPhoto(imageObj);
  }

  /**
   * Checks if photo is small enough for Discord
   * @param {StandardImageObject} imageObj JSON object of the image
   * @returns {boolean} Returns true if image is small enough in bytes
   */
  rightSizePhoto(imageObj: StandardImageObject): boolean {
    return super.rightSizePhoto(imageObj);
  }

  /**
   * A function to catch disallowed content on server
   * @param {StandardImageObject} imageObj JSON object returned from Yandere
   * @returns {boolean} True if photo is allowed
   */
  allowedPhoto(imageObj: StandardImageObject): boolean {
    return super.allowedPhoto(imageObj);
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
