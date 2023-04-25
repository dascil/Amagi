import { SFW, TRUST_USER } from "../../../../json/config.json";
import { BLACKLIST, FETCH_RETRIES, FULL_TAG_FILTER, MAX_TAGS, TAG_FILTER } from "../../../../json/slash/fetch/fetchParameter.json"
import chalk from "chalk";
import { DanbooruImageObject, GelbooruImageObject, StandardImageObject } from "../../../interfaces/slash/fetch/ImageInterface";

/**
 * Fetch object for all image board commands
 */
export default abstract class FetchImage {
  sfw: boolean = SFW;
  trustUser: boolean = TRUST_USER;
  sfwTagFilter: Set<string> = new Set(TAG_FILTER);
  sfwBlacklist: Set<string> = new Set(FULL_TAG_FILTER);
  blacklist: Set<string> = new Set(BLACKLIST);
  maxTags: number = MAX_TAGS;
  retries: number = FETCH_RETRIES;
  nsfwRatings: Array<string> = ["q", "e"];
  errorMsgs = {
    NO_SUITABLE_PHOTO_MSG:
      "Unable to find a suitable photo with that tag.\nPlease try again.",
    SITE_UNREACHABLE_MSG:
      "Unable to retrieve image from site.\nPlease make the site is not down or in maintanence.",
    STANDARD_ERROR_MSG:
      "An error has occured.\nPlease contact an admin and describe what happened.",
  };
  INVALID_TAG_PARTIAL_MESSAGE =
    "One or more tags is invalid. Check the similar tags below and try again.\n\n";
  tag: string;
  tagList: Array<string>;

  /**
   * Constructor for fetch object
   * @param {string} tag Tag sting passed in by the user
   */
  constructor(tag: string) {
    const filter = /[{}<>\[\]/\\+*!?$%&*=~'"`;|]/g;
    this.tag = tag.toLowerCase().replace(filter, "");
    this.tagList = tag.split(" ");
  }

  /**
   * Get photo from the image board
   * @returns {Promise<string>} Message containing image URL or error message.
   */
  abstract getPhoto(): Promise<string>

  /**
   * Gets a list of similar tags if any and puts them into a String
   * @param {string} tag Tag to look up suggestions for
   * @returns {Promise<string>} A message containing the similar tags or a message stating no similar tags found
   */
  abstract getTagSuggestions(tag: string): Promise<string>

  /**
   * A function to catch disallowed content on server
   * @param {StandardImageObject | DanbooruImageObject | GelbooruImageObject} imageObj JSON object returned from Yandere
   * @returns {boolean} True if photo is allowed
   */
  abstract allowedPhoto(imageObj: StandardImageObject | DanbooruImageObject | GelbooruImageObject): boolean

  /**
   * Checks if photo is valid for posting
   * @param {StandardImageObject | DanbooruImageObject | GelbooruImageObject} imageObj JSON object returned from image board
   * @returns {boolean} Returns True if photo is valid to post
   */
  photoValidation(imageObj: StandardImageObject | DanbooruImageObject | GelbooruImageObject): boolean {
    return this.goodPhoto(imageObj) && this.allowedPhoto(imageObj);
  }

  /**
   * Takes in a JSON object from image board
   * and returns true if the JSON object contains
   * file_url parameter and is a photo url
   * @param {StandardImageObject | DanbooruImageObject | GelbooruImageObject} imageObj JSON object returned from image board
   * @returns {boolean} True if a valid image link
   */
  goodPhoto(imageObj: StandardImageObject | DanbooruImageObject | GelbooruImageObject): boolean {
    return (
      imageObj.hasOwnProperty("file_url") &&
      (imageObj.file_url.endsWith(".png") ||
        imageObj.file_url.endsWith(".jpg") ||
        imageObj.file_url.endsWith(".webp"))
    );
  }

  /**
   * Checks if array of tags contain a blacklisted tag
   * @param {string} tag Submitted tags
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
  containsBadTagSFW(tag: string): boolean {
    if (this.sfwBlacklist.has(tag)) {
      return true
    }

    const tagList = tag.split("_");
    return tagList.filter((tag: string) => this.sfwTagFilter.has(tag)).length !== 0;
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
}