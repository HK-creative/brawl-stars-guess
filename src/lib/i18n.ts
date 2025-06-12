// This is a simple i18n implementation that will be replaced with a proper i18n library later
// For now it supports English and Hebrew as requested

export type SupportedLanguages = 'en' | 'he';

type Translations = {
  [key: string]: {
    [key in SupportedLanguages]: string;
  };
};

// Comprehensive translations for the entire app
const translations: Translations = {
  "app.title": {
    en: "Brawldle",
    he: "בראולדל"
  },
  "home.tagline": {
    en: "The daily Brawl Stars guessing game",
    he: "משחק הניחוש היומי של בראול סטארס"
  },
  "home.ultimate.challenge": {
    en: "The Ultimate Daily Brawl Stars Challenge",
    he: "אתגר בראול סטארס האגדי"
  },
  "home.survival.title": {
    en: "Survival",
    he: "הישרדות"
  },
  "home.ultimate.challenge.mode": {
    en: "ultimate challenge mode",
    he: "האתגר האולטימטיבי"
  },
  
  // Game Mode Names
  "mode.classic": {
    en: "Classic",
    he: "קלאסי"
  },
  "mode.audio": {
    en: "Audio",
    he: "קול"
  },
  "mode.voice": {
    en: "Voice",
    he: "קול"
  },
  "mode.gadget": {
    en: "Gadget",
    he: "גאדג'ט"
  },
  "mode.starpower": {
    en: "Star Power",
    he: "כוח כוכב"
  },
  "mode.pixels": {
    en: "Pixels",
    he: "פיקסלים"
  },
  "mode.survival": {
    en: "Survival Mode",
    he: "מצב הישרדות"
  },
  
  // Page Titles & Headers
  "mode.classic.title": {
    en: "Classic Mode",
    he: "מצב קלאסי"
  },
  "mode.audio.title": {
    en: "Audio Mode",
    he: "מצב שמע"
  },
  "mode.voice.title": {
    en: "Voice Mode",
    he: "מצב קולי"
  },
  "mode.gadget.title": {
    en: "Gadget Mode",
    he: "מצב גאדג'ט"
  },
  "mode.starpower.title": {
    en: "Star Power Mode",
    he: "מצב כוח כוכב"
  },
  "mode.pixels.title": {
    en: "Pixels Mode",
    he: "מצב פיקסלים"
  },
  "survival.setup.title": {
    en: "Survival Mode Setup",
    he: "הגדרות מצב הישרדות"
  },
  "survival.mode.title": {
    en: "SURVIVAL MODE",
    he: "מצב הישרדות"
  },
  "daily.challenge": {
    en: "Daily Challenge",
    he: "אתגר יומי"
  },
  
  // Daily Mode Specific Headlines & Descriptions
  "daily.classic.title": {
    en: "Classic Daily",
    he: "קלאסי יומי"
  },
  "daily.audio.title": {
    en: "Audio Daily", 
    he: "הקול היומי"
  },
  "daily.gadget.title": {
    en: "Gadget Daily",
    he: "הגאדג'ט היומי"  
  },
  "daily.starpower.title": {
    en: "Star Power Daily",
    he: "הכוח כוכב היומי"
  },
  "daily.pixels.title": {
    en: "Pixels Daily",
    he: "הפיקסלים היומי"
  },
  "daily.classic.headline": {
    en: "Guess Today's Brawler!",
    he: "נחשו את הבראולר היומי!"
  },
  "daily.classic.description": {
    en: "Use the clues from your guesses to find the correct brawler",
    he: "השתמשו ברמזים מניחושים קודמים כדי לנחש את הבראולר"
  },
  "daily.audio.headline": {
    en: "Guess the Brawler by their Audio!",
    he: "נחשו את הבראולר על פי הקול!"
  },
  "daily.audio.description": {
    en: "",
    he: ""
  },
  "daily.audio.click.play": {
    en: "Click to play audio",
    he: "לחץ כאן כדי לשמוע"
  },
  "daily.audio.playing": {
    en: "Playing audio...",
    he: "מנגן קול..."
  },
  "daily.gadget.headline": {
    en: "Guess the Brawler by their Gadget!",
    he: "נחשו את הבראולר על פי הגאדג'ט!"
  },
  "daily.starpower.headline": {
    en: "Guess the Brawler by their Star Power!",
    he: "נחשו את הבראולר לפי הכוח כוכב!"
  },
  "daily.pixels.headline": {
    en: "Guess the Pixelated Brawler!",
    he: "נחשו את הבראולר המפוקסל!"
  },
  
  // Search and Input
  "search.brawlers": {
    en: "Search brawlers...",
    he: "חפש בראולרים..."
  },
  "guesses.count": {
    en: "guesses",
    he: "ניסיונות"
  },
  "guesses.left": {
    en: "Guesses Left",
    he: "ניחושים שנשארו"
  },
  "next.brawler.in": {
    en: "Next Brawler In",
    he: "הבראולר הבא בעוד"
  },
  
  // Main Game Mode Descriptions (from Index.tsx)
  "mode.classic.description": {
    en: "Guess today's mystery brawler",
    he: "נחשו את הבראולר היומי"
  },
  "mode.audio.description": {
    en: "Guess by brawler voice lines",
    he: "נחשו לפי הקול של הבראולר"
  },
  "mode.gadget.description": {
    en: "Guess by gadget description",
    he: "נחשו של מי הגאדג'ט"
  },
  "mode.starpower.description": {
    en: "Guess by star power icon",
    he: "נחשו לפי הכוח כוכב"
  },
  "mode.pixels.description": {
    en: "Guess from pixelated portraits",
    he: "נחשו מתמונות מפוקסלות"
  },
  "mode.survival.description": {
    en: "Ultimate challenge mode",
    he: "מצב אתגר קיצוני"
  },
  
  // User Authentication
  "auth.ready.play": {
    en: "Ready to Play?",
    he: "מוכן לשחק?"
  },
  "auth.create.account": {
    en: "Create your Brawldle account",
    he: "צרו את החשבון שלכם"
  },
  "auth.save.progress": {
    en: "Save progress & compete!",
    he: "שמרו את ההתקדמות שלכם והתחרו באחרים!"
  },
  "auth.signup": {
    en: "Sign up",
    he: "הרשמה"
  },
  "auth.login": {
    en: "Log in",
    he: "התחבר"
  },
  "auth.save.subtext": {
    en: "to save your progress",
    he: "כדי לשמור את ההתקדמות שלך"
  },
  "auth.signin.email": {
    en: "Sign in with email",
    he: "התחבר עם אימייל"
  },
  "auth.access.stats": {
    en: "Access your Brawldle stats, save progress, and compete on leaderboards!",
    he: "שמרו התקדמות, התחרו עם אחרים, ועוד!"
  },
  "auth.email": {
    en: "Email",
    he: "אימייל"
  },
  "auth.password": {
    en: "Password",
    he: "סיסמא"
  },
  "auth.forgot.password": {
    en: "Forgot password?",
    he: "שכחת סיסמא?"
  },
  "auth.get.started": {
    en: "Get Started",
    he: "התחל"
  },
  "auth.no.account": {
    en: "Don't have an account?",
    he: "אין לך חשבון?"
  },
  "auth.reset.instructions": {
    en: "Enter your email to receive password reset instructions.",
    he: "הכנס את האימייל כדי לקבל הוראות לאיפוס הסיסמא"
  },
  "auth.join.unlock": {
    en: "Join Brawldle to unlock achievements and climb the ranks!",
    he: "צרו חשבון כדי לשמור התקדמות ולהתקדם ברמות!"
  },
  "auth.have.account": {
    en: "Already have an account?",
    he: "כבר יש לך חשבון?"
  },
  
  // Game Setup & Configuration
  "survival.configure": {
    en: "Configure your survival challenge",
    he: "בחר את אתגר ההישרדות שלך"
  },
  "survival.select.modes": {
    en: "Select game modes to play",
    he: "בחר מצבי משחק"
  },
  "survival.select.challenge.modes": {
    en: "Select your challenge modes",
    he: "בחר את מצבי המשחק"
  },
  "survival.timer.fixed": {
    en: "Fixed Timer: 150 seconds",
    he: "טיימר קבוע: 150 שניות"
  },
  "survival.timer.description": {
    en: "Each round has the same time limit regardless of difficulty.",
    he: "זמן זהה לכל סיבוב"
  },
  "survival.select.required": {
    en: "Please select at least one game mode.",
    he: "בחר לפחות מצב משחק אחד"
  },
  "survival.how.many": {
    en: "How many brawlers can you guess?",
    he: "כמה בראולרים תצליחו לגלות?"
  },
  "survival.gets.harder": {
    en: "Each correct guess makes it harder",
    he: "כל ניצחון יהפוך את הסבב הבא לקשה יותר"
  },
  
  // Survival Mode Setup Options
  "survival.classic.label": {
    en: "Classic",
    he: "קלאסי"
  },
  "survival.classic.description": {
    en: "Guess the Brawler from their image.",
    he: "נחשו את הבראולר לפי התמונה"
  },
  "survival.gadget.label": {
    en: "Gadget",
    he: "גאדג'ט"
  },
  "survival.gadget.description": {
    en: "Guess the Brawler from their Gadget icon.",
    he: "נחשו את הבראולר לפי הגאדג'ט"
  },
  "survival.starpower.label": {
    en: "Star Power",
    he: "כוח כוכב"
  },
  "survival.starpower.description": {
    en: "Guess the Brawler from their Star Power icon.",
    he: "נחשו את הבראולר לפי הכוח הכוכב"
  },
  "survival.audio.label": {
    en: "Audio",
    he: "קול"
  },
  "survival.audio.description": {
    en: "Guess the Brawler from their voice line or attack sound.",
    he: "נחשו את הבראולר לפי הקול שלו"
  },
  "survival.pixels.label": {
    en: "Pixels",
    he: "פיקסלים"
  },
  "survival.pixels.description": {
    en: "Guess the Brawler from their pixelated portrait.",
    he: "נחשו את הבראולר מהתמונה המפוקסלת"
  },
  
  // Buttons & Actions
  "button.cancel": {
    en: "Cancel",
    he: "בטל"
  },
  "button.start": {
    en: "Start",
    he: "התחל"
  },
  "button.start.game": {
    en: "Start Game",
    he: "התחל לשחק"
  },
  "button.back": {
    en: "Back",
    he: "חזור"
  },
  "button.next": {
    en: "Next",
    he: "הבא"
  },
  "button.try.again": {
    en: "Try Again",
    he: "נסה שוב"
  },
  "button.new.brawler": {
    en: "New Brawler",
    he: "בראולר חדש"
  },
  "button.reset.game": {
    en: "Reset Game",
    he: "אפס משחק"
  },
  "button.play.again": {
    en: "Play Again",
    he: "שחק שוב"
  },
  "button.try.again.new": {
    en: "Try Again / New Brawler",
    he: "נסה שוב / בראולר חדש"
  },
  
  // Game Messages & Notifications
  "error.load.challenge": {
    en: "Couldn't load today's challenge. Please try again later.",
    he: "תקלה בטעינת האתגר היומי. נסה שוב מאוחר יותר"
  },
  "error.already.guessed": {
    en: "You already guessed this brawler!",
    he: "כבר ניחשת את הבראולר הזה!"
  },
  "success.correct.guess": {
    en: "Correct! You found the right brawler!",
    he: "נכון! מצאת את הבראולר הנכון!"
  },
  "error.no.challenge": {
    en: "No Challenge Available",
    he: "אין אתגר זמין"
  },
  "error.check.later": {
    en: "Check back later for today's challenge.",
    he: "חזור מאוחר יותר לבדוק אם אתגר היום זמין"
  },
  "game.reset.manual": {
    en: "Game Reset (manual reload for new daily challenge for now)",
    he: "איפוס משחק (טען ידנית את אתגר היום החדש בינתיים)"
  },
  "voice.coming.soon": {
    en: "Voice playback coming soon!",
    he: "השמעת קול תגיע בקרוב!"
  },
  "voice.guess.prompt": {
    en: "Guess the brawler by their voice!",
    he: "נחשו את הבראולר לפי הקול שלו!"
  },
  "error.loading.challenge": {
    en: "Error Loading Challenge",
    he: "שגיאה בטעינת האתגר"
  },
  "error.gadget.challenge": {
    en: "There was a problem loading today's gadget challenge.",
    he: "הייתה בעיה בטעינת אתגר הגאדג'ט של היום"
  },
  "error.unknown": {
    en: "An unknown error occurred.",
    he: "אירעה שגיאה לא ידועה"
  },
  
  // Game Interface Elements
  "game.daily.description": {
    en: "A new brawler to guess, updated daily.",
    he: "כל יום בראולר חדש לנחש"
  },
  "game.previous.guesses": {
    en: "Previous Guesses:",
    he: "ניחושים קודמים:"
  },
  "game.attempts": {
    en: "Attempts:",
    he: "ניסיונות:"
  },
  "game.round.complete": {
    en: "Round Complete!",
    he: "הסיבוב הושלם!"
  },
  "game.round.next": {
    en: "Good job! Moving to next round.",
    he: "כל הכבוד! ממשיכים לסיבוב הבא"
  },
  "game.selected": {
    en: "selected",
    he: "נבחר"
  },
  "game.modes.selected": {
    en: "modes selected",
    he: "מצבים שנבחרו"
  },
  "game.mode": {
    en: "mode",
    he: "מצב"
  },
  "game.modes": {
    en: "modes",
    he: "מצבים"
  },
  
  // Time & Counters
  "time.per.round": {
    en: "150s per round",
    he: "150 שניות לכל סיבוב"
  },
  "time.per.round.seconds": {
    en: "150s per round",
    he: "150 שניות לכל סבב"
  },
  
  // Attribute Labels
  "attribute.brawler": {
    en: "Brawler",
    he: "ברואלר"
  },
  "attribute.rarity": {
    en: "Rarity",
    he: "נדירות"
  },
  "attribute.class": {
    en: "Class",
    he: "סוג"
  },
  "attribute.range": {
    en: "Range",
    he: "טווח ירי"
  },
  "attribute.wallbreak": {
    en: "Wallbreak",
    he: "שובר קירות"
  },
  "attribute.release.year": {
    en: "Year",
    he: "שנה"
  },
  
  // Rarity Values
  "rarity.starter": {
    en: "Starter",
    he: "ראשונה"
  },
  "rarity.rare": {
    en: "Rare",
    he: "נדיר"
  },
  "rarity.super.rare": {
    en: "Super Rare",
    he: "נדיר במיוחד"
  },
  "rarity.epic": {
    en: "Epic",
    he: "אדיר"
  },
  "rarity.mythic": {
    en: "Mythic",
    he: "מדהים"
  },
  "rarity.legendary": {
    en: "Legendary",
    he: "אגדי"
  },
  "rarity.ultra.legendary": {
    en: "Ultra Legendary",
    he: "אולטרה אגדי"
  },
  
  // Range Values
  "range.short": {
    en: "Short",
    he: "קצר"
  },
  "range.normal": {
    en: "Normal",
    he: "רגיל"
  },
  "range.long": {
    en: "Long",
    he: "רחוק"
  },
  "range.very.long": {
    en: "Very Long",
    he: "ממש רחוק"
  },
  
  // Wallbreak Values
  "wallbreak.no": {
    en: "No",
    he: "לא"
  },
  "wallbreak.yes": {
    en: "Yes",
    he: "כן"
  },
  
  // Settings
  "settings": {
    en: "Settings",
    he: "הגדרות"
  },
  "language": {
    en: "Language",
    he: "שפה"
  },
  "english": {
    en: "English",
    he: "אנגלית"
  },
  "hebrew": {
    en: "Hebrew",
    he: "עברית"
  },
  
  // Accessibility Labels
  "aria.switch.english": {
    en: "Switch to English",
    he: "עבור לאנגלית"
  },
  "aria.switch.hebrew": {
    en: "Switch to Hebrew",
    he: "עבור לעברית"
  },
  
  // Legacy translations (keeping for compatibility)
  "mode.voice.description": {
    en: "Guess the brawler by their voice lines",
    he: "נחש את הבראולר לפי קווי הקול שלהם"
  },
  "submit.guess": {
    en: "Submit Guess",
    he: "שלח ניחוש"
  },
  "coming.soon": {
    en: "Coming Soon",
    he: "בקרוב"
  },

  // Game Over Section
  "game.over": {
    en: "GAME OVER",
    he: "GAME OVER"
  },
  "game.over.correct.brawler": {
    en: "The correct brawler was:",
    he: "הבראולר הנכון היה:"
  },
  "game.over.final.score": {
    en: "Final Score",
    he: "ציון סופי"
  },
  "game.over.rounds.completed": {
    en: "Rounds Completed:",
    he: "ניצחונות:"
  },
  "game.over.home": {
    en: "Home",
    he: "דף הבית"
  },
  "game.over.try.again": {
    en: "Try Again",
    he: "שחק שוב"
  },

  // Survival Game Modes
  "survival.pts": {
    en: "pts",
    he: "נקודות"
  },
  "survival.round": {
    en: "Round",
    he: "סבב"
  },
  "survival.seconds": {
    en: "s",
    he: "שניות"
  },
  "survival.guess.gadget": {
    en: "Guess the Brawler with this Gadget",
    he: "נחש את הבראולר לפי הגאדג'ט"
  },
  "survival.guess.sound": {
    en: "Guess the Brawler by Sound",
    he: "נחש את הבראולר לפי הקול"
  },
  "survival.click.play.sound": {
    en: "Click to play attack sound",
    he: "לחץ כאן כדי לשמוע"
  },
  "survival.guess.starpower": {
    en: "Guess the Brawler with this Star Power",
    he: "נחש את הבראולר לפי הכוח כוכב"
  },

  // Correct Screen
  "correct.screen.title": {
    en: "Correct!",
    he: "ניצחת בסבב!"
  },
  "correct.screen.points.earned": {
    en: "Points earned",
    he: "נקודות שקיבלתם"
  },
  "correct.screen.base.points": {
    en: "base points",
    he: "נקודות על ניצחון"
  },
  "correct.screen.guess.bonus": {
    en: "Guess bonus",
    he: "בונוס ניסיונות"
  },
  "correct.screen.guesses.used": {
    en: "guesses used",
    he: "ניסיונות נוצלו"
  },
  "correct.screen.time.bonus": {
    en: "Time bonus",
    he: "בונוס זמן"
  },
  "correct.screen.seconds.elapsed": {
    en: "s elapsed",
    he: "שניות עברו"
  },
  "correct.screen.next.round": {
    en: "Next Round",
    he: "סבב הבא"
  },
  "correct.screen.get.ready": {
    en: "Get ready for the next challenge!",
    he: "התכוננו לסבב הבא!"
  },
  "correct.screen.total.score": {
    en: "Total Score:",
    he: "סך הנקודות שלכם:"
  },

  // Daily Modes Congratulations Section
  "daily.congratulations": {
    en: "Congratulations!",
    he: "GG EZ"
  },
  "daily.you.found": {
    en: "You found",
    he: "מצאת את"
  },
  "daily.in.guesses": {
    en: "in",
    he: "ב"
  },
  "daily.guesses.count": {
    en: "guesses!",
    he: "ניסיונות!"
  },
  "daily.ready.next.challenge": {
    en: "Ready for the next challenge?",
    he: "מוכן לאתגר הבא?"
  },
  "daily.all.modes.completed": {
    en: "All daily modes completed!",
    he: "האתגרים היומיים הושלמו בהצלחה!"
  },
  "daily.back.to": {
    en: "Back to",
    he: "חזור ל"
  },
  "daily.next.mode": {
    en: "Next Mode",
    he: "עבור ל"
  },
  "daily.go.home": {
    en: "Go Home",
    he: "דף הבית"
  },
  "auth.reset.password.title": {
    en: "Reset your password",
    he: "אפס סיסמא"
  },
  "auth.reset.link": {
    en: "Send Reset Link",
    he: "שלח קישור איפוס"
  },
  "auth.remember.password": {
    en: "Remembered your password?",
    he: "זוכר את הסיסמא?"
  },
  "auth.back.login": {
    en: "Back to Login",
    he: "כנס לחשבון שלך"
  },

  // Daily Mode UI Elements
  "daily.streak": {
    en: "daily streak",
    he: "רצף יומי"
  },
  "daily.next.brawler.in": {
    en: "Next Brawler In",
    he: "הבראולר הבא בעוד"
  },
  "daily.today.classic": {
    en: "Today's Classic",
    he: "הקלאסי של היום"
  },
  "daily.today.gadget": {
    en: "Today's Gadget", 
    he: "הגאדג'ט של היום"
  },
  "daily.today.starpower": {
    en: "Today's Star Power",
    he: "הכוח כוכב של היום"
  },
  "daily.today.audio": {
    en: "Today's Audio",
    he: "הקול של היום"
  },
  "daily.today.pixels": {
    en: "Today's Pixels",
    he: "הפיקסלים של היום"
  },

  // Attribute Labels for Content Box and Headers
  "attribute.label.brawler": {
    en: "Brawler",
    he: "בראולר"
  },
  "attribute.label.rarity": {
    en: "Rarity",
    he: "נדירות"
  },
  "attribute.label.class": {
    en: "Class",
    he: "סוג"
  },
  "attribute.label.range": {
    en: "Range",
    he: "טווח"
  },
  "attribute.label.wallbreak": {
    en: "Wall Break",
    he: "שובר קירות"
  },
  "attribute.label.year": {
    en: "Year",
    he: "שנה"
  },

  // Audio Mode Specific
  "audio.play.hint": {
    en: "Play Hint",
    he: "נגן רמז"
  },
  "audio.pause.hint": {
    en: "Pause Hint",
    he: "עצור רמז"
  },
  "audio.hint.available.in": {
    en: "Hint available in",
    he: "רמז זמין בעוד"
  },
  "audio.hint.guesses": {
    en: "guesses",
    he: "ניסיונות"
  },

  // Yesterday's Challenge
  "daily.yesterday.classic": {
    en: "yesterday's classic was",
    he: "הקלאסי של אתמול היה"
  },
  "daily.yesterday.gadget": {
    en: "yesterday's gadget was",
    he: "הגאדג'ט של אתמול היה"
  },
  "daily.yesterday.starpower": {
    en: "yesterday's star power was",
    he: "הכוח כוכב של אתמול היה"
  },
  "daily.yesterday.audio": {
    en: "yesterday's audio was",
    he: "הקול של אתמול היה"
  },
  "daily.yesterday.pixels": {
    en: "yesterday's pixels was",
    he: "הפיקסלים של אתמול היה"
  },

  // Loading Text
  "loading": {
    en: "Loading...",
    he: "טוען..."
  },

  // Home Button
  "button.go.home": {
    en: "Go to Home",
    he: "עבור לדף הבית"
  }
};

// Store the current language in localStorage, default to English
const getCurrentLanguage = (): SupportedLanguages => {
  const storedLang = localStorage.getItem('language');
  return (storedLang as SupportedLanguages) || 'en';
};

// Set the language
export const setLanguage = (language: SupportedLanguages): void => {
  localStorage.setItem('language', language);
  document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

// Get a translation by key
export const t = (key: string): string => {
  const lang = getCurrentLanguage();
  return translations[key]?.[lang] || key;
};

// Initialize language
export const initLanguage = (): void => {
  const lang = getCurrentLanguage();
  setLanguage(lang);
};

export const getLanguage = (): SupportedLanguages => getCurrentLanguage();
