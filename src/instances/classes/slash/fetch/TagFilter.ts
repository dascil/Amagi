import fetchParams from "../../../../json/slash/fetch/fetchParameter.json"

export default class TagFilter {
    public blacklist: Set<string> = new Set(fetchParams.BLACKLIST);
    public sfwBlacklist: Set<string> = new Set(fetchParams.SFW_BLACKLIST);
    public sfwBlacklistFullTag: Set<string> = new Set(fetchParams.FULL_TAG_FILTER);
    public sfwTagFilter: Set<string> = new Set(fetchParams.TAG_FILTER);

    private filter = /[{}<>\[\]/\\+*!?$%&*=~"`;:|]/g;

    /**
   * Filters a user's input for potentially malicous characters
   * @param tag Input from user
   * @returns The same string with certain characters removed
   */
    filterTag(tag: string) {
        return tag.replace(this.filter, "");
    }

    /**
     * Returns tag list
     * @param tag Filtered tag
     * @returns A list of filtered tags
     */
    getTagList(tag: string) {
        tag = tag.toLowerCase().replace(this.filter, "");
        return tag.split(" ");
    }

    containsBadTag(tag: string, sfwRequired: boolean): boolean {
        const tagList = tag.split(/[_-\s]/g);
        let totalBadTags = 0;
        if (sfwRequired) {
          if (this.sfwBlacklistFullTag.has(tag)) return true;

          totalBadTags += tagList.filter((tag: string) => this.sfwTagFilter.has(tag)).length;
        }

        totalBadTags += tagList.filter((tag: string) => this.blacklist.has(tag)).length
        return totalBadTags !== 0;
      }
}