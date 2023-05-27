import { DanbooruImageObject, GelbooruImageObject, YandereImageObject } from "../../../../interfaces/slash/fetch/ImageInterface";
import { FETCH_RETRIES } from "../../../../../json/slash/fetch/fetchParameter.json"
import chalk from "chalk";
import TagFilter from "./TagFilter";

/**
 * Fetch object for all image board commands
 */
export default abstract class Booru extends TagFilter {

  abstract imageUrl: string;
  abstract imageBaseTag: string;
  abstract imageSfwTag: string;
  abstract imageSfwRating: string;
  abstract imageNsfwRatings: Array<string>;
  abstract tagBaseUrl: string;
  abstract tagWildcard: string;
  abstract maxTags: number;

  public retries: number = FETCH_RETRIES;
  /**
   * Get photo from the image board
   * @async
   * @param {string} tag Tag(s) to be searched
   * @param {Array<string>} tagList List of tags
   * @returns {Promise<string>} Message containing image URL or error message.
   */
  abstract getPhoto(tag: string, tagList: Array<string>, sfwRequired: boolean): Promise<string>

  /**
   * Gets a list of similar tags if any and puts them into a String
   * @async
   * @param {string} tag Tag to look up suggestions for
   * @returns {Promise<string>} A message containing the similar tags or a message stating no similar tags found
   */
  abstract getTagSuggestions(tag: string, sfwRequired: boolean): Promise<string>



  /**
   * Checks if photo is valid for posting
   * @param {StandardImageObject | DanbooruImageObject | GelbooruImageObject} imageObj JSON object returned from image board
   * @returns {boolean} Returns True if photo is valid to post
   */
  photoValidation(imageObj: DanbooruImageObject | GelbooruImageObject | YandereImageObject, sfwRequired: boolean): boolean {
    return this.goodPhoto(imageObj) && this.allowedPhoto(imageObj, sfwRequired);
  }

  /**
   * Takes in a JSON object from image board
   * and returns true if the JSON object contains
   * file_url parameter and is a photo url
   * @param {DanbooruImageObject | GelbooruImageObject | YandereImageObject} imageObj JSON object returned from image board
   * @returns {boolean} True if a valid image link
   */
  goodPhoto(imageObj: DanbooruImageObject | GelbooruImageObject | YandereImageObject): boolean {
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
   * @returns {boolean} True if photo is allowed
   */
  allowedPhoto(imageObj: DanbooruImageObject | GelbooruImageObject | YandereImageObject, sfwRequired: boolean): boolean {
    let tagList = null;
    let sfwTaglist = null;
    if (imageObj.tag_string) {
      tagList = imageObj.tag_string.split(/[-_\s]/g);
      if (sfwRequired) sfwTaglist = imageObj.tag_string.split(" ");
    } else {
      tagList = imageObj.tags.split(/[-_\s]/g);
      if (sfwRequired) sfwTaglist = imageObj.tags.split(" ");
    }

    // Checks if certain sfw blacklisted full tags exist
    if (sfwRequired) {
      sfwTaglist?.forEach(tag => {
        if (this.sfwBlacklistFullTag.has(tag)) return false;
      })
    }

    // Checks NSFW photos for disallowed tags
    if (sfwRequired || (imageObj.rating !== this.imageSfwTag)) {
      tagList.forEach(tag => {
        if (this.blacklist.has(tag)) return false;

        if (sfwRequired) {
          if (this.sfwBlacklist.has(tag)) return false;
        }
      });
    }

    return true;
  }

  /**
   * Sends tag suggestions or no tags found message to user
   * @param {any} tagInfo Response back from site API
   * @param {boolean} sfwRequired If sfw tags are required
   * @returns {string} Message containing tag suggestions or no tags found message to user
   */
  tagSuggestionMessageCreate(tagInfo: any, sfwRequired: boolean): string {
    let goodTags: Array<string> = [];
    // Find and filter potential tags
    for (let i = 0; i < tagInfo.length; i++) {
      const potentialTag = tagInfo[i]["name"];
      // Filter out nsfw tags and rarely used tags
      if (this.containsBadTag(potentialTag, sfwRequired) || tagInfo[i]["count"] < 10 || potentialTag.endsWith(",")) {
        continue;
      }
      goodTags.push("`" + potentialTag + "`");
      if (goodTags.length === 10) {
        break;
      }
    }

    if (goodTags.length === 0) {
      return "This tag does not exist. Remove some letters/symbols and try again.";
    } else {
      return "These are some similar tags:\n" + goodTags.join("\n");
    }
  }

  /**
   * Gets tag suggestions from API
   * @async
   * @param {string} tag The tag to look up suggestions of
   * @returns {any} Returns an object of the tag suggestions
   */
  async tagSuggestionFetchTag(tag: string): Promise<any> {
    const jsonObj = await fetch(`${this.tagBaseUrl}${tag}${this.tagWildcard}`);
    // Catch error during fetch request
    if (!jsonObj.ok) {
      throw new Error("Error getting tags.");
    }
    // Find and filter potential tags
    return await jsonObj.json();
  }

  /**
   * Logs information about error to console
   * @param {any} error Text from error
   */
  handleError(error: any) {
    const time = new Date().toLocaleTimeString();
    console.error(chalk.red("[ERROR] ") + error.message);
    console.error(chalk.yellow("[TIME OF ERROR] " + time));
    console.error(error);
  }
}
