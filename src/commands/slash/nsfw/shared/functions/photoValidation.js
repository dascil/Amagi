const { BLACKLIST } = require("../config/fetchConfig.json");

/**
 * Takes in a JSON object from image board
 * and returns true if the JSON object contains
 * file_url parameter and is a photo url
 * @param {Object} imageObj JSON object returned from image board
 * @returns {Boolean} True if a valid image link
 */
function goodPhoto(imageObj) {
  return (
    imageObj.hasOwnProperty("file_url") &&
    (imageObj.file_url.endsWith(".png") ||
      imageObj.file_url.endsWith(".jpg") ||
      imageObj.file_url.endsWith(".webp"))
  );
}

/**
 * A function to catch disallowed content on server
 * @param {Array[String]} nsfw_ratings Array of string of the image board ratings
 * @param {Object} imageObj JSON object returned from Yandere
 * @returns {Boolean} True if photo is allowed
 */
function allowedPhoto(nsfw_ratings, imageObj) {
  // Catches photos not allowed
  if (
    nsfw_ratings.includes(imageObj.rating)
  ) {
    let tagList = imageObj.tags.split(" ");
    tagList.forEach((tag) => {
        if (BLACKLIST.includes(tag)) {
            return false;
        }
    });
  }
  return true;
}

/**
 * Checks if photo is small enough for Discord
 * @param {Object} imageObj JSON object of the image
 * @returns {Boolean} Returns true if image is small enough in bytes
 */
function rightSizePhoto(imageObj) {
    // Number is equivalent to 10 megabytes
    return imageObj.file_size/1048576 <= 10;
}

module.exports = {
  goodPhoto: goodPhoto,
  allowedPhoto: allowedPhoto,
  rightSizePhoto:rightSizePhoto
};
