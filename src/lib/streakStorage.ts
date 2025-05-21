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

export function incrementStreak(today: string) {
  const { streak, lastCompleted } = getStreak();
  if (lastCompleted === today) return streak;
  if (lastCompleted === getYesterdayInIsrael()) {
    localStorage.setItem(STREAK_KEY, String(streak + 1));
    localStorage.setItem(LAST_COMPLETED_KEY, today);
    return streak + 1;
  } else {
    localStorage.setItem(STREAK_KEY, '1');
    localStorage.setItem(LAST_COMPLETED_KEY, today);
    return 1;
  }
}

export function resetStreak(today: string) {
  localStorage.setItem(STREAK_KEY, '1');
  localStorage.setItem(LAST_COMPLETED_KEY, today);
  return 1;
}

export function setStreak(streak: number, lastCompleted: string) {
  localStorage.setItem(STREAK_KEY, String(streak));
  localStorage.setItem(LAST_COMPLETED_KEY, lastCompleted);
} 