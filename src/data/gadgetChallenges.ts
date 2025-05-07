
import { Brawler, brawlers, getBrawlerByName } from './brawlers';

export interface GadgetChallenge {
  brawler: string;
  image: string;
  gadgetName: string;
  tip: string;
}

// Dummy gadget challenges for testing
export const gadgetChallenges: GadgetChallenge[] = [
  {
    brawler: "Shelly",
    image: getBrawlerByName("Shelly")?.image || "/placeholder.svg",
    gadgetName: "Clay Pigeons",
    tip: "This gadget focuses Shelly's shotgun blast into a narrow, longer-range attack."
  },
  {
    brawler: "Spike",
    image: getBrawlerByName("Spike")?.image || "/placeholder.svg",
    gadgetName: "Popping Pincushion",
    tip: "This gadget creates a ring of spikes around Spike that damage enemies."
  },
  {
    brawler: "Colt",
    image: getBrawlerByName("Colt")?.image || "/placeholder.svg",
    gadgetName: "Speedloader",
    tip: "This gadget instantly reloads all of Colt's ammo."
  }
];

// Hardcoded challenge for testing (will be random in production)
export const dailyGadgetChallenge = gadgetChallenges[1]; // Spike's gadget
