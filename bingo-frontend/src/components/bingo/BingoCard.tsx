import { useMemo, useCallback } from 'react';

interface BingoCardProps {
  numbers: number[][];
  markedPositions?: boolean[][];
  drawnBalls?: number[];
  onCellClick?: (row: number, col: number) => void;
  size?: 'small' | 'medium' | 'large';
  isInteractive?: boolean;
}

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

/**
 * คอมโพเนนต์กระดานบิงโก 5x5 พร้อม animation
 */
export default function BingoCard({
  numbers,
  markedPositions = [],
  drawnBalls = [],
  onCellClick,
  size = 'medium',
  isInteractive = true,
}: BingoCardProps) {
  // ขนาด cell ตาม size prop
  const sizeMap = {
    small: { cell: 44, font: 14, header: 16, gap: 4 },
    medium: { cell: 56, font: 18, header: 20, gap: 6 },
    large: { cell: 72, font: 24, header: 28, gap: 8 },
  };

  const { cell, font, header, gap } = sizeMap[size];

  // สร้าง Set สำหรับเช็คเลขที่ถูกจับ
  const drawnSet = useMemo(() => new Set(drawnBalls), [drawnBalls]);

  // เช็คว่า cell ถูก mark หรือยัง
  const isMarked = useCallback(
    (row: number, col: number) => {
      return markedPositions[row]?.[col] || false;
    },
    [markedPositions]
  );

  // เช็คว่าเลขนี้ถูกจับหรือยัง
  const isDrawn = useCallback(
    (num: number) => {
      if (num === 0) return true; // FREE space
      return drawnSet.has(num);
    },
    [drawnSet]
  );

  const handleCellClick = (row: number, col: number) => {
    if (!isInteractive || !onCellClick) return;
    const num = numbers[row]?.[col];
    // ถ้าเป็น FREE space หรือเลขยังไม่ถูกจับ ไม่ให้กด
    if (num === 0 || !isDrawn(num)) return;
    onCellClick(row, col);
  };

  return (
    <div
      className="bingo-card-container"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e, #252541)',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 60px rgba(168, 85, 247, 0.1)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
      }}
    >
      {/* BINGO Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(5, ${cell}px)`,
          gap,
          marginBottom: gap,
        }}
      >
        {BINGO_LETTERS.map((letter, i) => (
          <div
            key={letter}
            className="bingo-header-cell"
            style={{
              width: cell,
              height: cell * 0.7,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${
                ['#3b82f6', '#ef4444', '#8b5cf6', '#22c55e', '#f59e0b'][i]
              }, ${
                ['#1d4ed8', '#b91c1c', '#6d28d9', '#15803d', '#d97706'][i]
              })`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: header,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Number Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(5, ${cell}px)`,
          gap,
        }}
      >
        {numbers.map((row, rowIndex) =>
          row.map((num, colIndex) => {
            const marked = isMarked(rowIndex, colIndex);
            const drawn = isDrawn(num);
            const isFreeSpace = num === 0;
            const canClick = isInteractive && drawn && !isFreeSpace && !marked;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`bingo-cell ${marked ? 'marked' : ''} ${drawn && !isFreeSpace ? 'drawn' : ''}`}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 10,
                  background: isFreeSpace
                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                    : marked
                    ? 'linear-gradient(135deg, #22c55e, #15803d)'
                    : drawn
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(102, 126, 234, 0.3))'
                    : 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isFreeSpace ? '#000' : '#fff',
                  fontWeight: 700,
                  fontSize: isFreeSpace ? font * 0.8 : font,
                  cursor: canClick ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: drawn && !marked && !isFreeSpace
                    ? '2px solid rgba(168, 85, 247, 0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: marked
                    ? '0 0 20px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(0,0,0,0.2)'
                    : drawn && !isFreeSpace
                    ? '0 0 15px rgba(168, 85, 247, 0.3)'
                    : 'none',
                  animation: marked ? 'markPop 0.3s ease' : undefined,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isFreeSpace ? (
                  <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>FREE</span>
                ) : (
                  num
                )}

                {/* Marked check icon */}
                {marked && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: '#22c55e',
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
