const { FetchObject } = require("./fetchObject");

class Yandere extends FetchObject {
  /**
   * Constructor for Danbooru object
   * @param {String} tag Tag sting passed in by the user
   */
  constructor(tag) {
    super(tag);
  }

  /**
   * Get photo from the image board
   * @async
   * @returns {Promise<String>} Message containing image URL or error message.
   */
  async getPhoto() {
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
    let jsonObj = null;
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
          if (jsonObj.length === 0) {
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
            jsonObj = jsonObj[0];
            photoFound = this.photoValidation(jsonObj);
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
          message = jsonObj.file_url;
        }
      }
    } catch (error) {
      handleError(error);
      // Sends reply to user
    } finally {
      return message;
    }
  }

  /**
   * Gets a list of similar tags if any and puts them into a String
   * @async
   * @param {String} tag Tag string to look up
   * @returns {Promise<String>} A message containing the similar tags or a message stating no similar tags found
   */
  async getTagSuggestions(tag) {
    let url = `https://yande.re/tag.json?limit=10&name=${tag}*&type=&order=count`;
    // Fetch request Danbooru API
    let jsonObj = await fetch(url);
    // Catch error during fetch request
    if (!jsonObj.ok) {
      throw new Error("Error getting tags.");
    }
    jsonObj = await jsonObj.json();
    // Parse html page
    let goodTags = [];
    // Find and filter potential tags
    for (let i = 0; i < jsonObj.length; i++) {
      const potentialTag = jsonObj[i]["name"];
      if (!this.blacklist.includes(potentialTag)) {
        // Filter out nsfw tags
        if (this.sfw) {
          let tempTagList = tag.split("_");
          if (this.containsBadTag(tempTagList)) {
            continue;
          }
        }
        goodTags.push("`" + potentialTag + "`");
      }
    }
    // Returns list of tags or message if no tags are found
    if (goodTags.length === 0) {
      return `**${tag}** does not exist. Remove some letters/symbols and try again.`;
    } else {
      return (
        `These are some tags similar to **${tag}**:\n` + goodTags.join("\n")
      );
    }
  }

  /**
   * Checks if photo is valid for posting
   * @param {Object} imageObj JSON object returned from image board
   * @returns {Boolean} Returns True if photo is valid to post
   */
  photoValidation(imageObj) {
    return super.photoValidation(imageObj) && this.allowedPhoto(imageObj);
  }

  /**
   * Takes in a JSON object from image board
   * and returns true if the JSON object contains
   * file_url parameter and is a photo url
   * @param {Object} imageObj JSON object returned from image board
   * @returns {Boolean} True if a valid image link
   */
  goodPhoto(imageObj) {
    return super.goodPhoto(imageObj);
  }

  /**
   * Checks if photo is small enough for Discord
   * @param {Object} imageObj JSON object of the image
   * @returns {Boolean} Returns true if image is small enough in bytes
   */
  rightSizePhoto(imageObj) {
    return super.rightSizePhoto(imageObj);
  }

  /**
   * A function to catch disallowed content on server
   * @param {Object} imageObj JSON object returned from Yandere
   * @returns {Boolean} True if photo is allowed
   */
  allowedPhoto(imageObj) {
    return super.allowedPhoto(imageObj);
  }

  /**
   * Checks if array of tags contain a blacklisted tag
   * @param {Array} tagList List of user inputted tags
   * @returns {Boolean} True if a blacklisted tag is found
   */
  containsBadTag(tagList) {
    return super.containsBadTag(tagList);
  }

  /**
   * Logs information about error to console
   * @param {String} error Text from error
   */
  handleError(error) {
    super.handleError(error);
  }
}

module.exports = {
  Yandere: Yandere,
};
