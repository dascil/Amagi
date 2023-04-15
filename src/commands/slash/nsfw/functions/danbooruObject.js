const { FetchObject } = require("./fetchObject");
const cheerio = require("cheerio");

class Danbooru extends FetchObject {
  #NOT_FOUND_PROMISE_RESPONSE = "That record was not found.";
  /**
   * Constructor for Danbooru object
   * @param {String} tag Tag sting passed in by the user
   */
  constructor(tag) {
    super(tag);
    this.max_tags = 2;
    this.nsfw_ratings = ["q", "s", "e"];
  }

  /**
   * Get photo from the image board
   * @async
   * @returns {Promise<String>} Message containing image URL or error message.
   */
  async getPhoto() {
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
    let jsonObj = null;
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
            console.log(error);
            throw new Error("Bad status from danbooru");
          }
        } else {
          jsonObj = await jsonObj.json();
          // Valid photo found with correct format
          photoFound = this.photoValidation(jsonObj);
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
      this.handleError(error);
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
    let url = `https://danbooru.donmai.us/autocomplete?search[query]=${tag}&search[type]=tag_query&limit=10`;
    // Fetch request Danbooru API
    let jsonObj = await fetch(url);
    // Catch error during fetch request
    if (!jsonObj.ok) {
      throw new Error("Error getting tags.");
    }
    jsonObj = await jsonObj.text();
    // Parse html page
    const $ = cheerio.load(jsonObj);
    const tagList = $("li");
    let goodTags = [];
    // Find and filter potential tags
    for (let i = 0; i < tagList.length; i++) {
      const potentialTag = tagList[i].attribs["data-autocomplete-value"];
      if (
        potentialTag.includes(tag) &&
        !this.blacklist.includes(potentialTag)
      ) {
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
    return super.photoValidation(imageObj);
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
   * @returns {Boolean} True if a blacklisted tag is found
   */
  constainsBadTag() {
    return super.constainsBadTag();
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
  Danbooru: Danbooru,
};
