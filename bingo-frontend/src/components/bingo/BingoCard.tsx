import { useMemo, useCallback } from 'react';

interface BingoCardProps {
  numbers: number[][];
  markedPositions?: boolean[][];
  drawnBalls?: number[];
  onCellClick?: (row: number, col: number) => void;
  size?: 'small' | 'medium' | 'large';
  isInteractive?: boolean;
  ballSet?: '75' | '90';
}

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

/**
 * คอมโพเนนต์กระดานบิงโก รองรับทั้ง 75-Ball (5x5) และ 90-Ball (9x3)
 */
export default function BingoCard({
  numbers,
  markedPositions = [],
  drawnBalls = [],
  onCellClick,
  size = 'medium',
  isInteractive = true,
  ballSet = '75',
}: BingoCardProps) {
  // ตรวจสอบ layout จากขนาดของ numbers array
  const is90Ball = ballSet === '90' || (numbers.length === 3 && numbers[0]?.length === 9);
  const cols = is90Ball ? 9 : 5;
  const rows = is90Ball ? 3 : 5;

  // ขนาด cell ตาม size prop และ ball type
  const sizeMap = is90Ball
    ? {
      small: { cell: 32, font: 12, header: 12, gap: 3 },
      medium: { cell: 40, font: 14, header: 14, gap: 4 },
      large: { cell: 48, font: 18, header: 18, gap: 5 },
    }
    : {
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
    [markedPositions],
  );

  // เช็คว่าเลขนี้ถูกจับหรือยัง
  const isDrawn = useCallback(
    (num: number | null) => {
      if (num === 0) return true; // FREE space
      if (num === null) return false; // Empty cell in 90-ball
      return drawnSet.has(num);
    },
    [drawnSet],
  );

  const handleCellClick = (row: number, col: number) => {
    if (!isInteractive || !onCellClick) return;
    const num = numbers[row]?.[col];
    // ถ้าเป็น FREE space, empty cell, หรือเลขยังไม่ถูกจับ ไม่ให้กด
    if (num === 0 || num === null || !isDrawn(num)) return;
    onCellClick(row, col);
  };

  // 90-Ball column headers (1-9, 10-19, ... 80-90)
  const get90BallHeaders = () => ['1-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-90'];

  return (
    <div
      className="bingo-card-container"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e, #252541)',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 60px rgba(168, 85, 247, 0.1)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        overflow: 'auto',
      }}
    >
      {/* Header - BINGO for 75-ball, Numbers ranges for 90-ball */}
      {is90Ball ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
            gap,
            marginBottom: gap,
          }}
        >
          {get90BallHeaders().map((range, i) => (
            <div
              key={range}
              style={{
                width: cell,
                height: cell * 0.6,
                borderRadius: 6,
                background: 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 600,
                fontSize: header * 0.8,
              }}
            >
              {range}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
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
                background: `linear-gradient(135deg, ${['#3b82f6', '#ef4444', '#8b5cf6', '#22c55e', '#f59e0b'][i]
                  }, ${['#1d4ed8', '#b91c1c', '#6d28d9', '#15803d', '#d97706'][i]})`,
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
      )}

      {/* Number Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
          gap,
        }}
      >
        {numbers.map((row, rowIndex) =>
          row.map((num, colIndex) => {
            const marked = isMarked(rowIndex, colIndex);
            const drawn = isDrawn(num);
            const isFreeSpace = num === 0;
            const isEmpty = num === null;
            const canClick = isInteractive && drawn && !isFreeSpace && !isEmpty && !marked;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`bingo-cell ${marked ? 'marked' : ''} ${drawn && !isEmpty ? 'drawn' : ''}`}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: is90Ball ? 6 : 10,
                  background: isEmpty
                    ? 'rgba(255,255,255,0.03)'
                    : isFreeSpace
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : marked
                        ? 'linear-gradient(135deg, #22c55e, #15803d)'
                        : drawn
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(102, 126, 234, 0.3))'
                          : 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isEmpty ? 'transparent' : isFreeSpace ? '#000' : '#fff',
                  fontWeight: 700,
                  fontSize: isFreeSpace ? font * 0.8 : font,
                  cursor: canClick ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: isEmpty
                    ? '1px dashed rgba(255,255,255,0.1)'
                    : drawn && !marked && !isFreeSpace
                      ? '2px solid rgba(168, 85, 247, 0.6)'
                      : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: marked
                    ? '0 0 20px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(0,0,0,0.2)'
                    : drawn && !isFreeSpace && !isEmpty
                      ? '0 0 15px rgba(168, 85, 247, 0.3)'
                      : 'none',
                  animation: marked ? 'markPop 0.3s ease' : undefined,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isEmpty ? null : isFreeSpace ? (
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
                      width: is90Ball ? 12 : 16,
                      height: is90Ball ? 12 : 16,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: is90Ball ? 8 : 10,
                      color: '#22c55e',
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* 90-Ball Pattern Indicator */}
      {is90Ball && (
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.15)' }}>
            🎯 1 Line
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: 4, background: 'rgba(168, 85, 247, 0.15)' }}>
            🎯🎯 2 Lines
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: 4, background: 'rgba(34, 197, 94, 0.15)' }}>
            🏆 Full House
          </span>
        </div>
      )}
    </div>
  );
}
