// Shared game mode name union used across Daily and Survival where needed
// Keeps the union centralized to avoid cross-imports between stores
export type GameModeName = 'classic' | 'gadget' | 'starpower' | 'audio' | 'pixels';

export const allGameModes: GameModeName[] = ['classic', 'gadget', 'starpower', 'audio', 'pixels'];
