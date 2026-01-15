import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Row, Col, Space, Button, InputNumber, Select, Tag, message } from 'antd';
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import Layout from '@/components/Layout';
import { BingoCard as BingoCardComponent, BingoBall, DrawnNumbersDisplay } from '@/components/bingo';
import { useRoomStore, useGameStore, useWebSocketStore } from '@/stores';
import { GameService } from '@/services';
import { BingoPattern, BingoCard } from '@/types';
import { useWebSocketEvents } from '@/hooks';

const { Title, Text } = Typography;

/**
 * หน้าห้องเกม (Main Game UI) - Gaming Theme
 */
export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentRoom, fetchRoomById, isLoading } = useRoomStore();
  const { joinRoom: joinWsRoom, leaveRoom: leaveWsRoom, isConnected, connectionState } = useWebSocketStore();
  const {
    currentGame,
    setCurrentGame,
    myCards,
    setMyCards,
    buyCards,
    claimBingo,
    selectedCardId,
    selectCard,
    isLoading: isGameLoading,
  } = useGameStore();

  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [selectedPattern, setSelectedPattern] = useState<BingoPattern>(BingoPattern.HORIZONTAL_1);
  const [isJoiningGame, setIsJoiningGame] = useState(false);

  // ฟัง WebSocket Events
  useWebSocketEvents(roomId || null);

  useEffect(() => {
    if (roomId) {
      fetchRoomById(roomId);
    }
  }, [roomId, fetchRoomById]);

  // Join socket room when connected
  useEffect(() => {
    if (!roomId) return;
    if (!isConnected) return;

    joinWsRoom(roomId);
    return () => {
      leaveWsRoom(roomId);
    };
  }, [roomId, isConnected, joinWsRoom, leaveWsRoom]);

  // Join game via REST and load initial state/cards
  useEffect(() => {
    const run = async () => {
      if (!roomId) return;
      setIsJoiningGame(true);

      try {
        const join = await GameService.joinRoom(roomId);

        const game = await GameService.getGameState(join.gameId);
        setCurrentGame(game);

        const cards = await GameService.getMyCards(join.gameId);
        setMyCards(
          (cards as any[]).map((c) => ({
            ...c,
            markedNumbers: Array.isArray((c as any).markedNumbers) ? (c as any).markedNumbers : [],
          })) as BingoCard[]
        );

        if (join.state && (!game.state || game.state !== (join.state as any))) {
          // keep store aligned in case backend returns a string state
          setCurrentGame({ ...(game as any), state: join.state } as any);
        }
      } catch (error: any) {
        message.error(error.response?.data?.message || 'ไม่สามารถเข้าร่วมห้องเกมได้');
      } finally {
        setIsJoiningGame(false);
      }
    };

    run();
  }, [roomId, setCurrentGame, setMyCards]);

  const patternOptions = useMemo(
    () =>
      Object.values(BingoPattern).map((p) => ({
        label: p,
        value: p,
      })),
    []
  );

  const selectedCard = useMemo(() => myCards.find((c) => c.id === selectedCardId) || null, [myCards, selectedCardId]);

  // Prepare drawn numbers for BingoCard component
  const drawnNumbers = useMemo(() => currentGame?.drawnNumbers || [], [currentGame?.drawnNumbers]);

  const handleBuyCards = async () => {
    if (!currentGame?.id) {
      message.error('ยังไม่พร้อมซื้อการ์ด (ไม่มี gameId)');
      return;
    }

    try {
      await buyCards(currentGame.id, buyQuantity);
      message.success('ซื้อการ์ดสำเร็จ!');
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message || 'ซื้อการ์ดไม่สำเร็จ');
    }
  };

  const handleClaimBingo = async () => {
    if (!currentGame?.id) {
      message.error('ยังไม่พร้อมกดบิงโก (ไม่มี gameId)');
      return;
    }

    if (!selectedCardId) {
      message.warning('กรุณาเลือกการ์ดก่อน');
      return;
    }

    const ok = await claimBingo(currentGame.id, selectedCardId, selectedPattern);
    if (ok) {
      message.success('🎉 ส่งคำขอบิงโกแล้ว!');
    } else {
      message.error('บิงโกไม่ถูกต้อง หรือเกมยังไม่พร้อม');
    }
  };

  // Get game state color
  const getStateColor = (state: string) => {
    const stateColors: Record<string, string> = {
      idle: '#6b7280',
      waiting: '#3b82f6',
      sitting: '#8b5cf6',
      buying: '#f59e0b',
      running: '#22c55e',
      bingo_race: '#ef4444',
      winner_declared: '#fbbf24',
      payout: '#10b981',
      cooldown: '#6b7280',
    };
    return stateColors[state] || '#6b7280';
  };

  if (isLoading || !currentRoom || isJoiningGame) {
    return (
      <div className="game-bg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 24 }}>
        <Spin size="large" />
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>กำลังเข้าห้องเกม...</Text>
      </div>
    );
  }

  return (
    <Layout>
      <div className="game-bg" style={{ minHeight: 'calc(100vh - 64px)', padding: '20px' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          {/* Header */}
          <div className="slide-up" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col>
                <Space align="center" size={16}>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => window.history.back()}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                    }}
                  />
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#fff' }}>
                      {currentRoom.name}
                    </Title>
                    <Space size={8} style={{ marginTop: 4 }}>
                      <Tag
                        icon={isConnected ? <WifiOutlined /> : <DisconnectOutlined />}
                        color={isConnected ? 'success' : 'error'}
                      >
                        {isConnected ? 'เชื่อมต่อแล้ว' : connectionState}
                      </Tag>
                      {currentGame?.state && (
                        <Tag color={getStateColor(String(currentGame.state))}>
                          {String(currentGame.state).toUpperCase()}
                        </Tag>
                      )}
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col>
                <div className="stat-box" style={{ padding: '12px 20px' }}>
                  <Space size={24}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>{currentGame?.roundNumber ?? '-'}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>รอบ</div>
                    </div>
                    <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{currentGame?.totalBallsDrawn ?? 0}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>ลูกที่ออก</div>
                    </div>
                    <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#a855f7' }}>{myCards.length}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>การ์ดของฉัน</div>
                    </div>
                  </Space>
                </div>
              </Col>
            </Row>
          </div>

          <Row gutter={[24, 24]}>
            {/* Left Column - Drawn Numbers */}
            <Col xs={24} lg={7}>
              <div className="game-card slide-up" style={{ padding: 20 }}>
                <DrawnNumbersDisplay
                  drawnBalls={drawnNumbers}
                  currentBall={currentGame?.currentBall ?? undefined}
                />
              </div>
            </Col>

            {/* Right Column - My Cards & Actions */}
            <Col xs={24} lg={17}>
              {/* Action Bar */}
              <div className="game-card slide-up" style={{ padding: 16, marginBottom: 20 }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col flex="auto">
                    <Space wrap size={12}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>ซื้อการ์ด:</Text>
                        <InputNumber
                          min={1}
                          max={10}
                          value={buyQuantity}
                          onChange={(v) => setBuyQuantity(Number(v || 1))}
                          style={{ width: 70 }}
                        />
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={handleBuyCards}
                          loading={isGameLoading}
                          disabled={!currentGame?.id}
                          style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            border: 'none',
                            fontWeight: 600,
                          }}
                        >
                          ซื้อ
                        </Button>
                      </div>

                      <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>รูปแบบ:</Text>
                        <Select
                          style={{ minWidth: 180 }}
                          value={selectedPattern}
                          options={patternOptions}
                          onChange={(v) => setSelectedPattern(v as BingoPattern)}
                        />
                        <Button
                          type="primary"
                          icon={<TrophyOutlined />}
                          onClick={handleClaimBingo}
                          disabled={!selectedCardId || !currentGame?.id}
                          className="btn-glow"
                          style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            border: 'none',
                            fontWeight: 700,
                            color: '#000',
                          }}
                        >
                          กด BINGO! 🎉
                        </Button>
                      </div>
                    </Space>
                  </Col>
                  {selectedCard && (
                    <Col>
                      <Tag color="purple" style={{ fontSize: 13, padding: '4px 12px' }}>
                        เลือก: {selectedCard.id.slice(0, 8)}...
                      </Tag>
                    </Col>
                  )}
                </Row>
              </div>

              {/* My Cards */}
              <div className="slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Title level={4} style={{ margin: 0, color: '#fff' }}>
                    <ThunderboltOutlined style={{ color: '#fbbf24', marginRight: 8 }} />
                    การ์ดของฉัน
                  </Title>
                  <Tag color="purple" style={{ fontSize: 13 }}>
                    {myCards.length} ใบ
                  </Tag>
                </div>

                {myCards.length === 0 ? (
                  <div className="game-card" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎴</div>
                    <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                      ยังไม่มีการ์ด
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                      กดปุ่ม "ซื้อ" ด้านบนเพื่อซื้อการ์ดบิงโกและเริ่มเล่น!
                    </Text>
                  </div>
                ) : (
                  <Row gutter={[16, 16]}>
                    {myCards.map((card, index) => (
                      <Col xs={24} sm={12} xl={8} key={card.id}>
                        <div
                          onClick={() => selectCard(card.id)}
                          style={{
                            cursor: 'pointer',
                            transform: selectedCardId === card.id ? 'scale(1.02)' : 'scale(1)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                              การ์ด #{index + 1}
                            </Text>
                            {selectedCardId === card.id && (
                              <Tag color="blue">✓ เลือกแล้ว</Tag>
                            )}
                          </div>
                          <BingoCardComponent
                            numbers={card.numbers}
                            markedPositions={[]}
                            drawnBalls={drawnNumbers}
                            size="medium"
                            isInteractive={false}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Layout>
  );
}
