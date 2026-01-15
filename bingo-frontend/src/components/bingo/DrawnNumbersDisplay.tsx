import BingoBall from './BingoBall';

interface DrawnNumbersDisplayProps {
  drawnBalls: number[];
  currentBall?: number;
  maxDisplay?: number;
}

/**
 * แสดงเลขที่ถูกจับแล้วทั้งหมด พร้อมลูกบอลปัจจุบัน
 */
export default function DrawnNumbersDisplay({
  drawnBalls,
  currentBall,
  maxDisplay = 10,
}: DrawnNumbersDisplayProps) {
  // กลุ่มตัวเลขตาม BINGO column
  const groupedNumbers = {
    B: drawnBalls.filter((n) => n >= 1 && n <= 15).sort((a, b) => a - b),
    I: drawnBalls.filter((n) => n >= 16 && n <= 30).sort((a, b) => a - b),
    N: drawnBalls.filter((n) => n >= 31 && n <= 45).sort((a, b) => a - b),
    G: drawnBalls.filter((n) => n >= 46 && n <= 60).sort((a, b) => a - b),
    O: drawnBalls.filter((n) => n >= 61 && n <= 75).sort((a, b) => a - b),
  };

  const recentBalls = drawnBalls.slice(-maxDisplay).reverse();

  return (
    <div className="drawn-numbers-container">
      {/* Current Ball - Featured */}
      {currentBall && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: 32,
            padding: 24,
            background: 'rgba(251, 191, 36, 0.1)',
            borderRadius: 20,
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            🎯 ลูกบอลปัจจุบัน
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BingoBall number={currentBall} size="xlarge" isCurrentBall animate />
          </div>
        </div>
      )}

      {/* Recent Balls */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 12, fontWeight: 600 }}>
          🕐 เลขล่าสุด ({drawnBalls.length} ลูก)
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          {recentBalls.length > 0 ? (
            recentBalls.map((num, i) => (
              <BingoBall
                key={num}
                number={num}
                size="small"
                style={{
                  opacity: 1 - i * 0.08,
                  transform: `scale(${1 - i * 0.03})`,
                }}
              />
            ))
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.4)', padding: 20 }}>
              รอจับลูกบอล...
            </div>
          )}
        </div>
      </div>

      {/* All Numbers by Column */}
      <div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 12, fontWeight: 600 }}>
          📊 สรุปตาม B-I-N-G-O
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(groupedNumbers).map(([letter, nums]) => (
            <div
              key={letter}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 8,
                  color:
                    letter === 'B'
                      ? '#3b82f6'
                      : letter === 'I'
                      ? '#ef4444'
                      : letter === 'N'
                      ? '#8b5cf6'
                      : letter === 'G'
                      ? '#22c55e'
                      : '#f59e0b',
                }}
              >
                {letter}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {nums.length}/15
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  maxHeight: 150,
                  overflowY: 'auto',
                }}
              >
                {nums.map((n) => (
                  <div
                    key={n}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#fff',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 4,
                      padding: '4px 0',
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
