import React, { useState, useEffect, useRef } from 'react';
// removed unused Card import
import { t, getLanguage } from '@/lib/i18n';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import { brawlers, Brawler, getBrawlerLocalizedName } from '@/data/brawlers';
import { toast } from 'sonner';
import { fetchDailyChallenge, getTimeUntilNextChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
// removed unused Image import
import { cn } from '@/lib/utils';
import { Play, Volume2 } from 'lucide-react';
import { getPortrait } from '@/lib/image-helpers';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ReactConfetti from 'react-confetti';
import VictorySection from '../components/VictoryPopup';
// removed unused GameModeTracker and HomeButton imports

// Helper to get a hardcoded list of available audio files
const getAvailableAudioFiles = (): string[] => {
  return [
    'kaze_atk_sfx_01.ogg',
    'kaze_atk_sfx_02.ogg',
    'jae_atk_2_01.ogg',
    'jae_atk_1_01.ogg',
    'meeple_atk_01.ogg',
    'shade_atk_vo_03.ogg',
    'shade_atk_vo_01.ogg',
    'shade_atk_vo_02.ogg',
    'shade_atk_02.ogg',
    'juju_water_atk_01.ogg',
    'juju_forest_atk_01.ogg',
    'juju_earth_atk_01.ogg',
    'kenji_atk_vo_09.ogg',
    'kenji_atk_vo_07.ogg',
    'kenji_atk_vo_08.ogg',
    'kenji_atk_vo_06.ogg',
    'kenji_atk_vo_04.ogg',
    'kenji_atk_vo_05.ogg',
    'kenji_atk_vo_02.ogg',
    'kenji_atk_vo_03.ogg',
    'kenji_atk_vo_01.ogg',
    'kenji_atk_sfx_01.ogg',
    'kenji_atk_sfx_02.ogg',
    'moe_drill_atk_vo_06.ogg',
    'moe_rockthrow_atk_01.ogg',
    'moe_drill_atk_vo_05.ogg',
    'moe_drill_atk_vo_03.ogg',
    'moe_drill_atk_vo_04.ogg',
    'moe_drill_atk_vo_01.ogg',
    'moe_drill_atk_vo_02.ogg',
    'moe_drill_atk_sfx_01.ogg',
    'moe_atk_vo_05.ogg',
    'moe_atk_vo_06.ogg',
    'moe_atk_vo_03.ogg',
    'moe_atk_vo_04.ogg',
    'moe_atk_vo_02.ogg',
    'moe_atk_vo_01.ogg',
    'ddracos_atk_vo_07.ogg',
    'ddracos_atk_vo_08.ogg',
    'ddracos_atk_vo_06.ogg',
    'ddracos_atk_vo_04.ogg',
    'ddracos_atk_vo_05.ogg',
    'ddracos_atk_vo_03.ogg',
    'ddracos_atk_vo_01.ogg',
    'ddracos_atk_vo_02.ogg',
    'amber_ice_atk_vo_02.ogg',
    'amber_ice_atk_vo_03.ogg',
    'amber_ice_atk_vo_01.ogg',
    'amber_ice_atk_vo_06.ogg',
    'amber_ice_atk_vo_05.ogg',
    'amber_ice_atk_vo_04.ogg',
    'amber_ice_atk_vo_07.ogg',
    'lily_atk_01.ogg',
    'lily_ulti_atk_01.ogg',
    'draco_atk_vo_08.ogg',
    'draco_atk_gui_08.ogg',
    'draco_atk_gui_09.ogg',
    'draco_atk_gui_14.ogg',
    'draco_atk_gui_15.ogg',
    'draco_atk_gui_02.ogg',
    'draco_atk_gui_03.ogg',
    'draco_atk_gui_01.ogg',
    'draco_atk_gui_12.ogg',
    'draco_atk_gui_13.ogg',
    'draco_atk_gui_11.ogg',
    'draco_atk_gui_06.ogg',
    'draco_atk_gui_07.ogg',
    'draco_atk_gui_05.ogg',
    'draco_atk_vo_03.ogg',
    'draco_atk_gui_10.ogg',
    'draco_atk_gui_04.ogg',
    'draco_ulti_atk_sfx_01.ogg',
    'draco_atk_vo_06.ogg',
    'draco_atk_vo_07.ogg',
    'draco_atk_vo_05.ogg',
    'draco_atk_vo_02.ogg',
    'draco_atk_vo_04.ogg',
    'draco_atk_vo_01.ogg',
    'draco_atk_sfx_01.ogg',
    'melodie_atk_sfx_01.ogg',
    'angelo_atk_01.ogg',
    'kit_ulti_atk_01.ogg',
    'kit_atk_vo_03.ogg',
    'kit_atk_vo_04.ogg',
    'kit_atk_vo_02.ogg',
    'kit_atk_vo_01.ogg',
    'kit_atk_01.ogg',
    'lawrie_win_atk_01.ogg',
    'mico_ulti_atk_01.ogg',
    'chuck_atk_01.ogg',
    'mico_atk_01.ogg'
  ];
};

// Helper to get a random audio file for a brawler from the AttackSounds folder
const getRandomAudioFile = (brawler: string, files: string[]) => {
  if (!brawler) return '';
  const normalized = brawler.toLowerCase().replace(/ /g, '');
  // Find all files that start with the brawler's name (case-insensitive)
  const matches = files.filter(f => f.toLowerCase().startsWith(normalized));
  if (matches.length === 0) return '';
  return matches[Math.floor(Math.random() * matches.length)]; // Return just the filename
};

// Helper to extract brawler name from audio filename
const extractBrawlerNameFromFilename = (filename: string): string | null => {
  if (!filename) return null;
  
  // Remove the file extension and get just the filename
  const nameWithoutExt = filename.replace(/\.ogg$/, '');
  
  // Extract the part before the first underscore
  const brawlerPart = nameWithoutExt.split('_')[0];
  
  if (!brawlerPart) return null;
  
  // Handle special cases and normalize the name
  const normalizedName = brawlerPart.toLowerCase();
  
  // Map of filename prefixes to actual brawler names
  const nameMapping: { [key: string]: string } = {
    'kaze': 'Kaze',
    'jae': 'Jae-Yong',
    'meeple': 'Meeple',
    'shade': 'Shade',
    'juju': 'Juju',
    'juju_water': 'Juju',
    'juju_forest': 'Juju', 
    'juju_earth': 'Juju',
    'kenji': 'Kenji',
    'moe': 'Moe',
    'moe_drill': 'Moe',
    'moe_rockthrow': 'Moe',
    'ddracos': 'Draco',
    'draco': 'Draco',
    'draco_ulti': 'Draco',
    'amber': 'Amber',
    'amber_ice': 'Amber',
    'lily': 'Lily',
    'lily_ulti': 'Lily',
    'melodie': 'Melodie',
    'angelo': 'Angelo',
    'kit': 'Kit',
    'kit_ulti': 'Kit',
    'lawrie': 'Larry & Lawrie',
    'lawrie_win': 'Larry & Lawrie',
    'larry': 'Larry & Lawrie',
    'mico': 'Mico',
    'mico_ulti': 'Mico',
    'chuck': 'Chuck',
    'elprimo': 'El Primo',
    'pearl': 'Pearl',
    'berry': 'Berry',
    'clancy': 'Clancy',
    'hank': 'Hank',
    'mandy': 'Mandy',
    'chester': 'Chester',
    'chester2': 'Chester',
    'gray': 'Gray',
    'willow': 'Willow',
    'doug': 'Doug',
    'bonnie': 'Bonnie',
    'grom': 'Grom',
    'grom_ulti': 'Grom',
    'fang': 'Fang',
    'fang_ulti': 'Fang',
    'eve': 'Eve',
    'janet': 'Janet',
    'otis': 'Otis',
    'sam': 'Sam',
    'buster': 'Buster',
    'gus': 'Gus',
    '8bit': '8-Bit',
    'bea': 'Bea',
    'bea_mon': 'Bea',
    'buzz': 'Buzz',
    'buzz_ulti': 'Buzz',
    'buzz_ulti_dog': 'Buzz',
    'buzzilla': 'Buzz',
    'carl': 'Carl',
    'emz': 'Emz',
    'gene': 'Gene',
    'jacky': 'Jacky',
    'jacky_summer': 'Jacky',
    'lou': 'Lou',
    'max': 'Max',
    'mortis': 'Mortis',
    'evil_mortis': 'Mortis',
    'mecha_mortis': 'Mortis',
    'mrp': 'Mr. P',
    'nita': 'Nita',
    'surge': 'Surge',
    'crow': 'Crow',
    'mech_crow': 'Crow',
    'spike': 'Spike',
    'mech_spike': 'Spike',
    'barley': 'Barley',
    'barley_fire': 'Barley',
    'jessie': 'Jessie',
    'water_jessie': 'Jessie',
    'brock': 'Brock',
    'water_brock': 'Brock',
    'rosa': 'Rosa',
    'rocket_rose': 'Rosa',
    'rt': 'R-T'
  };
  
  // Check if there's a mapping for this name
  if (nameMapping[normalizedName]) {
    return nameMapping[normalizedName];
  }
  
  // For regular names, capitalize first letter
  return brawlerPart.charAt(0).toUpperCase() + brawlerPart.slice(1).toLowerCase();
};

const DEFAULT_AUDIO = '';

interface AudioChallenge {
  brawler: string;
  audioFile?: string;
}

const modeOrder = [
  { name: 'Classic Mode', route: '/classic' },
  { name: 'Audio Mode', route: '/audio' },
  { name: 'Gadget Mode', route: '/gadget' },
  { name: 'Star Power Mode', route: '/starpower' },
];

interface AudioModeProps {
  brawlerId?: number;
  onRoundEnd?: (result: { success: boolean, brawlerName?: string }) => void;
  maxGuesses?: number;
  isEndlessMode?: boolean;
  isSurvivalMode?: boolean;
  skipVictoryScreen?: boolean;
}

const AudioMode = ({
  brawlerId,
  onRoundEnd,
  maxGuesses = 6,
  isEndlessMode: propIsEndlessMode = false,
  isSurvivalMode = false,
  skipVictoryScreen = false
}: AudioModeProps = {}) => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [guessesLeft, setGuessesLeft] = useState(maxGuesses);
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<AudioChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState<{ hours: number; minutes: number; seconds?: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [audioFile, setAudioFile] = useState<string>('');
  const [yesterdayAudio, setYesterdayAudio] = useState<{ audio: string, brawler: string } | null>(null);
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [correctBrawlerName, setCorrectBrawlerName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameKey, setGameKey] = useState(Date.now().toString()); // Key to force re-render
  const victoryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Hint system state
  const [showHint, setShowHint] = useState(false);
  const [hintAudioFile, setHintAudioFile] = useState<string>('');
  const [isHintPlaying, setIsHintPlaying] = useState(false);
  const [hintAudioReady, setHintAudioReady] = useState(false);
  const [hintAudioError, setHintAudioError] = useState(false);
  const hintAudioRef = useRef<HTMLAudioElement | null>(null);

  // Confetti window size
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resultRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // CRITICAL: This effect detects when brawlerId changes and resets the game
  useEffect(() => {
    console.log(`AudioMode: brawlerId changed to ${brawlerId}`);
    
    // Reset game state when brawlerId changes (critical for Survival Mode)
    setGuess('');
    setGuesses([]);
    setSelectedBrawler(null);
    setAttempts(0);
    setGuessesLeft(maxGuesses);
    setIsCorrect(false);
    setShowResult(false);
    setIsGameOver(false);
    setShowConfetti(false);
    setGuessCount(0);
    setIsPlaying(false);
    
    // Generate a new key to force complete component re-initialization
    setGameKey(Date.now().toString());
    
    // For survival mode, we should call loadChallenge to pick random audio
    // For non-survival mode with brawlerId, we can still use the old logic
    if (isSurvivalMode) {
      // Only load if audio files are already available
      if (audioFiles.length > 0) {
        loadChallenge();
      }
    } else if (brawlerId !== undefined) {
      // Load the new audio challenge for this specific brawler (non-survival mode)
      loadSurvivalModeAudio(brawlerId);
    }
  }, [brawlerId]); // Re-run when brawlerId changes
  
  // Effect to load challenge when audioFiles are ready and we're in survival mode
  useEffect(() => {
    if (isSurvivalMode && audioFiles.length > 0 && !dailyChallenge) {
      console.log('Audio files loaded, loading survival mode challenge');
      loadChallenge();
    }
  }, [audioFiles, isSurvivalMode]); // Re-run when audioFiles or isSurvivalMode changes

  // Load all audio file names - using hardcoded list for reliability
  useEffect(() => {
    console.log('Loading audio files for AudioMode');
    
    // Use the hardcoded list of known audio files
    const files = getAvailableAudioFiles();
    console.log(`Loaded ${files.length} audio files`);
    setAudioFiles(files);
    
    // Load previous day's challenge
    fetchYesterday();
    
    // Set up timer for next challenge countdown
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Confetti effect timer
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Function to load a specific audio for a brawler in Survival Mode
  const loadSurvivalModeAudio = (requestedBrawlerId: number) => {
    setIsLoading(true);
    
    try {
      // Validate the requested brawler ID is within range
      if (requestedBrawlerId <= 0 || requestedBrawlerId > brawlers.length) {
        console.warn(`Brawler ID ${requestedBrawlerId} is out of range (1-${brawlers.length}). Using fallback.`);
        // Use a fallback brawler instead of throwing an error
        const fallbackBrawler = brawlers[0]; // Use first brawler as fallback
        const fallbackAudio = getRandomAudioFile(fallbackBrawler.name, audioFiles);
        
        const challenge: AudioChallenge = {
          brawler: fallbackBrawler.name,
          audioFile: fallbackAudio ? `/AttackSounds/${fallbackAudio}` : ''
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio ? `/AttackSounds/${fallbackAudio}` : '');
        setCorrectBrawlerName(fallbackBrawler.name);
        setIsLoading(false);
        setAudioError(false);
        setAudioReady(true);
        return;
      }
      
      // Find the specified brawler
      const brawler = brawlers.find(b => b.id === requestedBrawlerId);
      if (!brawler) {
        console.error(`Brawler with ID ${requestedBrawlerId} not found in data array`);
        // Use a default brawler as fallback
        const fallbackBrawlerId = 1; // Shelly
        const fallbackBrawler = brawlers.find(b => b.id === fallbackBrawlerId) || brawlers[0];
        const fallbackAudio = getRandomAudioFile(fallbackBrawler.name, audioFiles);
        
        const challenge: AudioChallenge = {
          brawler: fallbackBrawler.name,
          audioFile: fallbackAudio ? `/AttackSounds/${fallbackAudio}` : ''
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio ? `/AttackSounds/${fallbackAudio}` : '');
        setCorrectBrawlerName(fallbackBrawler.name);
        setIsLoading(false);
        setAudioError(false);
        setAudioReady(true);
        return;
      }
      
      console.log(`Loading audio for brawler: ${brawler.name} (ID: ${requestedBrawlerId})`);
      
      // Get a random audio file for this brawler
      const audio = getRandomAudioFile(brawler.name, audioFiles);
      
      // If no audio found, use a fallback
      if (!audio) {
        console.warn(`No audio found for ${brawler.name}, using fallback`);
        // Use a generic sound effect as fallback
        const fallbackAudio = '/audio/shelly_01.mp3'; // Default audio file
        
        const challenge: AudioChallenge = {
          brawler: brawler.name,
          audioFile: fallbackAudio ? `/AttackSounds/${fallbackAudio}` : ''
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio ? `/AttackSounds/${fallbackAudio}` : '');
        setCorrectBrawlerName(brawler.name);
        setIsLoading(false);
        setAudioError(false);
        setAudioReady(true);
        return;
      }
      
      // Set the challenge with the found audio
      const challenge: AudioChallenge = {
        brawler: brawler.name,
        audioFile: audio ? `/AttackSounds/${audio}` : ''
      };
      
      setDailyChallenge(challenge);
      setAudioFile(audio ? `/AttackSounds/${audio}` : '');
      setCorrectBrawlerName(brawler.name);
      
      // Load hint audio (different audio file for the same brawler)
      const availableAudios = audioFiles.filter(f => {
        const normalized = brawler.name.toLowerCase().replace(/ /g, '');
        return f.toLowerCase().startsWith(normalized) && f !== audio;
      });
      
      if (availableAudios.length > 0) {
        const hintAudio = availableAudios[Math.floor(Math.random() * availableAudios.length)];
        setHintAudioFile(`/AttackSounds/${hintAudio}`);
        setHintAudioReady(true);
        setHintAudioError(false);
      } else {
        setHintAudioFile('');
        setHintAudioReady(false);
      }
      
      setIsLoading(false);
      setAudioError(false);
      setAudioReady(true);
    } catch (error) {
      console.error('Error loading survival mode audio:', error);
      setIsLoading(false);
      setAudioError(true);
    }
  };

  // Master function to load the appropriate challenge
  const loadChallenge = async () => {
    setIsLoading(true);
    
    try {
      // If in survival mode, pick a random audio file and extract brawler name
      if (isSurvivalMode) {
        console.log('Loading random audio file for Survival Mode Audio challenge');
        
        if (audioFiles.length === 0) {
          console.warn('No audio files available for survival mode');
          setIsLoading(false);
          setAudioError(true);
          return;
        }
        
        // Pick a random audio file
        const randomIndex = Math.floor(Math.random() * audioFiles.length);
        const selectedAudioFile = audioFiles[randomIndex];
        
        console.log(`Selected random audio file: ${selectedAudioFile}`);
        
        // Extract brawler name from filename
        const extractedBrawlerName = extractBrawlerNameFromFilename(selectedAudioFile);
        
        if (!extractedBrawlerName) {
          console.error(`Could not extract brawler name from filename: ${selectedAudioFile}`);
          // Try another file or use fallback
          const fallbackBrawler = "Amber";
          const fallbackAudio = "amber_atk_01.ogg";
          
          const challenge: AudioChallenge = {
            brawler: fallbackBrawler,
            audioFile: `/AttackSounds/${fallbackAudio}`
          };
          
          setDailyChallenge(challenge);
          setAudioFile(`/AttackSounds/${fallbackAudio}`);
          setCorrectBrawlerName(fallbackBrawler);
          setIsLoading(false);
          setAudioReady(true);
          setAudioError(false);
          return;
        }
        
        // Verify the extracted brawler name exists in our brawlers data
        const matchingBrawler = brawlers.find(b => 
          b.name.toLowerCase() === extractedBrawlerName.toLowerCase()
        );
        
        if (!matchingBrawler) {
          console.warn(`Extracted brawler name "${extractedBrawlerName}" not found in brawlers data. Available brawlers:`, brawlers.map(b => b.name));
          // Try to find a close match or use fallback
          const fallbackBrawler = "Amber";
          const fallbackAudio = "amber_atk_01.ogg";
          
          const challenge: AudioChallenge = {
            brawler: fallbackBrawler,
            audioFile: `/AttackSounds/${fallbackAudio}`
          };
          
          setDailyChallenge(challenge);
          setAudioFile(`/AttackSounds/${fallbackAudio}`);
          setCorrectBrawlerName(fallbackBrawler);
          setIsLoading(false);
          setAudioReady(true);
          setAudioError(false);
          return;
        }
        
        console.log(`Successfully matched brawler: ${matchingBrawler.name}`);
        
        const challenge: AudioChallenge = {
          brawler: matchingBrawler.name,
          audioFile: `/AttackSounds/${selectedAudioFile}`
        };
        
        setDailyChallenge(challenge);
        setAudioFile(`/AttackSounds/${selectedAudioFile}`);
        setCorrectBrawlerName(matchingBrawler.name);
        
        // Load hint audio (different audio file for the same brawler)
        const availableAudios = audioFiles.filter(f => {
          const normalized = matchingBrawler.name.toLowerCase().replace(/ /g, '');
          return f.toLowerCase().startsWith(normalized) && f !== selectedAudioFile;
        });
        
        if (availableAudios.length > 0) {
          const hintAudio = availableAudios[Math.floor(Math.random() * availableAudios.length)];
          setHintAudioFile(`/AttackSounds/${hintAudio}`);
          setHintAudioReady(true);
          setHintAudioError(false);
        } else {
          setHintAudioFile('');
          setHintAudioReady(false);
        }
        
        setIsLoading(false);
        setAudioReady(true);
        setAudioError(false);
        return;
      }
      
      // For non-survival modes, use the brawlerId if provided
      if (brawlerId !== undefined) {
        await loadSurvivalModeAudio(brawlerId);
        return;
      }
      
      // Fetch daily challenge from backend
      try {
        const data = await fetchDailyChallenge('audio');
        if (data?.success) {
          const audio = data.audio;
          const randomAudioFile = getRandomAudioFile(audio.brawler, audioFiles);
          const challenge: AudioChallenge = {
            brawler: audio.brawler,
            audioFile: audio.file || (randomAudioFile ? `/AttackSounds/${randomAudioFile}` : '')
          };
          
          setDailyChallenge(challenge);
          setAudioFile(challenge.audioFile || '');
          setCorrectBrawlerName(challenge.brawler);
        } else {
          throw new Error('Failed to fetch audio challenge');
        }
      } catch (error) {
        console.error('Error fetching audio challenge:', error);
        
        // Use a fallback brawler and audio
        const fallbackBrawler = "Shelly";
        const fallbackAudio = getRandomAudioFile(fallbackBrawler, audioFiles);
        
        const challenge: AudioChallenge = {
          brawler: fallbackBrawler,
          audioFile: fallbackAudio ? `/AttackSounds/${fallbackAudio}` : ''
        };
        
        setDailyChallenge(challenge);
        setAudioFile(fallbackAudio ? `/AttackSounds/${fallbackAudio}` : '');
        setCorrectBrawlerName(fallbackBrawler);
        
        toast("Offline Mode", {
          description: "Using local fallback data as server could not be reached."
        });
      }
    } catch (error) {
      console.error('Error in loadChallenge:', error);
      setAudioError(true);
    } finally {
      setIsLoading(false);
      setAudioReady(true);
    }
  };

  // Fetch yesterday's audio
  const fetchYesterday = async () => {
    try {
      const yesterdayData = await fetchYesterdayChallenge('audio');
      if (yesterdayData && typeof yesterdayData === 'object' && yesterdayData.brawler) {
        const yesterdayBrawler = yesterdayData.brawler;
        const audioFile = getRandomAudioFile(yesterdayBrawler, audioFiles);
        setYesterdayAudio({
          brawler: yesterdayBrawler,
          audio: audioFile ? `/AttackSounds/${audioFile}` : ''
        });
      }
    } catch (error) {
      console.error('Error fetching yesterday audio:', error);
      // No need to display toast for this, it's not critical
    }
  };

  // Reset the game
  const resetGame = () => {
    setGuess('');
    setGuesses([]);
    setSelectedBrawler(null);
    setAttempts(0);
    setGuessesLeft(maxGuesses);
    setIsCorrect(false);
    setShowResult(false);
    setIsGameOver(false);
    setGuessCount(0);
    setShowConfetti(false);
    
    // For endless mode, we need to generate a new random challenge
    if (propIsEndlessMode) {
      // Choose a random brawler
      const randomBrawlerIndex = Math.floor(Math.random() * brawlers.length);
      const randomBrawler = brawlers[randomBrawlerIndex];
      
      const randomAudio = getRandomAudioFile(randomBrawler.name, audioFiles);
      
      const challenge: AudioChallenge = {
        brawler: randomBrawler.name,
        audioFile: randomAudio ? `/AttackSounds/${randomAudio}` : ''
      };
      
      setDailyChallenge(challenge);
      setAudioFile(randomAudio ? `/AttackSounds/${randomAudio}` : '');
      setCorrectBrawlerName(randomBrawler.name);
      setAudioReady(true);
    }
  };

  const playAudio = () => {
    if (!audioFile || isPlaying) return;
    
    console.log(`Attempting to play audio: ${audioFile}`);
    setIsPlaying(true);
    
    // Clean up any existing audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', () => {});
      audioRef.current.removeEventListener('error', () => {});
      audioRef.current = null;
    }
    
    // Create and configure a new audio element
    audioRef.current = new Audio(audioFile);
    
    // Set up event listeners
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      console.log('Audio playback ended');
    });
    
    audioRef.current.addEventListener('error', (error) => {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      setAudioError(true);
      toast.error(`Error playing audio: ${audioFile}`);
    });
    
    audioRef.current.addEventListener('loadstart', () => {
      console.log('Audio loading started');
    });
    
    audioRef.current.addEventListener('canplay', () => {
      console.log('Audio can start playing');
    });
    
    // Play the audio
    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setAudioError(true);
      toast.error(`Error playing audio: ${error.message}`);
    });
  };

  const playHintAudio = () => {
    if (!hintAudioFile || isHintPlaying || hintAudioError) return;

    console.log(`Attempting to play hint audio: ${hintAudioFile}`);
    setIsHintPlaying(true);
    
    // Clean up any existing hint audio element
    if (hintAudioRef.current) {
      hintAudioRef.current.pause();
      hintAudioRef.current.removeEventListener('ended', () => {});
      hintAudioRef.current.removeEventListener('error', () => {});
      hintAudioRef.current = null;
    }
    
    // Create and configure a new audio element
    hintAudioRef.current = new Audio(hintAudioFile);
    
    // Set up event listeners
    hintAudioRef.current.addEventListener('ended', () => {
      setIsHintPlaying(false);
      console.log('Hint audio playback ended');
    });
    
    hintAudioRef.current.addEventListener('error', (error) => {
      console.error('Hint audio playback error:', error);
      setIsHintPlaying(false);
      setHintAudioError(true);
      toast.error(`Error playing hint audio: ${hintAudioFile}`);
    });
    
    // Play the hint audio
    hintAudioRef.current.play().catch(error => {
      console.error('Error playing hint audio:', error);
      setIsHintPlaying(false);
      setHintAudioError(true);
      toast.error(`Error playing hint audio: ${error.message}`);
    });
  };

  const handleGuess = () => {
    if (!dailyChallenge || showResult || !selectedBrawler) return;

    const currentGuess = selectedBrawler.name;
    
    // Check if already guessed
    if (guesses.includes(currentGuess)) {
      toast('Already guessed', {
        description: `You've already guessed ${currentGuess}!`,
      });
      return;
    }

    // Add to guesses
    setGuesses([...guesses, currentGuess]);
    setGuess('');
    setSelectedBrawler(null);
    setAttempts(attempts + 1);
    setGuessCount(guessCount + 1);
    
    if (isSurvivalMode) {
      // In survival mode, don't manage local guesses - let the parent handle it
      // The parent (SurvivalMode) will track guesses through its own state
    } else {
      // Only manage local guesses in non-survival modes
      setGuessesLeft(prev => prev - 1);
    }
    
    // Check if correct
    const isThisGuessCorrect = currentGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
    
    if (isThisGuessCorrect) {
      setIsCorrect(true);
      setShowResult(true);
      setIsGameOver(true);
      setShowConfetti(true);
      
      if (isSurvivalMode && onRoundEnd) {
        // Allow parent component to handle the success, passing the correct brawler name
        onRoundEnd({ 
          success: true,
          brawlerName: currentGuess // Use the brawler name that was just guessed correctly
        });
      } else {
        toast('Correct!', {
          description: `You found ${dailyChallenge.brawler} in ${attempts + 1} guesses!`,
        });
        
        // For endless mode, prepare for the next round after a delay
        if (propIsEndlessMode) {
          setTimeout(() => {
            resetGame();
          }, 3000);
        }
      }
    }
    // Check if out of guesses
    else {
      // Show hint after 4 wrong guesses if hint audio is available
      if (attempts + 1 >= 4 && hintAudioFile && !showHint) {
        setShowHint(true);
      }
      
      const outOfGuesses = isSurvivalMode ? attempts + 1 >= maxGuesses : attempts + 1 >= maxGuesses;
      
      if (outOfGuesses) {
        // Out of guesses
        setShowResult(true);
        setIsGameOver(true);
        
        if (isSurvivalMode && onRoundEnd) {
          // Allow parent component to handle the failure
          onRoundEnd({ success: false, brawlerName: dailyChallenge.brawler });
        } else {
          toast('Game Over', {
            description: `The correct brawler was ${dailyChallenge.brawler}.`,
          });
        }
      }
    }
  };

  const handleBrawlerSelect = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
    setGuess(brawler.name);
    // Immediately submit the guess
    handleGuess();
  };

  const update = () => {
    // Update time till next challenge
    const nextTime = getTimeUntilNextChallenge();
    setTimeUntilNext({
      hours: nextTime.hours,
      minutes: nextTime.minutes,
      seconds: 0 // Default to 0 as getTimeUntilNextChallenge doesn't return seconds
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <Volume2 size={36} className="text-white/30" />
          </div>
          <div className="h-6 w-40 bg-white/10 rounded-full"></div>
          <div className="h-4 w-60 bg-white/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!dailyChallenge) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Error Loading Challenge</h2>
        <p className="text-gray-300 mb-6">There was a problem loading today's audio challenge.</p>
        <Button onClick={loadChallenge}>Try Again</Button>
      </div>
    );
  }

  return (
    <div key={gameKey} className="survival-mode-container survival-audio-theme">
      {/* Confetti effect for correct guesses */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* Header Section */}
      <div className="survival-mode-header">
        {/* Title Section */}
        <div className="survival-mode-title-section">
          <h1 className="survival-mode-title">
            {t('survival.guess.sound')}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="survival-mode-content">
        {/* Game Card */}
        <div className="survival-mode-game-card survival-mode-animate-pulse">
          <div className="survival-mode-card-content">
            {/* Main Challenge Content */}
            <div className="survival-mode-input-section">
              {/* Audio Player */}
              <div className="flex flex-col items-center mb-1">
                <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-1 flex items-center justify-center">
                  {/* Sound Icon Background */}
                  <div className={cn(
                    "w-full h-full rounded-full flex items-center justify-center transition-all duration-300",
                    isPlaying ? "bg-blue-500/20 animate-pulse" : "bg-white/10",
                    audioError && "bg-red-500/20"
                  )}>
                    {/* Play Button */}
                    <button
                      onClick={playAudio}
                      disabled={isPlaying || !audioReady || audioError}
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-lg transition-all",
                        isPlaying ? "bg-blue-500 scale-95" : "bg-blue-600 hover:bg-blue-500",
                        "border-4 border-white",
                        audioError && "bg-red-500 cursor-not-allowed"
                      )}
                    >
                      {isPlaying ? (
                        <Volume2 size={20} className="text-white animate-pulse" />
                      ) : (
                        <Play size={20} className="text-white ml-1" />
                      )}
                    </button>
                    
                    {/* Audio visualization rings (show during playback) */}
                    {isPlaying && (
                      <>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-400/40 animate-ping-slow"></div>
                        <div className="absolute inset-[-15px] rounded-full border-2 border-blue-300/30 animate-ping-slow-2"></div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Status Text */}
                <div className="text-center">
                  <p className="text-sm md:text-base text-white/80 max-w-md mx-auto italic">
                    {audioError 
                      ? "Error playing audio. Please try again later." 
                      : isPlaying 
                        ? "Now playing..." 
                        : t('survival.click.play.sound')
                    }
                  </p>
                  {/* Guess Input */}
                  <div className="mt-4 w-full max-w-xs mx-auto">
                    <BrawlerAutocomplete
                      brawlers={brawlers}
                      value={guess}
                      onChange={setGuess}
                      onSelect={handleBrawlerSelect}
                      onSubmit={handleGuess}
                      disabled={showResult || isGameOver}
                      disabledBrawlers={guesses}
                    />
                  </div>
                {/* Show brawler name if game is over */}
                {showResult ? (
                  <>
                    <h2 className="text-xl md:text-2xl font-extrabold text-brawl-yellow mt-4">
                      {dailyChallenge.brawler}
                    </h2>
                    <span className={`text-2xl font-extrabold ${(maxGuesses - attempts) <= 3 ? 'text-red-400 animate-bounce' : 'text-white'}`}>{maxGuesses - attempts}</span>
                  </>
                ) : (
                  <div className="survival-mode-guess-counter">
                    <span className="text-base font-semibold">Number of Guesses</span>
                    <span className="text-base font-bold">{attempts}</span>
                  </div>
                )}
                </div>
              </div>
              </div>
            </div>
          </div>

        {/* Previous Guesses */}
        <div className="survival-mode-guesses-section">
          <div className="survival-mode-guesses-grid">
            {guesses.map((pastGuess, idx) => {
              const isCorrect = pastGuess.toLowerCase() === dailyChallenge.brawler.toLowerCase();
              const isLastGuess = idx === guesses.length - 1;
              return (
                <div
                  key={idx}
                  className={cn(
                    "survival-mode-guess-item",
                    isCorrect ? "survival-mode-guess-correct" : "survival-mode-guess-incorrect",
                    !isCorrect && isLastGuess ? "animate-shake" : ""
                  )}
                >
                  <img
                    src={getPortrait(pastGuess)}
                    alt={pastGuess}
                    className="survival-mode-guess-portrait"
                  />
                  <span className="survival-mode-guess-name">
                    {pastGuess}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Victory popup - only show if not in survival mode */}
        {isGameOver && !skipVictoryScreen && (
          <div ref={victoryRef}>
            {(() => {
              try {
                return (
                  <VictorySection
                    brawlerName={correctBrawlerName}
                    brawlerPortrait={getPortrait(correctBrawlerName)}
                    tries={guessCount}
                    mode="audio"
                    nextModeKey="gadget"
                    onNextMode={() => navigate('/gadget')}
                    nextBrawlerIn={timeUntilNext ? `${timeUntilNext.hours}h ${timeUntilNext.minutes}m ${timeUntilNext.seconds}s` : undefined}
                    yesterdayBrawlerName={yesterdayAudio?.brawler}
                    yesterdayBrawlerPortrait={yesterdayAudio?.audio ? undefined : undefined}
                    onShare={undefined}
                  />
                );
              } catch (error) {
                console.error("Error rendering VictorySection:", error);
                return (
                  <div className="p-6 bg-red-800/30 rounded-xl text-white">
                    <h2 className="text-2xl font-bold mb-4">Victory!</h2>
                    <p>You guessed the brawler: <strong>{correctBrawlerName}</strong></p>
                    <p className="mt-2">Number of tries: {guessCount}</p>
                    <button
                      onClick={() => navigate('/gadget')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Next Mode: Gadget
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        )}

        {/* Yesterday's Audio */}
        {yesterdayAudio && yesterdayAudio.audio && (
          <div className="w-full flex flex-col items-center justify-center mt-8">
            <div className="text-white text-lg md:text-xl font-bold mb-2 mt-2" style={{textShadow: '2px 2px 0 #222'}}>Yesterday's Attack Sound</div>
            <div className="flex items-center gap-2 mb-2">
              <button
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-yellow-400 bg-black/70 shadow text-brawl-yellow text-2xl"
                onClick={() => {
                  const audio = new Audio(yesterdayAudio.audio);
                  audio.play();
                }}
                style={{ outline: 'none' }}
              >
                <Play size={24} className="text-brawl-yellow" />
              </button>
              <span className="text-brawl-green text-lg md:text-2xl font-extrabold drop-shadow-sm" style={{textShadow: '2px 2px 0 #222'}}>
                {getBrawlerLocalizedName(yesterdayAudio.brawler, getLanguage())}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioMode;
