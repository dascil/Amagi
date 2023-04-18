const chalk = require("chalk");
const { SFW, TRUST_USER} = require("../../../../json/config.json");
const { BLACKLIST, FETCH_RETRIES, MAX_TAGS, TAG_FILTER} = require("../config/fetchParameter.json")
/**
 * Fetch object for all image board commands
 */
class FetchObject {
  sfw = SFW;
  tagFilter = TAG_FILTER
  trustUser = TRUST_USER;
  blacklist = BLACKLIST;
  maxTags = MAX_TAGS;
  retries = FETCH_RETRIES;
  nsfwRatings = ["q", "e"];
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
  tag;
  tagList;

  /**
   * Constructor for fetch object
   * @param {String} tag Tag sting passed in by the user
   */
  constructor(tag) {
    const filter = /[{}<>\[\]/\\+*!?$%&*=~'"`;:|]/g;
    this.tag = tag.toLowerCase().replace(filter, "");
    this.tagList = tag.split(" ");
  }

  /**
   * Get photo from the image board
   * @async
   * @returns {Promise<String>} Message containing image URL or error message.
   */
  async getPhoto() {
    return "";
  }

  /**
   * Gets a list of similar tags if any and puts them into a String
   * @async
   * @returns {Promise<String>} A message containing the similar tags or a message stating no similar tags found
   */
  async getTagSuggestions() {
    return "";
  }

  /**
   * Checks if photo is valid for posting
   * @param {Object} imageObj JSON object returned from image board
   * @returns {Boolean} Returns True if photo is valid to post
   */
  photoValidation(imageObj) {
    return this.goodPhoto(imageObj) && this.rightSizePhoto(imageObj);
  }

  /**
   * Takes in a JSON object from image board
   * and returns true if the JSON object contains
   * file_url parameter and is a photo url
   * @param {Object} imageObj JSON object returned from image board
   * @returns {Boolean} True if a valid image link
   */
  goodPhoto(imageObj) {
    return (
      imageObj.hasOwnProperty("file_url") &&
      (imageObj.file_url.endsWith(".png") ||
        imageObj.file_url.endsWith(".jpg") ||
        imageObj.file_url.endsWith(".webp"))
    );
  }

  /**
   * Checks if photo is small enough for Discord
   * @param {Object} imageObj JSON object of the image
   * @returns {Boolean} Returns true if image is small enough in bytes
   */
  rightSizePhoto(imageObj) {
    // Number is equivalent to 10 megabytes
    return imageObj.file_size / 1048576 <= 10;
  }

  /**
   * A function to catch disallowed content on server
   * @param {Object} imageObj JSON object returned from Yandere
   * @returns {Boolean} True if photo is allowed
   */
  allowedPhoto(imageObj) {
    // Catches photos not allowed
    if (this.nsfwRatings.includes(imageObj.rating)) {
      let tagList = imageObj.tags.split(" ");
      tagList.forEach((tag) => {
        if (this.blacklist.includes(tag)) {
          return false;
        }
      });
    }
    return true;
  }

  /**
   * Checks if array of tags contain a blacklisted tag
   * @param {Array} tagList List of user inputted tags
   * @returns {Boolean} True if a blacklisted tag is found
   */
  containsBadTag(tagList) {
      let filteredBlacklistTags =  tagList.filter((tag) => this.blacklist.includes(tag));
      if (!this.sfw) {
        return filteredBlacklistTags.length !== 0;
      }
      let filteredNsfwTags = tagList.filter((tag) => this.tagFilter.includes(tag));

      return filteredBlacklistTags.length + filteredNsfwTags.length !== 0;
  }

  /**
   * Logs information about error to console
   * @param {String} error Text from error
   */
  handleError(error) {
    const time = new Date().toLocaleTimeString();
    console.error(chalk.red("ERROR: ") + error.message);
    console.error(chalk.yellow("TIME OF ERROR: " + time));
    console.error(error);
  }
}

module.exports = {
  FetchObject: FetchObject,
};
