const cheerio = require("cheerio");
const { BLACKLIST } = require("../../shared/config/fetchConfig.json")
/**
 * Takes in a tag string and returns a string
 * containing similar tags if they exist.
 * @async
 * @param {String} tag String containing filtered tag
 * @returns {Promise<String>} Message containing similar tags if any
 */
async function tagSuggestor(tag) {
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
      !BLACKLIST.includes(potentialTag)
    ) {
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
  tagSuggestorDanbooru: tagSuggestor,
};
