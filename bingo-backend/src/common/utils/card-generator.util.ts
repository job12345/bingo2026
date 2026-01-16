import * as crypto from 'crypto';

/**
 * Card Generator Utility
 * สำหรับสร้างการ์ดบิงโก 75-Ball และ 90-Ball
 */

export class CardGeneratorUtil {
  /**
   * สร้างการ์ดบิงโก 75-Ball (5x5)
   * B(1-15) I(16-30) N(31-45) G(46-60) O(61-75)
   * มี FREE Space ตรงกลาง (2,2)
   */
  static generate75BallCard(): number[][] {
    const card: number[][] = [];

    // สร้าง 5 คอลัมน์
    for (let col = 0; col < 5; col++) {
      const min = col * 15 + 1;
      const max = col * 15 + 15;
      const numbers = this.getRandomNumbers(min, max, 5);

      for (let row = 0; row < 5; row++) {
        if (!card[row]) {
          card[row] = [];
        }
        // FREE Space ตรงกลาง (2,2)
        if (row === 2 && col === 2) {
          card[row][col] = 0; // 0 = FREE
        } else {
          card[row][col] = numbers.pop()!;
        }
      }
    }

    return card;
  }

  /**
   * สร้างการ์ดบิงโก 90-Ball (9x3)
   */
  static generate90BallCard(): number[][] {
    const card: number[][] = Array(3)
      .fill(null)
      .map(() => Array(9).fill(null));

    // ทุกแถวต้องมีเลข 5 ตัว
    for (let row = 0; row < 3; row++) {
      const positions = this.getRandomPositions(9, 5);
      for (const col of positions) {
        const min = col === 0 ? 1 : col * 10;
        const max = col === 8 ? 90 : col * 10 + 9;
        card[row][col] = this.getRandomNumber(min, max);
      }
    }

    return card;
  }

  /**
   * สร้าง Card Hash (SHA256)
   * ใช้สำหรับ Anti-Cheat (ป้องกันการปลอม)
   */
  static generateCardHash(numbers: number[][], gameId: string, createdAt: Date): string {
    const data = JSON.stringify(numbers) + gameId + createdAt.toISOString();
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * ตรวจสอบ Pattern บนการ์ด
   */
  static checkPattern(
    card: number[][],
    drawnNumbers: number[],
    pattern: string,
  ): { isValid: boolean; missingNumbers?: number[] } {
    const drawnSet = new Set(drawnNumbers);
    const missingNumbers: number[] = [];

    // Pattern ต่างๆ สำหรับ 75-Ball
    const patterns: Record<string, [number, number][]> = {
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
    };

    const positions = patterns[pattern];
    if (!positions) {
      return { isValid: false };
    }

    for (const [row, col] of positions) {
      const num = card[row][col];
      if (num === 0) continue; // FREE Space
      if (!drawnSet.has(num)) {
        missingNumbers.push(num);
      }
    }

    return {
      isValid: missingNumbers.length === 0,
      missingNumbers: missingNumbers.length > 0 ? missingNumbers : undefined,
    };
  }

  /**
   * ตรวจสอบ Pattern บนการ์ด 90-Ball
   * Patterns: line_1, line_2, line_3, two_lines, full_house
   */
  static checkPattern90Ball(
    card: (number | null)[][],
    drawnNumbers: number[],
    pattern: string,
  ): { isValid: boolean; missingNumbers?: number[] } {
    const drawnSet = new Set(drawnNumbers);
    const missingNumbers: number[] = [];

    // Check which rows to validate based on pattern
    let rowsToCheck: number[] = [];

    switch (pattern) {
      case 'line_1':
        rowsToCheck = [0];
        break;
      case 'line_2':
        rowsToCheck = [1];
        break;
      case 'line_3':
        rowsToCheck = [2];
        break;
      case 'two_lines':
        // Any 2 lines - check if at least 2 rows are complete
        const completedRows = [];
        for (let row = 0; row < 3; row++) {
          const rowComplete = card[row].every((num) => num === null || drawnSet.has(num));
          if (rowComplete) completedRows.push(row);
        }
        if (completedRows.length >= 2) {
          return { isValid: true };
        }
        // Find missing numbers from first 2 incomplete rows
        for (let row = 0; row < 3 && rowsToCheck.length < 2; row++) {
          const rowComplete = card[row].every((num) => num === null || drawnSet.has(num));
          if (!rowComplete) rowsToCheck.push(row);
        }
        break;
      case 'full_house':
        rowsToCheck = [0, 1, 2];
        break;
      default:
        return { isValid: false };
    }

    // Validate selected rows
    for (const row of rowsToCheck) {
      for (let col = 0; col < 9; col++) {
        const num = card[row][col];
        if (num === null) continue; // Empty cell
        if (!drawnSet.has(num)) {
          missingNumbers.push(num);
        }
      }
    }

    return {
      isValid: missingNumbers.length === 0,
      missingNumbers: missingNumbers.length > 0 ? missingNumbers : undefined,
    };
  }

  /**
   * Helper: สุ่มเลขไม่ซ้ำ
   */
  private static getRandomNumbers(min: number, max: number, count: number): number[] {
    const numbers: number[] = [];
    const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * available.length);
      numbers.push(available.splice(index, 1)[0]);
    }

    return numbers;
  }

  /**
   * Helper: สุ่ม Position ไม่ซ้ำ
   */
  private static getRandomPositions(total: number, count: number): number[] {
    const positions: number[] = [];
    const available = Array.from({ length: total }, (_, i) => i);

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * available.length);
      positions.push(available.splice(index, 1)[0]);
    }

    return positions;
  }

  /**
   * Helper: สุ่มเลขเดี่ยว
   */
  private static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
