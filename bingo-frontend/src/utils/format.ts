import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';

dayjs.extend(relativeTime);
dayjs.locale('th');

/**
 * แปลง Point เป็นรูปแบบเงิน (1 Point = 1 บาท)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

/**
 * แปลง Point เป็นตัวเลขพร้อมคอมม่า
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('th-TH').format(num);
}

/**
 * แปลงวันที่เป็นรูปแบบไทย
 */
export function formatDate(date: string | Date, format = 'DD/MM/YYYY HH:mm'): string {
  return dayjs(date).format(format);
}

/**
 * แปลงวันที่เป็นรูปแบบสัมพัทธ์ (เช่น "2 นาทีที่แล้ว")
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * แปลง Win Rate เป็นเปอร์เซ็นต์
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * ตัดข้อความให้สั้นลง
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * แปลงเวลาเป็นนาที:วินาที
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
