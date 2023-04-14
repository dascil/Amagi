const { BLACKLIST } = require("../../shared/config/fetchConfig.json");

/**
 * Takes in a tag string and returns a string
 * containing similar tags if they exist.
 * @async
 * @param {String} tag String containing filtered tag
 * @returns {Promise<String>} Message containing similar tags if any
 */
async function tagSuggestor(tag) {
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
    if (!BLACKLIST.includes(potentialTag)) {
      goodTags.push("`" + potentialTag + "`");
    }
  }
  // Returns list of tags or message if no tags are found
  if (goodTags.length === 0) {
    return `**${tag}** does not exist. Try removing some letters/symbols and try again.`;
  } else {
    return `These are some tags similar to **${tag}**:\n` + goodTags.join("\n");
  }
}

module.exports = {
  tagSuggestorYandere: tagSuggestor,
};
