const {
  LOOP_RETRIES,
  NOT_FOUND_PROMISE_RESPONSE,
  INVALID_TAG_PARTIAL_MESSAGE,
} = require("../config/danbooruParameters.json");
const {
  NO_SUITABLE_PHOTO_MSG,
  SITE_UNREACHABLE_MSG,
  STANDARD_ERROR_MSG,
} = require("../config/danbooruErrors.json");
const { goodPhoto } = require("./goodPhotoDanbooru");
const { tagSuggestor } = require("./tagSuggestionDanbooru");
const { handleError } = require("./handleError");

/**
 * Function that takes a tag and gets a photo from Danbooru of that tag
 * If tag does not exist, then gives a list of similar tags.
 *
 * @async
 * @param {String} tag Filtered tag for photo
 * @param {Array} tagList Array of tag split by space
 * @returns {Promise<String>} Returns a message containing the photo URL, tag suggestion list, or Error message
 */
async function getPhoto(tag, tagList) {
  let message = STANDARD_ERROR_MSG;
  let url = "https://danbooru.donmai.us/posts/random.json?tags=" + tag;
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
        message = SITE_UNREACHABLE_MSG;
        let error = await jsonObj.json();
        // Invalid tag present
        if (
          error.hasOwnProperty("message") &&
          error.message === NOT_FOUND_PROMISE_RESPONSE
        ) {
          message = INVALID_TAG_PARTIAL_MESSAGE;
          // Get suggested tags
          for (let i = 0; i < tagList.length; i++) {
            message += (await tagSuggestor(tagList[i])) + "\n\n";
          }
          validTag = false;
          // Danbooru site error
        } else {
          throw new Error(await jsonObj.text());
        }
      } else {
        jsonObj = await jsonObj.json();
        // Valid photo found with correct format
        photoFound = goodPhoto(jsonObj);
      }
      interval++;
    } while (interval < LOOP_RETRIES && validTag && !photoFound);
    if (validTag) {
      // Still cannot find a suitable photo after retries
      if (!goodPhoto(jsonObj)) {
        message = NO_SUITABLE_PHOTO_MSG;
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

module.exports = {
    getPhoto:getPhoto
}