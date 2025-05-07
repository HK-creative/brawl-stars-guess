
import { Brawler, brawlers } from './brawlers';

export interface AudioChallenge {
  brawler: string;
  audioFile: string;
  image: string;
}

// Dummy audio challenges for testing
export const audioChallenges: AudioChallenge[] = [
  {
    brawler: "Shelly",
    audioFile: "/audio/shelly_attack.mp3",
    image: "/shelly.png"
  },
  {
    brawler: "Spike",
    audioFile: "/audio/spike_super.mp3",
    image: "/spike.png"
  },
  {
    brawler: "Colt",
    audioFile: "/audio/colt_attack.mp3",
    image: "/colt.png"
  },
  {
    brawler: "Poco",
    audioFile: "/audio/poco_attack.mp3",
    image: "/poco.png"
  },
  {
    brawler: "El Primo",
    audioFile: "/audio/el_primo_super.mp3",
    image: "/el_primo.png"
  }
];

// Hardcoded challenge for testing (will be random in production)
export const dailyAudioChallenge = audioChallenges[1]; // Spike

// Helper function to get brawler details by name
export function getBrawlerByName(name: string): Brawler | undefined {
  return brawlers.find(brawler => brawler.name.toLowerCase() === name.toLowerCase());
}
