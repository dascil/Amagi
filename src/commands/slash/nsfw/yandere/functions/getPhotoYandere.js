const {
  LOOP_RETRIES,
  INVALID_TAG_PARTIAL_MESSAGE,
} = require("../../shared/config/fetchConfig.json");
const {
  NO_SUITABLE_PHOTO_MSG,
  SITE_UNREACHABLE_MSG,
  STANDARD_ERROR_MSG,
} = require("../../shared/config/fetchErrors.json");
const { NSFW_RATINGS } = require("../config/yandereParameters.json");
const { tagSuggestorYandere } = require("../functions/tagSuggestionYandere");
const { goodPhoto, allowedPhoto, rightSizePhoto } = require("../../shared/functions/photoValidation");
const { handleError } = require("../../shared/functions/handleError");

/**
 * Function that takes a tag and gets a photo from Danbooru of that tag
 * If tag does not exist, then gives a list of similar tags.
 *
 * @async
 * @param {String} tag Filtered tag for photo
 * @param {Array} tagList Array of tag split by space
 * @returns {Promise<String>} Returns a message containing the photo URL, tag suggestion list, or Error message
 */
async function getPhoto(tag, tagList, sfw) {
  let message = STANDARD_ERROR_MSG;
  let sfwTag = "-rating:e";
  if (sfw) {
    sfwTag = "rating:s ";
  }
  let url = "https://yande.re/post.json?limit=1&tags=order:random+" + sfwTag + tag;
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
        throw new Error(await jsonObj.text());
      } else {
        jsonObj = await jsonObj.json();

        // Tag does not exist
        if (jsonObj.length === 0) {
          message = INVALID_TAG_PARTIAL_MESSAGE;
          // Get suggested tags
          for (let i = 0; i < tagList.length; i++) {
            message += (await tagSuggestorYandere(tagList[i])) + "\n\n";
          }
          if (sfw) {
            message += "The chosen tags may also not have appropriate photos for safe mode.\n"
          }
          validTag = false;
          // Danbooru site error
        } else {
          // Valid photo found with correct format
          jsonObj = jsonObj[0];
          photoFound = goodPhoto(jsonObj) && allowedPhoto(NSFW_RATINGS, jsonObj) && rightSizePhoto(jsonObj);
        }
      }
      interval++;
    } while (interval < LOOP_RETRIES && validTag && !photoFound);
    if (validTag) {
      // Still cannot find a suitable photo after retries
      if (!photoFound) {
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
  getPhoto: getPhoto,
};
