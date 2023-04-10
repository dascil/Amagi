/**
 * Takes in a JSON object from Danbooru
 * and returns true if the JSON object contains
 * file_url parameter and is a photo url
 * @param {Object} jsonObj JSON object returned from Danbooru
 * @returns {Boolean}
 */
function goodPhoto(jsonObj) {
  return (
    jsonObj.hasOwnProperty("file_url") &&
    (jsonObj.file_url.endsWith(".png") ||
      jsonObj.file_url.endsWith(".jpg") ||
      jsonObj.file_url.endsWith(".webp"))
  );
}

module.exports = {
    goodPhoto:goodPhoto
}
