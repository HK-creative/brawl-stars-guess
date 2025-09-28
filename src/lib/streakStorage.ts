import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const STREAK_KEY = 'brawldle_streak';
const LAST_COMPLETED_KEY = 'brawldle_last_completed';

const ISRAEL_TZ = 'Asia/Jerusalem';
export function getTodayInIsrael() {
  return dayjs().tz(ISRAEL_TZ).format('YYYY-MM-DD');
}

export function getYesterdayInIsrael() {
  return dayjs().tz(ISRAEL_TZ).subtract(1, 'day').format('YYYY-MM-DD');
}

export function getStreak() {
  const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  const lastCompleted = localStorage.getItem(LAST_COMPLETED_KEY) || null;
  return { streak, lastCompleted };
}

export function setStreak(streak: number, lastCompleted: string | null) {
  localStorage.setItem(STREAK_KEY, String(streak));
  if (lastCompleted) {
    localStorage.setItem(LAST_COMPLETED_KEY, lastCompleted);
  } else {
    localStorage.removeItem(LAST_COMPLETED_KEY);
  }
}

export function incrementStreak() {
  const today = getTodayInIsrael();
  const { streak, lastCompleted } = getStreak();

  if (lastCompleted === today) {
    return streak; // Already incremented today
  }

  const yesterday = getYesterdayInIsrael();
  const newStreak = (lastCompleted === yesterday) ? streak + 1 : 1;
  
  setStreak(newStreak, today);
  return newStreak;
}

export function checkAndResetStreak() {
  const { streak, lastCompleted } = getStreak();
  const today = getTodayInIsrael();
  const yesterday = getYesterdayInIsrael();

  if (lastCompleted && lastCompleted !== today && lastCompleted !== yesterday) {
    console.log(`Streak lost. Last completed: ${lastCompleted}. Resetting to 0.`);
    setStreak(0, null); // Reset streak to 0
    return { streak: 0, lastCompleted: null };
  }

  return { streak, lastCompleted };
}