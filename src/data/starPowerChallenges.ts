
import { Brawler, brawlers, getBrawlerByName } from './brawlers';

export interface StarPowerChallenge {
  brawler: string;
  image: string;
  starPowerName: string;
  tip: string;
}

// Mock star power challenges for testing
export const starPowerChallenges: StarPowerChallenge[] = [
  {
    brawler: "Bo",
    image: getBrawlerByName("Bo")?.image || "/placeholder.svg",
    starPowerName: "Circling Eagle",
    tip: "This star power increases Bo's vision range in bushes."
  },
  {
    brawler: "Rico",
    image: getBrawlerByName("Rico")?.image || "/placeholder.svg",
    starPowerName: "Super Bouncy",
    tip: "This star power makes Rico's bullets deal extra damage after bouncing."
  },
  {
    brawler: "Poco",
    image: getBrawlerByName("Poco")?.image || "/placeholder.svg",
    starPowerName: "Da Capo",
    tip: "This star power makes Poco's normal attacks heal teammates."
  }
];

// Hardcoded challenge for testing (will be random in production)
export const dailyStarPowerChallenge = starPowerChallenges[0]; // Bo's star power
