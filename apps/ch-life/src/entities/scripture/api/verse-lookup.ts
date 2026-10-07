import { createBibleLookup } from "./bible-lookup";
import { BIBLE_DATA } from "./bible-data";

export const lookupVerses = createBibleLookup(BIBLE_DATA).lookupVerses;
