import { useMemo } from 'react';

interface BingoBallProps {
  number: number;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  isCurrentBall?: boolean;
  animate?: boolean;
  style?: React.CSSProperties;
}

/**
 * คอมโพเนนต์แสดงลูกบอลบิงโกแบบ 3D
 */
export default function BingoBall({
  number,
  size = 'medium',
  isCurrentBall = false,
  animate = false,
  style,
}: BingoBallProps) {
  // กำหนดสีตาม BINGO column
  const ballColor = useMemo(() => {
    if (number <= 15) return { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', letter: 'B' };
    if (number <= 30) return { bg: 'linear-gradient(135deg, #ef4444, #b91c1c)', letter: 'I' };
    if (number <= 45) return { bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', letter: 'N' };
    if (number <= 60) return { bg: 'linear-gradient(135deg, #22c55e, #15803d)', letter: 'G' };
    return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', letter: 'O' };
  }, [number]);

  const sizeMap = {
    small: { diameter: 36, fontSize: 14, letterSize: 10 },
    medium: { diameter: 52, fontSize: 20, letterSize: 12 },
    large: { diameter: 72, fontSize: 28, letterSize: 16 },
    xlarge: { diameter: 100, fontSize: 40, letterSize: 20 },
  };

  const { diameter, fontSize, letterSize } = sizeMap[size];

  return (
    <div
      className={`bingo-ball ${isCurrentBall ? 'current-ball' : ''} ${animate ? 'ball-pop' : ''}`}
      style={{
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        background: ballColor.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize,
        position: 'relative',
        boxShadow: isCurrentBall
          ? '0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4), inset 0 -4px 8px rgba(0,0,0,0.3)'
          : 'inset 0 -4px 8px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.3)',
        border: isCurrentBall ? '3px solid #fbbf24' : 'none',
        animation: isCurrentBall ? 'currentBall 1.5s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      {/* ตัวอักษร B-I-N-G-O */}
      <span
        style={{
          fontSize: letterSize,
          fontWeight: 600,
          opacity: 0.8,
          marginBottom: -2,
        }}
      >
        {ballColor.letter}
      </span>
      {/* ตัวเลข */}
      <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{number}</span>

      {/* 3D shine effect */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '20%',
          width: '30%',
          height: '20%',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
