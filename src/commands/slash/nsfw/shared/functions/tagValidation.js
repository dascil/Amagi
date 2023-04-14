const { BLACKLIST } = require("../config/fetchConfig.json");

/**
 * Checks if array of tags contain a blacklisted tag
 * @param {Array} tagList List of user inputted tags
 * @returns {Boolean} True if a blacklisted tag is found
 */
function constainsBadTag(tagList) {
    return tagList.filter(tag => BLACKLIST.includes(tag)).length !== 0;
}

module.exports = {
    constainsBadTag
}