import { NO_SUITABLE_PHOTO_MSG, SITE_UNREACHABLE_MSG, STANDARD_ERROR_MSG, INVALID_TAG_PARTIAL_MSG } from "../../../../json/slash/fetch/fetchErrors.json";
import { DanbooruImageObject, GelbooruImageObject, YandereImageObject } from "../../../interfaces/slash/fetch/ImageInterface";
import botParams from "../../../../json/config.json";
import fetchParams from "../../../../json/slash/fetch/fetchParameter.json"
import chalk from "chalk";
import Board from "../../../interfaces/slash/fetch/BoardInterface";

/**
 * Fetch object for all image board commands
 */
export default class FetchImage {
  public blacklist: Set<string> = new Set(fetchParams.BLACKLIST);
  public maxTags: number = fetchParams.MAX_TAGS;
  public sfw: boolean = botParams.SFW;

  private filter = /[{}<>\[\]/\\+*!?$%&*=~"`;|]/g;
  private retries: number = fetchParams.FETCH_RETRIES;
  private sfwBlacklist: Set<string> = new Set(fetchParams.FULL_TAG_FILTER);
  private sfwTagFilter: Set<string> = new Set(fetchParams.TAG_FILTER);
  private trustUser: boolean = botParams.TRUST_USER;

  /**
   * Filters a user's input for potentially malicous characters
   * @param tag Input from user
   * @returns The same string with certain characters removed
   */
  filterTag(tag: string) {
    return tag.replace(this.filter, "");
  }

  /**
   * Returns tag list
   * @param tag Filtered tag
   * @returns A list of filtered tags
   */
  getTagList(tag: string) {
    tag = tag.toLowerCase().replace(this.filter, "");
    return tag.split(" ");
  }

  /**
   * Get photo from the image board
   * @async
   * @param {string} tag Tag(s) to be searched
   * @param {Array<string>} tagList List of tags
   * @param {Board} board Information exlusive to specific site
   * @returns {Promise<string>} Message containing image URL or error message.
   */
  async getPhoto(tag: string, tagList: Array<string>, board: Board): Promise<string> {
    let message = STANDARD_ERROR_MSG;
    // Build URL
    let baseTag = board.base_tag;
    if (this.sfw) {
      baseTag = board.sfw_base_tag;
    }
    let url = `${board.image_query}${baseTag}+${tag}`;
    // Initialize parameters for the loop
    let interval = 0;
    let validTag = true;
    let photoFound = false;
    let photo: DanbooruImageObject | GelbooruImageObject | YandereImageObject | null = null;
    try {
      do {
        let jsonObj = await fetch(url);
        // Not OK status occured during fetch request
        if (!jsonObj.ok) {
          // A definite error for any board that is not Danbooru
          if (board.name !== "danbooru") {
            message = SITE_UNREACHABLE_MSG;
            throw new Error(await jsonObj.text());
          }
          validTag = false;
          message = await this.danbooruNotOKStatus(jsonObj, board, tagList);
        } else {
          let imageObj = await jsonObj.json();
          // One or more tags does not exist on Gelbooru or Yandere
          if ((board.name === "gelbooru" && !imageObj.post) ||
            (board.name === "yandere" && imageObj instanceof Array && imageObj.length === 0)) {
            message = INVALID_TAG_PARTIAL_MSG;
            // Get suggested tags
            for (let i = 0; i < tagList.length; i++) {
              message += await this.getTagSuggestions(tagList[i], board) + "\n\n";
            }
            validTag = false;
          // Potential photo found
          } else {
            // Prep image object information for usage
            if (board.name === "gelbooru") photo = imageObj.post[0];
            else if (board.name === "yandere") photo = imageObj[0];
            else photo = imageObj;

            photoFound = this.photoValidation(photo!, board);
          }
        }
        interval++;
      } while (interval < this.retries && validTag && !photoFound);
      if (validTag) {
        // Still cannot find a suitable photo after retries
        if (!photoFound) {
          message = NO_SUITABLE_PHOTO_MSG;
        } else {
          // Send picture
          message = photo!.file_url;
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
   * @param {string} tag Tag to look up suggestions for
   * @param {Board} board Information exlusive to specific site
   * @returns {Promise<string>} A message containing the similar tags or a message stating no similar tags found
   */
  async getTagSuggestions(tag: string, board: Board): Promise<string> {
    let returnMsg = "There was an error trying to get the tags.";
    // Fetch request Board API
    try {
      const jsonObj = await fetch(`${board.tag_query}${tag}${board.tag_query_wildcard}`);
      // Catch error during fetch request
      if (!jsonObj.ok) {
        throw new Error("Error getting tags.");
      }

      // Find and filter potential tags
      let photoInfo = await jsonObj.json();
      // Make Gelbooru's Response the correct format
      if (board.name === "gelbooru") {
        photoInfo = photoInfo["tag"] ?? [];
      }
      let goodTags: Array<string> = [];
      // Find and filter potential tags
      for (let i = 0; i < photoInfo.length; i++) {
        const potentialTag = photoInfo[i]["name"];
        // Filter out nsfw tags and rarely used tags
        if (this.blacklist.has(potentialTag) || photoInfo[i]["count"] < 10 ||
        (this.sfw && this.containsBadTagSFW(potentialTag))) {
          continue;
        }
        goodTags.push("`" + potentialTag + "`");
        if (goodTags.length === 10) {
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
        returnMsg = `These are some tags similar to ${tagMsg.toLowerCase()}:\n` + goodTags.join("\n");
      }
    } catch (error) {
      this.handleError(error);
    }
    return returnMsg;
  }

  /**
   * Checks if array of tags contain a blacklisted tag
   * @param {string} tag Submitted tag
   * @returns {boolean} True if a blacklisted tag is found
   */
  containsBadTag(tag: string): boolean {
    const tagList = tag.split("_");
    return tagList.filter((tag: string) => this.blacklist.has(tag)).length !== 0;
  }

  /**
   * Checks if array of tags contains NSFW tag
   * @param {string} tag Submitted tags
   * @returns {boolean} True if a blacklisted tag is found
   */
  private containsBadTagSFW(tag: string): boolean {
    if (this.sfwBlacklist.has(tag)) {
      return true
    }

    const tagList = tag.split("_");
    return tagList.filter((tag: string) => this.sfwTagFilter.has(tag)).length !== 0;
  }

  /**
   * Checks if photo is valid for posting
   * @param {StandardImageObject | DanbooruImageObject | GelbooruImageObject} imageObj JSON object returned from image board
   * @param {Board} board Information exlusive to specific site
   * @returns {boolean} Returns True if photo is valid to post
   */
  private photoValidation(imageObj: DanbooruImageObject | GelbooruImageObject | YandereImageObject, board: Board): boolean {
    return this.goodPhoto(imageObj) && this.allowedPhoto(imageObj, board);
  }

  /**
   * Takes in a JSON object from image board
   * and returns true if the JSON object contains
   * file_url parameter and is a photo url
   * @param {DanbooruImageObject | GelbooruImageObject | YandereImageObject} imageObj JSON object returned from image board
   * @returns {boolean} True if a valid image link
   */
  private goodPhoto(imageObj: DanbooruImageObject | GelbooruImageObject | YandereImageObject): boolean {
    return (
      imageObj.hasOwnProperty("file_url") &&
      (imageObj.file_url.endsWith(".png") ||
        imageObj.file_url.endsWith(".jpg") ||
        imageObj.file_url.endsWith(".webp"))
    );
  }

  /**
   * A function to catch disallowed content on server
   * @param {DanbooruImageObject | GelbooruImageObject | YandereImageObject} imageObj JSON object returned from Yandere
   * @param {Board} board Information exlusive to specific site
   * @returns {boolean} True if photo is allowed
   */
  private allowedPhoto(imageObj: DanbooruImageObject | GelbooruImageObject | YandereImageObject, board: Board): boolean {
    if (board.nsfw_ratings.includes(imageObj.rating)) {
      let tagList = null;
      if (imageObj.tag_string) {
        tagList = imageObj.tag_string!.split(" ");
      } else {
        tagList = imageObj.tags.split(" ");
      }
      tagList.forEach((tag: string) => {
        if (this.blacklist.has(tag)) {
          return false;
        }
      });
    }
    return true;
  }

  /**
   * Logs information about error to console
   * @param {any} error Text from error
   */
  handleError(error: any) {
    const time = new Date().toLocaleTimeString();
    console.error(chalk.red("ERROR: ") + error.message);
    console.error(chalk.yellow("TIME OF ERROR: " + time));
    console.error(error);
  }

  /**
   * Helper Function to deal with non-OK status for Danbooru board
   * @async
   * @param {Response} jsonObj Response from fetch to Danbooru API
   * @param {Board} board Object containing necessary Board parameters
   * @param {Array<string>} tagList A list of filtered tags
   * @returns {Promise<string>} A message containing information of suggested tags
   */
  private async danbooruNotOKStatus(jsonObj: Response, board: Board, tagList: Array<string>): Promise<string> {
    let message = null;
    let error = await jsonObj.json();
    if (error.hasOwnProperty("message") && error.message === "That record was not found.") {
      message = INVALID_TAG_PARTIAL_MSG;
      // Get suggested tags
      for (let i = 0; i < tagList.length; i++) {
        message += (await this.getTagSuggestions(tagList[i], board)) + "\n\n";
      }
      return message;
      // Danbooru site error
    } else {
      throw new Error("Bad status from danbooru");
    }
  }
}
