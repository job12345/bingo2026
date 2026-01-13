import { BingoCard, BingoPattern } from '@/types';

/**
 * ตรวจสอบว่าการ์ดมี Pattern สำเร็จหรือไม่
 */
export function checkPattern(card: BingoCard, pattern: BingoPattern, drawnNumbers: number[]): boolean {
  const drawnSet = new Set(drawnNumbers);
  const positions = PATTERN_POSITIONS[pattern];

  if (!positions) return false;

  for (const [row, col] of positions) {
    const num = card.numbers[row][col];
    // 0 = FREE Space (ถือว่าทำเครื่องหมายอยู่แล้ว)
    if (num !== 0 && !drawnSet.has(num)) {
      return false;
    }
  }

  return true;
}

/**
 * ตรวจสอบว่าการ์ดใกล้จะ Bingo หรือไม่ (เหลือ 1-2 เลข)
 */
export function isNearBingo(card: BingoCard, pattern: BingoPattern, drawnNumbers: number[]): number {
  const drawnSet = new Set(drawnNumbers);
  const positions = PATTERN_POSITIONS[pattern];

  if (!positions) return 999;

  let missing = 0;
  for (const [row, col] of positions) {
    const num = card.numbers[row][col];
    if (num !== 0 && !drawnSet.has(num)) {
      missing++;
    }
  }

  return missing;
}

/**
 * หา Patterns ที่เป็นไปได้ทั้งหมดสำหรับการ์ด
 */
export function findPossiblePatterns(card: BingoCard, drawnNumbers: number[]): BingoPattern[] {
  const possiblePatterns: BingoPattern[] = [];

  for (const pattern of Object.keys(PATTERN_POSITIONS) as BingoPattern[]) {
    if (checkPattern(card, pattern, drawnNumbers)) {
      possiblePatterns.push(pattern);
    }
  }

  return possiblePatterns;
}

/**
 * คำนวณเปอร์เซ็นต์ที่การ์ดจะชนะ (สำหรับ Auto Check)
 */
export function calculateWinProbability(card: BingoCard, drawnNumbers: number[], totalBalls: number): number {
  const markedCount = card.numbers.flat().filter((num) => num === 0 || drawnNumbers.includes(num)).length;
  const totalCells = 25; // 5x5
  return (markedCount / totalCells) * 100;
}

/**
 * ดึงชื่อ Pattern แบบอ่านง่าย
 */
export function getPatternDisplayName(pattern: BingoPattern): string {
  return PATTERN_NAMES[pattern] || pattern;
}

/**
 * ตรวจสอบว่าเลขอยู่ในการ์ดหรือไม่
 */
export function isNumberInCard(card: BingoCard, number: number): boolean {
  return card.numbers.flat().includes(number);
}

/**
 * Pattern Positions (ตำแหน่งในการ์ด 5x5)
 */
const PATTERN_POSITIONS: Record<BingoPattern, [number, number][]> = {
  horizontal_1: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ],
  horizontal_2: [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ],
  horizontal_3: [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  horizontal_4: [
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
  ],
  horizontal_5: [
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  vertical_1: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
  ],
  vertical_2: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
  ],
  vertical_3: [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
  ],
  vertical_4: [
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
  ],
  vertical_5: [
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
  ],
  diagonal_1: [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ],
  diagonal_2: [
    [0, 4],
    [1, 3],
    [2, 2],
    [3, 1],
    [4, 0],
  ],
  four_corners: [
    [0, 0],
    [0, 4],
    [4, 0],
    [4, 4],
  ],
  full_house: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
};

/**
 * Pattern Display Names
 */
const PATTERN_NAMES: Record<BingoPattern, string> = {
  horizontal_1: 'แนวนอนบรรทัดที่ 1',
  horizontal_2: 'แนวนอนบรรทัดที่ 2',
  horizontal_3: 'แนวนอนบรรทัดที่ 3',
  horizontal_4: 'แนวนอนบรรทัดที่ 4',
  horizontal_5: 'แนวนอนบรรทัดที่ 5',
  vertical_1: 'แนวตั้งคอลัมน์ B',
  vertical_2: 'แนวตั้งคอลัมน์ I',
  vertical_3: 'แนวตั้งคอลัมน์ N',
  vertical_4: 'แนวตั้งคอลัมน์ G',
  vertical_5: 'แนวตั้งคอลัมน์ O',
  diagonal_1: 'ทแยงมุม (ซ้ายบน-ขวาล่าง)',
  diagonal_2: 'ทแยงมุม (ขวาบน-ซ้ายล่าง)',
  four_corners: '4 มุม',
  full_house: 'เต็มการ์ด',
};
