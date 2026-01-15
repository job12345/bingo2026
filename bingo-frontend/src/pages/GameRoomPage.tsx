import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Card, Spin, Row, Col, Space, Button, InputNumber, Select, Tag, Divider, message } from 'antd';
import Layout from '@/components/Layout';
import { useRoomStore, useGameStore, useWebSocketStore } from '@/stores';
import { GameService } from '@/services';
import { BingoPattern, BingoCard } from '@/types';
import { useWebSocketEvents } from '@/hooks';

const { Title } = Typography;

/**
 * หน้าห้องเกม (Main Game UI)
 */
export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
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

  const handleBuyCards = async () => {
    if (!currentGame?.id) {
      message.error('ยังไม่พร้อมซื้อการ์ด (ไม่มี gameId)');
      return;
    }

    try {
      await buyCards(currentGame.id, buyQuantity);
      message.success('ซื้อการ์ดสำเร็จ');
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
      message.success('ส่งคำขอบิงโกแล้ว (ระบบจะตรวจสอบฝั่งเซิร์ฟเวอร์)');
    } else {
      message.error('บิงโกไม่ถูกต้อง หรือเกมยังไม่พร้อม');
    }
  };

  const renderCard = (card: BingoCard) => {
    const drawn = new Set(currentGame?.drawnNumbers || []);
    const marked = new Set(card.markedNumbers || []);

    return (
      <Card
        key={card.id}
        size="small"
        title={
          <Space>
            <span>Card</span>
            {selectedCardId === card.id ? <Tag color="blue">Selected</Tag> : null}
          </Space>
        }
        style={{
          border: selectedCardId === card.id ? '2px solid #1677ff' : undefined,
          cursor: 'pointer',
        }}
        onClick={() => selectCard(card.id)}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {card.numbers.flatMap((row, r) =>
            row.map((n, c) => {
              const isFree = n === 0;
              const isDrawn = !isFree && drawn.has(n);
              const isMarked = isFree || marked.has(n);

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: isMarked ? '#e6f4ff' : isDrawn ? '#fff7e6' : '#fff',
                    fontWeight: isMarked ? 700 : 500,
                    userSelect: 'none',
                  }}
                >
                  {isFree ? 'FREE' : n}
                </div>
              );
            })
          )}
        </div>
      </Card>
    );
  };

  if (isLoading || !currentRoom || isJoiningGame) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="กำลังโหลดห้อง..." />
      </div>
    );
  }

  return (
    <Layout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                {currentRoom.name}
              </Title>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  <Tag color={isConnected ? 'green' : 'red'}>
                    WS: {isConnected ? 'connected' : connectionState}
                  </Tag>
                  <Tag>Room: {roomId}</Tag>
                  {currentGame?.id ? <Tag>Game: {currentGame.id}</Tag> : null}
                  {currentGame?.state ? <Tag color="blue">State: {String(currentGame.state)}</Tag> : null}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <Card title="สถานะเกม" loading={!currentGame}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <strong>รอบ:</strong> {currentGame?.roundNumber ?? '-'}
                </div>
                <div>
                  <strong>ลูกล่าสุด:</strong> {currentGame?.currentBall ?? '-'}
                </div>
                <div>
                  <strong>จำนวนลูกที่ออก:</strong> {currentGame?.totalBallsDrawn ?? 0}
                </div>
                <div>
                  <strong>เลขที่ออกแล้ว:</strong>
                  <div style={{ marginTop: 8 }}>
                    <Space wrap>
                      {(currentGame?.drawnNumbers || []).slice(-15).map((n) => (
                        <Tag key={n}>{n}</Tag>
                      ))}
                      {(currentGame?.drawnNumbers || []).length === 0 ? <Tag>ยังไม่มี</Tag> : null}
                    </Space>
                  </div>
                </div>
              </Space>

              <Divider />

              <Space align="center" wrap>
                <InputNumber
                  min={1}
                  max={10}
                  value={buyQuantity}
                  onChange={(v) => setBuyQuantity(Number(v || 1))}
                />
                <Button type="primary" onClick={handleBuyCards} loading={isGameLoading} disabled={!currentGame?.id}>
                  ซื้อการ์ด
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card title="การ์ดของฉัน" extra={<Tag>{myCards.length} ใบ</Tag>} loading={isGameLoading}>
              {myCards.length === 0 ? (
                <div>ยังไม่มีการ์ด — กด “ซื้อการ์ด” เพื่อเริ่มเล่น</div>
              ) : (
                <Row gutter={[12, 12]}>
                  {myCards.map((c) => (
                    <Col xs={24} sm={12} key={c.id}>
                      {renderCard(c)}
                    </Col>
                  ))}
                </Row>
              )}

              <Divider />

              <Space wrap>
                <Select
                  style={{ minWidth: 220 }}
                  value={selectedPattern}
                  options={patternOptions}
                  onChange={(v) => setSelectedPattern(v as BingoPattern)}
                />
                <Button type="primary" onClick={handleClaimBingo} disabled={!selectedCardId || !currentGame?.id}>
                  กด Bingo
                </Button>
                {selectedCard ? <Tag color="blue">Selected card: {selectedCard.id.slice(0, 6)}…</Tag> : null}
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </Layout>
  );
}
