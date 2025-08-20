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
  
    "home.feedback": {
    en: "Feedback",
    he: "חוות דעת"
  },
  "home.daily.challenges": {
    en: "Daily Challenges",
    he: "המשחק היומי"
  },
  "home.tier.list": {
    en: "Tier List",
    he: "בראולרים"
  },
  "home.join.community": {
    en: "Join Us",
    he: "קהילה"
  },
  "home.next.puzzle.in": {
    en: "Next puzzle in",
    he: "הפאזל הבא בעוד"
  },
    "voice.play_line": { en: "Play Voice Line", he: "נגן קול" },
  "survival.fixed_timer": { en: "Fixed Timer: 150 seconds", he: "טיימר קבוע: ‎150‎ שניות" },
  "survival.same_time_limit": { en: "Each round has the same time limit regardless of difficulty.", he: "כל סיבוב עם הגבלת זמן זהה" },
  "error.gadget_load": { en: "There was a problem loading today's gadget challenge.", he: "קרתה בעיה בטעינת אתגר הגאדג'ט." },
  "error.challenge_load": { en: "There was a problem loading today's challenge.", he: "קרתה בעיה בטעינת האתגר." },
  "error.starpower_load": { en: "There was a problem loading today's star power challenge.", he: "קרתה בעיה בטעינת אתגר כוח הכוכב." },
  "generic.victory": { en: "Victory!", he: "ניצחון!" },
  "victory.guessed_brawler": { en: "You guessed the brawler: {brawler}", he: "ניחשת את הבראולר: {brawler}" },
  "victory.number_of_tries": { en: "Number of tries: {count}", he: "מספר ניסיונות: {count}" },
  "stats.streak": { en: "Streak: {days} days", he: "רצף: {days} ימים" },
  "challenge.none_available": { en: "No Challenge Available", he: "האתגר לא  זמין" },
  "challenge.check_back_later": { en: "Check back later for today's challenge.", he: "חזור מאוחר יותר לאתגר היום." },
  "mode.endless": { en: "Endless Mode", he: "מצב אין-סופי" },
  "ui.previous_guesses": { en: "Previous Guesses", he: "ניחושים קודמים" },
  "status.under_construction": { en: "Under Construction", he: "בתהליך בנייה" },
  "action.return_home": { en: "Return Home", he: "חזור לדף הבית" },
  "error.page_not_found": { en: "Oops! Page not found", he: "אופס! הדף לא נמצא" },
  "status.loading_challenge": { en: "Loading challenge…", he: "טוען אתגר…" },
  "label.daily_challenge": { en: "Daily Challenge", he: "אתגר יומי" },
  "stats.brawlers_guessed": { en: "Brawlers guessed:", he: "בראולרים שניחשת:" },
  "timer.next_in": { en: "Next in: {hours}h {minutes}m", he: "אתגר הבא בעוד: {hours}ש {minutes}דק" },
  "status.processing": { en: "Processing…", he: "טוען…" },
  "auth.error": { en: "Authentication Error", he: "שגיאת אימות" },
  "auth.reset_password": { en: "Reset Your Password", he: "איפוס סיסמה" },
  "auth.new_password": { en: "New Password", he: "סיסמה חדשה" },
  "auth.confirm_password": { en: "Confirm Password", he: "אישור סיסמה" },
  "error.loading_challenge": { en: "Error Loading Challenge", he: "שגיאה בטעינת האתגר" },
  "action.try_again": { en: "Try Again", he: "נסה שוב" },
  "ui.need_hint": { en: "Need a hint?", he: "צריך רמז?" },
  "stats.number_of_guesses": { en: "Number of Guesses", he: "מספר ניחושים" },
  "audio.yesterday_attack": { en: "Yesterday's Attack Sound", he: "קול הבראולר  של אתמול" },
  "status.password_email_sent": { en: "Password reset email sent!", he: "מייל לאיפוס הסיסמה נשלח בהצלחה." },
  "status.loading": { en: "Loading…", he: "טוען…" },
  "pixels.mystery": { en: "Mystery Pixels", he: "פיקסלים מסתוריים" },
  "generic.correct": { en: "Correct!", he: "נכון!" },
  "generic.game_over": { en: "Game Over!", he: "המשחק נגמר!" },
  "generic.correct_answer_was": { en: "The correct answer was:", he: "התשובה הנכונה הייתה:" },
  "victory.guessed_brawler_attempts": { en: "You guessed {brawler} in {attempts} {attempt/attempts}!", he: "ניחשת את {brawler} ב-{attempts} {attempt/attempts}!" },
  "victory.correct_brawler": { en: "The correct brawler was {brawler}.", he: "הבראולר הנכון היה {brawler}." },
  "feedback.submitted": { en: "Feedback submitted", he: "המשוב התקבל" },
  // Feedback Page
  "feedback.title": { en: "Feedback", he: "חוות דעת" },
  "feedback.subtitle": { en: "Tell us what was good, what wasn't, and what's missing.", he: "ספרו לנו מה אהבתם, מה פחות, ומה חסר." },
  "feedback.category.label": { en: "Category", he: "קטגוריה" },
  "feedback.aria.select_category": { en: "Select feedback category", he: "בחר קטגוריית משוב" },
  "feedback.category.bug": { en: "Bug", he: "בעיה" },
  "feedback.category.idea": { en: "Idea", he: "רעיון" },
  "feedback.category.request": { en: "Request", he: "בקשה" },
  "feedback.category.content": { en: "Content", he: "תוכן" },
  "feedback.category.ui": { en: "UI", he: "ממשק" },
  "feedback.category.other": { en: "Other", he: "אחר" },
  "feedback.message.label": { en: "Message", he: "הודעה" },
  "feedback.message.placeholder": { en: "Describe the issue or share your idea…", he: "תאר את הבעיה או שתף רעיון…" },
  "feedback.message.help": { en: "Be as specific as possible. Max 2000 characters.", he: "נא לפרט ככל האפשר. עד 2000 תווים." },
  "feedback.contact.label": { en: "Optional contact", he: "פרטי קשר (אופציונלי)" },
  "feedback.contact.placeholder": { en: "Email or phone", he: "אימייל או טלפון" },
  "feedback.contact.help": { en: "Leave this if you want us to follow up. Requires consent.", he: "השאירו אם תרצו שנחזור אליכם. נדרש אישור." },
  "feedback.consent.label": { en: "I agree to be contacted about this feedback", he: "אני מסכים/ה שיצרו קשר לגבי המשוב" },
  "feedback.consent.help": { en: "We will use your contact info only for this feedback.", he: "נשתמש בפרטי הקשר רק עבור משוב זה." },
  "feedback.include_context.label": { en: "Include device and page context", he: "כלול פרטי מכשיר והקשר דף" },
  "feedback.include_context.help": { en: "Helps us debug. No personal data is collected.", he: "מסייע באיתור תקלות. ללא פרטים אישיים." },
  "feedback.submit": { en: "Send Feedback", he: "שלח משוב" },
  "feedback.sending": { en: "Sending…", he: "שולח…" },
  "feedback.toast.sent": { en: "Thanks! Feedback sent 🎉", he: "תודה! המשוב נשלח 🎉" },
  "feedback.toast.error": { en: "Something went wrong. Try again.", he: "משהו השתבש. נסו שוב" },
  "feedback.toast.rate_limit": { en: "Too many submissions. Please try again later.", he: "יותר מדי שליחות. נסו מאוחר יותר." },
  "feedback.error.select_category": { en: "Please select a category", he: "בחרו קטגוריה" },
  "feedback.error.message_short": { en: "Please write at least 10 characters", he: "נא לכתוב לפחות 10 תווים" },
  "feedback.error.message_long": { en: "Message is too long", he: "הודעה ארוכה מדי" },
  "feedback.error.contact_invalid": { en: "Enter a valid email or phone", he: "הכניסו אימייל או טלפון תקין" },
  "feedback.error.consent_required": { en: "Consent required to contact you", he: "נדרש אישור כדי ליצור קשר" },
  "feedback.images.label": { en: "Add Images", he: "הוספת תמונות" },
  "feedback.images.help": { en: "Up to 5 images. PNG, JPG, WEBP. Max 3MB each.", he: "עד 5 תמונות. PNG ,JPG ,WEBP. עד 3MB לתמונה." },
  "feedback.images.pick": { en: "Add images", he: "הוסף תמונות" },
  "feedback.images.remove": { en: "Remove image", he: "הסר תמונה" },
  "feedback.images.preview": { en: "Image preview", he: "תצוגה מקדימה של תמונה" },
  "feedback.images.type_error": { en: "Unsupported file type", he: "סוג קובץ לא נתמך" },
  "feedback.images.size_error": { en: "File is too large (max 3MB)", he: "קובץ גדול מדי (מקס' 3MB)" },
  "feedback.images.too_many": { en: "Maximum 5 images allowed", he: "מותר עד 5 תמונות" },
  "feedback.images.upload_error": { en: "Failed to upload image", he: "העלאת התמונה נכשלה" },
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
  "mode.survival.title": {
    en: "Survival Mode",
    he: "מצב הישרדות"
  },
  "mode.title.survival": {
    en: "Survival Mode",
    he: "מצב הישרדות"
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

  // Daily Challenge Dynamic Labels
  "daily.today.classic": { en: "Classic Daily", he: "קלאסי יומי" },
  "daily.today.gadget": { en: "Gadget Daily", he: "הגאדג'ט היומי" },
  "daily.today.starpower": { en: "Star Power Daily", he: "הכוח כוכב היומי" },
  "daily.today.audio": { en: "Audio Daily", he: "הקול היומי" },
  "daily.today.pixels": { en: "Pixels Daily", he: "הפיקסלים היומי" },

  "daily.yesterday.classic": { en: "Yesterday:", he: "אתמול:" },
  "daily.yesterday.gadget": { en: "Yesterday:", he: "אתמול:" },
  "daily.yesterday.starpower": { en: "Yesterday:", he: "אתמול:" },
  "daily.yesterday.audio": { en: "Yesterday:", he: "אתמול:" },
  "daily.yesterday.pixels": { en: "Yesterday:", he: "אתמול:" },


  "daily.next.brawler.in": { en: "Next In", he: "הבא בעוד" },
  "daily.next.mode": { en: "Next Mode", he: "מצב הבא" },

  "daily.you.found": { en: "You found", he: "מצאת" },
  "daily.in.guesses": { en: "in", he: "ב" },
  "guesses.left": { en: "Guesses Left", he: "ניסיונות שנותרו" },
  "daily.guesses.count": { en: "Guesses", he: "ניחושים" },


  "daily.congratulations": { en: "Congratulations!", he: "ברכות!" },
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
  "survival.click.play.sound": {
    en: "Click to play sound",
    he: "לחץ כדי לנגן קול"
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
    en: "Search Brawlers...",
    he: "חפש בראולרים..."
  },
  "guesses.count": {
    en: "Guesses",
    he: "ניסיונות"
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
  "auth.reset.password": {
    en: "Reset Password",
    he: "איפוס סיסמא"
  },
  "auth.create.your.account": {
    en: "Create Your Account",
    he: "צור את החשבון שלך"
  },
  "auth.welcome.back": {
    en: "Welcome Back",
    he: "ברוכים השבים"
  },
  "auth.create.account.button": {
    en: "Create Account",
    he: "צור חשבון"
  },
  "auth.sign.in.button": {
    en: "Sign In",
    he: "התחבר"
  },
  "auth.failed": {
    en: "Authentication failed",
    he: "ההתחברות נכשלה"
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
  "button.skip.brawler": {
    en: "Skip Brawler",
    he: "דלג על הבראולר"
  },
  "button.play.hint": {
    en: "Play Hint",
    he: "נגן רמז"
  },
  "button.playing": {
    en: "Playing...",
    he: "מנגן..."
  },
  "submit.guess": {
    en: "Submit Guess",
    he: "שלח ניחוש"
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
  "error.brawler.name.empty": {
    en: "Brawler name for guess is empty.",
    he: "שם הבראולר לניחוש ריק."
  },
  "error.game.error": {
    en: "Game Error",
    he: "שגיאת משחק"
  },
  "error.correct.brawler.not.set": {
    en: "Correct brawler not set. Please try refreshing.",
    he: "הבראולר הנכון לא נקבע. נסה לרענן את הדף."
  },
  "error.invalid.brawler": {
    en: "Invalid Brawler",
    he: "בראולר לא תקין"
  },
  "error.not.recognized": {
    en: "is not a recognized Brawler.",
    he: "אינו בראולר מוכר."
  },
  "error.already.guessed.this.round": {
    en: "You've already guessed",
    he: "כבר ניחשת את"
  },
  "error.this.round": {
    en: "this round!",
    he: "בסיבוב הזה!"
  },
  "message.offline.mode": {
    en: "Offline Mode",
    he: "מצב לא מקוון"
  },
  "message.already.guessed": {
    en: "Already guessed",
    he: "כבר נוחש"
  },
  "message.game.over": {
    en: "Game Over",
    he: "המשחק נגמר"
  },
  "message.correct": {
    en: "Correct!",
    he: "נכון!"
  },
  "message.error": {
    en: "Error",
    he: "שגיאה"
  },
  "message.out.of.attempts": {
    en: "Out of attempts! The correct answer was",
    he: "נגמרו הניסיונות! התשובה הנכונה הייתה"
  },
  "message.wrong.guess": {
    en: "Wrong guess!",
    he: "ניחוש שגוי!"
  },
  "message.attempts.left": {
    en: "attempts left.",
    he: "ניסיונות נותרו."
  },
  "message.please.select.valid.brawler": {
    en: "Please select a valid brawler from the list",
    he: "אנא בחר בראולר תקין מהרשימה"
  },
  "message.you.already.guessed": {
    en: "You've already guessed",
    he: "כבר ניחשת את"
  },
  "message.correct.you.guessed": {
    en: "Correct! You guessed the brawler!",
    he: "נכון! ניחשת את הבראולר!"
  },
  "message.game.over.correct.was": {
    en: "Game over! The correct brawler was",
    he: "המשחק נגמר! הבראולר הנכון היה"
  },
  "message.incorrect.try.again": {
    en: "Incorrect! Try again.",
    he: "לא נכון! נסה שוב."
  },
  "message.link.copied": {
    en: "Link copied to clipboard!",
    he: "הקישור הועתק ללוח!"
  },
  "message.failed.load.challenge": {
    en: "Failed to load challenge",
    he: "נכשל בטעינת האתגר"
  },
  "message.error.loading.challenge": {
    en: "Error loading challenge",
    he: "שגיאה בטעינת האתגר"
  },
  "message.email.verified": {
    en: "Email verified successfully!",
    he: "האימייל אומת בהצלחה!"
  },
  "message.passwords.not.match": {
    en: "Passwords do not match",
    he: "הסיסמאות לא תואמות"
  },
  "message.password.updated": {
    en: "Password updated successfully!",
    he: "הסיסמא עודכנה בהצלחה!"
  },
  "message.failed.update.password": {
    en: "Failed to update password",
    he: "נכשל בעדכון הסיסמא"
  },
  "message.error.playing.audio": {
    en: "Error playing audio:",
    he: "שגיאה בהשמעת הקול:"
  },
  "message.error.playing.hint.audio": {
    en: "Error playing hint audio:",
    he: "שגיאה בהשמעת רמז הקול:"
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
  "game.attempts.label": {
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
  "game.endless.challenge": {
    en: "Endless Challenge",
    he: "אתגר אינסופי"
  },
  "game.attempt": {
    en: "attempt",
    he: "ניסיון"
  },
  "game.attempts": {
    en: "attempts",
    he: "ניסיונות"
  },
  "game.round": {
    en: "Round:",
    he: "סיבוב:"
  },
  "game.type.brawler.name": {
    en: "Type brawler name...",
    he: "הקלד שם בראולר..."
  },
  
  // Time & Counters
  "time.per.round": {
    en: "150s per round",
    he: "150 שניות לכל סיבוב"
  },
  "time.per.round.seconds": {
    en: "seconds per round",
    he: "שניות לסיבוב"
  },
  
  // Survival HUD
  "survival.round": {
    en: "Round",
    he: "סיבוב"
  },
  "survival.pts": {
    en: "Pts",
    he: "נק'"
  },
  "survival.victory.title": {
    en: "Victory!",
    he: "ניצחון!"
  },
  "survival.points.earned": {
    en: "Points Earned",
    he: "נקודות שהושגו"
  },
  "survival.total.score": {
    en: "Total Score",
    he: "ניקוד כולל"
  },
  "survival.next.round.in": {
    en: "Next round in",
    he: "הסיבוב הבא בעוד"
  },
  "survival.guess.starpower": {
    en: "Guess the Brawler by their Star Power!",
    he: "נחשו את הבראולר לפי הכוח כוכב!"
  },
  "survival.guess.sound": {
    en: "Guess the Brawler by their Sound!",
    he: "נחשו את הבראולר לפי הקול!"
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
    he: "שבירת קיר"
  },
  "attribute.speed": {
    en: "Speed",
    he: "מהירות"
  },
  "attribute.release.year": {
    en: "Release Year",
    he: "שנת יציאה"
  },
  
  // Rarity Values
  "rarity.starter": {
    en: "Starter",
    he: "מתחיל"
  },
  "rarity.rare": {
    en: "Rare",
    he: "נדיר"
  },
  "rarity.super.rare": {
    en: "Super Rare",
    he: "סופר נדיר"
  },
  "rarity.epic": {
    en: "Epic",
    he: "אפי"
  },
  "rarity.mythic": {
    en: "Mythic",
    he: "מיתי"
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
    he: "ארוך"
  },
  "range.very.long": {
    en: "Very Long",
    he: "ארוך מאוד"
  },
  "range.very.short": {
    en: "Very Short",
    he: "קצר מאוד"
  },
  
  // Speed Values
  "speed.very.fast": {
    en: "Very Fast",
    he: "מהיר מאוד"
  },
  "speed.fast": {
    en: "Fast",
    he: "מהיר"
  },
  "speed.normal": {
    en: "Normal",
    he: "רגיל"
  },
  "speed.slow": {
    en: "Slow",
    he: "איטי"
  },
  "speed.very.slow": {
    en: "Very Slow",
    he: "איטי מאוד"
  },
  
  // Class Values
  "class.damage.dealer": {
    en: "Damage Dealer",
    he: "לוחם נזק"
  },
  "class.tank": {
    en: "Tank",
    he: "טנק"
  },
  "class.support": {
    en: "Support",
    he: "תמיכה"
  },
  "class.assassin": {
    en: "Assassin",
    he: "רוצח"
  },
  "class.thrower": {
    en: "Thrower",
    he: "זורק"
  },
  "class.marksman": {
    en: "Marksman",
    he: "קלע"
  },
  "class.controller": {
    en: "Controller",
    he: "בקר"
  },
  
  // Boolean Values
  "boolean.yes": {
    en: "Yes",
    he: "כן"
  },
  "boolean.no": {
    en: "No",
    he: "לא"
  },
  
  // Toast/Notification Categories
  "toast.already.guessed": {
    en: "Already Guessed",
    he: "כבר נוחש"
  },
  "toast.brawler.not.found": {
    en: "Brawler not found",
    he: "בראולר לא נמצא"
  },
  "toast.brawler.already.guessed": {
    en: "Brawler already guessed",
    he: "הבראולר כבר נוחש"
  },
  
  // Navigation and UI
  "nav.toggle.sidebar": {
    en: "Toggle Sidebar",
    he: "החלף תפריט צד"
  },
  "ui.invisible.absolute": {
    en: "invisible absolute",
    he: "בלתי נראה מוחלט"
  },
  
  // Score Share
  "share.classic.mode": {
    en: "Classic Mode",
    he: "מצב קלאסי"
  },
  "share.audio.mode": {
    en: "Audio Mode",
    he: "מצב שמע"
  },
  "share.gadget.mode": {
    en: "Gadget Mode",
    he: "מצב גאדג'ט"
  },
  
  // Survival Mode Messages
  "survival.pixels": {
    en: "Survival Pixels",
    he: "פיקסלים הישרדות"
  },
  "survival.endless.pixels": {
    en: "Endless Pixels",
    he: "פיקסלים אינסופי"
  },
  "survival.daily.pixels.challenge": {
    en: "Daily Pixels Challenge",
    he: "אתגר פיקסלים יומי"
  },
  
  // Image Alt Text
  "alt.survival.background": {
    en: "Survival Background",
    he: "רקע הישרדות"
  },
  "alt.classic.mode": {
    en: "Classic Mode",
    he: "מצב קלאסי"
  },
  "alt.mystery.brawler": {
    en: "Mystery Brawler",
    he: "בראולר מסתורי"
  },
  "alt.audio.mode": {
    en: "Audio Mode",
    he: "מצב שמע"
  },
  "alt.mystery.gadget": {
    en: "Mystery Gadget",
    he: "גאדג'ט מסתורי"
  },
  "alt.gadget.mode": {
    en: "Gadget Mode",
    he: "מצב גאדג'ט"
  },
  "alt.pixels.mode": {
    en: "Pixels Mode",
    he: "מצב פיקסלים"
  },
  "alt.brawler.gadget": {
    en: "Brawler Gadget",
    he: "גאדג'ט בראולר"
  },
  "alt.very.fast": {
    en: "Very Fast",
    he: "מהיר מאוד"
  },
  "alt.very.slow": {
    en: "Very Slow",
    he: "איטי מאוד"
  },
  
  "number.of.guesses": {
    en: "Number of Guesses",
    he: "מספר ניחושים"
  },
  "fixed.timer.150.seconds": {
    en: "Fixed Timer: 150 seconds",
    he: "טיימר קבוע: 150 שניות"
  },
  "no.tip.available": {
    en: "No tip available",
    he: "אין טיפ זמין"
  },
  "offline.mode": {
    en: "Offline Mode",
    he: "מצב לא מקוון"
  },
  "error": {
    en: "Error",
    he: "שגיאה"
  },
  "brawler.star.power": {
    en: "Brawler Star Power",
    he: "כוח כוכב הבראולר"
  },
  "retry": {
    en: "Retry",
    he: "נסה שוב"
  },
  "coming.soon": {
    en: "Coming Soon",
    he: "בקרוב"
  },
  "tier.list.page.title": {
    en: "Brawler Tier List",
    he: "רשימת דירוג בראולרים"
  },
  "tier.list.description": {
    en: "Rank your favorite brawlers from best to worst",
    he: "דרג את הבראולרים המועדפים עליך מהטוב לפחות טוב"
  },
  "tier.list.coming.soon": {
    en: "Tier List Coming Soon!",
    he: "רשימת דירוג בקרוב!"
  },
  "tier.list.working": {
    en: "We're working on an awesome tier list feature where you can rank all the brawlers!",
    he: "אנחנו עובדים על תכונת דירוג מדהימה שבה תוכל לדרג את כל הבראולרים!"
  },
  "tier.label.s": {
    en: "S Tier",
    he: "רמה S"
  },
  "tier.label.a": {
    en: "A Tier",
    he: "רמה A"
  },
  "tier.label.b": {
    en: "B Tier",
    he: "רמה B"
  },
  "tier.label.c": {
    en: "C Tier",
    he: "רמה C"
  },
  "tier.search.placeholder": {
    en: "Search brawlers…",
    he: "חפש בראולרים…"
  },
  "tier.search.clear": {
    en: "Clear search",
    he: "נקה חיפוש"
  },
  "tier.search.results": {
    en: "Results",
    he: "תוצאות"
  },
  "tier.quickjump": {
    en: "Quick jump",
    he: "קפיצה מהירה"
  },
  "tier.no.results": {
    en: "No brawlers match your search",
    he: "אין תוצאות תואמות לחיפוש"
  },
  "back.to.home": {
    en: "Back to Home",
    he: "חזור לעמוד הבית"
  },
  "attribute.label.brawler": {
    en: "Brawler",
    he: "לוחם"
  },
  "attribute.label.rarity": {
    en: "Rarity", 
    he: "נדירות"
  },
  "attribute.label.class": {
    en: "Class",
    he: "מחלקה"
  },
  "attribute.label.range": {
    en: "Range",
    he: "טווח"
  },
  "attribute.label.wallbreak": {
    en: "Wallbreak",
    he: "שבירת קיר"
  },
  "attribute.label.release.year": {
    en: "Release Year",
    he: "שנת יציאה"
  },
  "attribute.label.year": {
    en: "Year",
    he: "שנה"
  },
  "audio.hint.available.in": {
    en: "Hint available in",
    he: "רמז זמין בעוד"
  },
  "audio.hint.guess": {
    en: "guess",
    he: "ניחוש"
  },
  "audio.hint.guesses": {
    en: "guesses",
    he: "ניחושים"
  },
  "daily.audio.loading": {
    en: "Loading audio...",
    he: "טוען אודיו..."
  },
  "daily.audio.error": {
    en: "Audio failed to load",
    he: "נכשל בטעינת האודיו"
  },
  "daily.audio.ready": {
    en: "Audio ready",
    he: "האודיו מוכן"
  },
  
  // Join Us page
  "join.title": { en: "Join Us", he: "הצטרפו אלינו" },
  "join.subtitle": { en: "Apply in under 30s", he: "הגש בקשה בפחות מ־30 שניות" },
  "join.role.label": { en: "Role", he: "תפקיד" },
  "join.role.community": { en: "Community", he: "חבר קהילה" },
  "join.role.club_owner": { en: "Club Owner", he: "נשיא מועדון" },
  // Role tips
  "join.role.tip.club_owner": { en: "For strong club owners", he: "לבעלי מועדון חזק" },
  "join.role.tip.community": { en: "For players who love Brawl Stars and want to be part of the community", he: "לשחקנים שאוהבים בראול סטארס ורוצים להיות חלק מהקהילה" },
  "join.role.instructor": { en: "Instructor", he: "מדריך" },
  "join.role.tip.instructor": { en: "For top players who want to help", he: "לשחקנים תותחים שרוצים לעזור" },
  "join.name.label": { en: "Name", he: "שם" },
  "join.name.placeholder": { en: "Your name", he: "השם שלך" },
  "join.contact.label": { en: "Contact", he: "טלפון או אימייל" },
  "join.contact.placeholder": { en: "email@example.com or 054-123-4567", he: "email@example.com או 054-123-4567" },
  "join.contact.helper": { en: "We’ll reach out via email or phone", he: "ניצור קשר באימייל או בטלפון" },
  "join.trophies.label": { en: "Trophy Count", he: "מספר גביעים" },
  "join.age.label": { en: "Age (optional)", he: "גיל (אופציונלי)" },
  "join.age.placeholder": { en: "Optional", he: "אופציונלי" },
  "join.submit": { en: "Send Application", he: "שלח בקשה" },
  "join.sending": { en: "Sending...", he: "שולח..." },
  "join.cooldown.prefix": { en: "Please wait", he: "אנא המתן" },
  "join.cooldown.suffix": { en: "s before submitting again.", he: "שניות לפני שליחה נוספת." },
  "join.privacy.copy": { en: "We respect your privacy. Your info is used only to contact you about your application.", he: "אנחנו מכבדים את פרטיותך. המידע ישמש רק ליצירת קשר לגבי הבקשה." },
  "join.privacy.info_label": { en: "Privacy info", he: "מידע פרטיות" },
  "join.social.connect": { en: "Connect with us", he: "התחברו איתנו" },
  "join.club.name.label": { en: "Club name", he: "שם המועדון" },
  "join.club.name.placeholder": { en: "Your club name", he: "שם המועדון שלך" },
  "join.club.members.label": { en: "Club members", he: "מספר חברי מועדון" },
  "join.club.members.placeholder": { en: "1–30", he: "1–30" },
  
  // Join Us toasts and errors
  "join.toast.thanks": { en: "Thanks!", he: "תודה!" },
  "join.toast.rate_limit": { en: "Please wait a bit before submitting again.", he: "אנא המתן מעט לפני שליחה נוספת." },
  "join.toast.sent": { en: "Application sent!", he: "הבקשה נשלחה!" },
  "join.toast.error": { en: "Could not send. Please check fields and try again.", he: "לא ניתן לשלוח. בדוק את השדות ונסה שוב." },
  
  // Join Us validation
  "join.error.select_role": { en: "Select a role", he: "בחר תפקיד" },
  "join.error.name_short": { en: "Name is too short", he: "השם קצר מדי" },
  "join.error.name_long": { en: "Name is too long", he: "השם ארוך מדי" },
  "join.error.enter_contact": { en: "Enter email or phone", he: "הכנס אימייל או טלפון" },
  "join.error.invalid_contact": { en: "Enter a valid email or international phone (+123...)", he: "הכנס אימייל תקין או מספר בינלאומי (‎+123...‎)" },
  "join.error.age_range": { en: "Age must be 6-30", he: "הגיל חייב להיות בין 6 ל־30" },
  "join.error.age_required": { en: "Age is required for instructors", he: "גיל חובה למדריכים" },
  "join.error.club_name_required": { en: "Club name is required", he: "יש להזין שם מועדון" },
  "join.error.club_members_required": { en: "Club members are required", he: "יש להזין מספר חברי מועדון" },
  "join.error.club_members_range": { en: "Members must be 1–30", he: "מספר חברים חייב להיות בין 1 ל־30" },
  
  // Join Us aria labels
  "join.aria.select_role": { en: "Select role", he: "בחר תפקיד" },
  "join.aria.trophy_count": { en: "Trophy count", he: "מספר גביעים" },
  "button.go.home": {
    en: "Go Home",
    he: "חזור הביתה"
  }
};

// Language detection and storage
const LANGUAGE_KEY = 'brawldle-language';

const getCurrentLanguage = (): SupportedLanguages => {
  // Check localStorage first
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && (stored === 'en' || stored === 'he')) {
    return stored as SupportedLanguages;
  }
  
  // Default to Hebrew as requested
  return 'he';
};

export const setLanguage = (language: SupportedLanguages): void => {
  localStorage.setItem(LANGUAGE_KEY, language);
  
  // Update document direction and language
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
};

export const t = (key: string): string => {
  const language = getCurrentLanguage();
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation key "${key}" not found`);
    return key; // Return the key itself as fallback
  }
  
  return translation[language] || translation.en || key;
};

export const initLanguage = (): void => {
  const language = getCurrentLanguage();
  setLanguage(language);
};

export const getLanguage = (): SupportedLanguages => getCurrentLanguage();
