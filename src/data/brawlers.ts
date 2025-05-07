
export interface Brawler {
  name: string;
  rarity: string;
  class: string;
  movement: string;
  range: string;
  reload: string;
  releaseYear: number;
  image: string;
}

// Dummy data for 5 brawlers
export const brawlers: Brawler[] = [
  {
    name: "Shelly",
    rarity: "Starter",
    class: "Damage Dealer",
    movement: "Normal",
    range: "Medium",
    reload: "Fast",
    releaseYear: 2018,
    image: "/shelly.png"
  },
  {
    name: "Spike",
    rarity: "Legendary",
    class: "Assassin",
    movement: "Very Fast",
    range: "Short",
    reload: "Very Fast",
    releaseYear: 2020,
    image: "/spike.png"
  },
  {
    name: "Colt",
    rarity: "Rare",
    class: "Sharpshooter",
    movement: "Normal",
    range: "Long",
    reload: "Normal",
    releaseYear: 2018,
    image: "/colt.png"
  },
  {
    name: "Poco",
    rarity: "Epic",
    class: "Support",
    movement: "Normal",
    range: "Medium",
    reload: "Slow",
    releaseYear: 2019,
    image: "/poco.png"
  },
  {
    name: "El Primo",
    rarity: "Super Rare",
    class: "Tank",
    movement: "Fast",
    range: "Short",
    reload: "Fast",
    releaseYear: 2018,
    image: "/el_primo.png"
  }
];

// Hardcoded correct answer for testing
export const correctBrawler = brawlers[1]; // Spike
