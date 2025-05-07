
import { Brawler, brawlers } from './brawlers';

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
    image: "/placeholder.svg",
    starPowerName: "Circling Eagle",
    tip: "This star power increases Bo's vision range in bushes."
  },
  {
    brawler: "Rico",
    image: "/placeholder.svg",
    starPowerName: "Super Bouncy",
    tip: "This star power makes Rico's bullets deal extra damage after bouncing."
  },
  {
    brawler: "Poco",
    image: "/placeholder.svg",
    starPowerName: "Da Capo",
    tip: "This star power makes Poco's normal attacks heal teammates."
  }
];

// Hardcoded challenge for testing (will be random in production)
export const dailyStarPowerChallenge = starPowerChallenges[0]; // Bo's star power

// Helper function to get brawler details by name
export function getBrawlerByName(name: string): Brawler | undefined {
  return brawlers.find(brawler => brawler.name.toLowerCase() === name.toLowerCase());
}
