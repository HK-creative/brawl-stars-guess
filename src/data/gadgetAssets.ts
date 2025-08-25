// Manifest of available gadget image bases derived from public/GadgetImages filenames
// Each entry corresponds to the `<base>` in `/GadgetImages/<base>_gadget_<index>.png`

export const GADGET_IMAGE_BASES: string[] = [
  "8bit",
  "Jae-Yong",
  "amber",
  "angelo",
  "ash",
  "barley",
  "bea",
  "belle",
  "berry",
  "bibi",
  "bo",
  "bonnie",
  "brock",
  "bull",
  "buster",
  "buzz",
  "byron",
  "carl",
  "charlie",
  "chester",
  "chuck",
  "clancy",
  "colette",
  "colt",
  "cordelius",
  "crow",
  "darryl",
  "doug",
  "draco",
  "dynamike",
  "edgar",
  "elprimo",
  "emz",
  "eve",
  "fang",
  "finx",
  "frank",
  "gale",
  "gene",
  "gray",
  "griff",
  "grom",
  "gus",
  "hank",
  "jacky",
  "janet",
  "jessie",
  "kaze",
  "kenji",
  "kit",
  "larry_lawrie",
  "leon",
  "lily",
  "lola",
  "lou",
  "lumi",
  "maisie",
  "mandy",
  "max",
  "meeple",
  "meg",
  "melodie",
  "mico",
  "moe",
  "mortis",
  "mrp",
  "nani",
  "nita",
  "otis",
  "pam",
  "pearl",
  "penny",
  "piper",
  "poco",
  "rico",
  "rosa",
  "rt",
  "ruffs",
  "sam",
  "sandy",
  "shelly",
  "spike",
  "sprout",
  "squeak",
  "stu",
  "surge",
  "tara",
  "tick",
  "willow",
];

const GADGET_IMAGE_BASES_SET = new Set(GADGET_IMAGE_BASES);

/**
 * Extract the `<base>` segment from a gadget image path like `/GadgetImages/<base>_gadget_<idx>.png`
 */
export function extractGadgetBase(path: string): string | null {
  if (!path) return null;
  const m = path.match(/\/GadgetImages\/(.+?)_gadget_/i);
  return m ? m[1] : null;
}

/**
 * Determine if there are gadget images available for the given base name.
 */
export function hasGadgetAssetsForBase(base: string): boolean {
  if (!base) return false;
  return GADGET_IMAGE_BASES_SET.has(base);
}

import { getGadgetImagePath } from "@/lib/image-helpers";

/**
 * Determine if the given brawler has gadget assets in the public/GadgetImages folder.
 * Uses the centralized path helper to compute the expected base then checks the manifest.
 */
export function brawlerHasGadgetAssets(brawlerName: string): boolean {
  if (!brawlerName) return false;
  try {
    // Compute a canonical path and extract its base segment
    const canonical = getGadgetImagePath(brawlerName, "1");
    const base = extractGadgetBase(canonical);
    if (base && hasGadgetAssetsForBase(base)) return true;

    // Try with a second gadget index hint as a fallback for bases like RT/Jae-Yong
    const alt = getGadgetImagePath(brawlerName, "2");
    const altBase = extractGadgetBase(alt);
    if (altBase && hasGadgetAssetsForBase(altBase)) return true;
  } catch (e) {
    // no-op
  }
  return false;
}
